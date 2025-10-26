// src/services/favorites.service.ts

export type FavoriteDTO = {
  id: string;
  coin_id: string;
  user_id: string;
  created_at: string;
};

// mesma base usada no login
const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

// pega token salvo no login
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

// monta headers com Authorization se tiver token
function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getToken();
  const base: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    base.Authorization = `Bearer ${token}`;
  }

  if (extra) {
    const h = new Headers(extra);
    h.forEach((v, k) => {
      base[k] = v;
    });
  }

  return base;
}

// helper pra erro mais claro
async function assertOk(res: Response, ctx: string) {
  if (res.ok) return res;

  let detail = "";
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") detail = data.detail;
    else if (Array.isArray(data?.detail) && data.detail[0]?.msg)
      detail = String(data.detail[0].msg);
  } catch {
    const txt = await res.text();
    if (txt) detail = txt;
  }

  const suffix = detail ? ` – ${detail}` : "";
  throw new Error(`${ctx} ${res.status}${suffix}`);
}

/**
 * GET /api/favorites
 * retorna Set<coin_id>
 */
export async function listFavorites(): Promise<Set<string>> {
  const res = await fetch(`${API_URL}/api/favorites`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });

  if (res.status === 401) {
    // usuário sem login => sem favoritos
    return new Set();
  }

  await assertOk(res, "GET /api/favorites");

  const items = (await res.json()) as FavoriteDTO[];
  return new Set(items.map((f) => f.coin_id));
}

/**
 * POST /api/favorites { coin_id }
 */
export async function addFavorite(
  coin_id: string
): Promise<FavoriteDTO | null> {
  const res = await fetch(`${API_URL}/api/favorites`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ coin_id }),
  });

  if (res.status === 401) {
    throw new Error("Não autenticado");
  }

  if (res.status === 409) {
    // já existe
    return null;
  }

  await assertOk(res, "POST /api/favorites");

  const item = (await res.json()) as FavoriteDTO;
  return item;
}

/**
 * DELETE /api/favorites/{coin_id}
 */
export async function removeFavorite(coin_id: string): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/favorites/${encodeURIComponent(coin_id)}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );

  if (res.status === 401) {
    throw new Error("Não autenticado");
  }

  if (res.status === 204) {
    return;
  }

  await assertOk(res, "DELETE /api/favorites/:coin_id");
}
