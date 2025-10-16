// src/services/favorites.service.ts
export type FavoriteDTO = {
  id: string;
  coin_id: string;
  user_id: string;
  created_at: string;
};

const RAW_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
const BASE = RAW_BASE.replace(/\/+$/, ""); // remove "/" no final

function buildUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  // evita "/api/api/..."
  if (BASE && BASE.endsWith("/api") && p.startsWith("/api/")) {
    return `${BASE}${p.replace(/^\/api/, "")}`;
  }
  return `${BASE}${p}`;
}

const baseInit: RequestInit = {
  credentials: "include", // envia cookies (se usar sessão via cookie)
  headers: { Accept: "application/json" },
};

function withAuth(init: RequestInit = {}): RequestInit {
  const headers = new Headers(baseInit.headers);
  if (init.headers) {
    new Headers(init.headers).forEach((v, k) => headers.set(k, v));
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return { ...baseInit, ...init, headers };
}

async function assertOk(res: Response, ctx: string) {
  if (res.ok) return res;
  const txt = await res.text().catch(() => "");
  throw new Error(`${ctx} ${res.status}${txt ? ` – ${txt}` : ""}`);
}

// src/services/favorites.service.ts

export async function listFavorites(): Promise<Set<string>> {
  const endpoint = buildUrl("/api/favorites");

  // 🔧 use withAuth para incluir Authorization + cookies
  const res = await fetch(
    endpoint,
    withAuth({ method: "GET", cache: "no-store" })
  );

  if (res.status === 401) {
    // se preferir, lance erro para o componente exibir "faça login"
    // throw new Error("Não autenticado");
    return new Set(); // ou mantenha esse comportamento
  }

  await assertOk(res, `GET ${endpoint}`);
  const items = (await res.json()) as FavoriteDTO[];
  return new Set(items.map((f) => f.coin_id));
}

export async function addFavorite(
  coin_id: string
): Promise<FavoriteDTO | null> {
  const endpoint = buildUrl("/api/favorites");
  const res = await fetch(
    endpoint,
    withAuth({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coin_id }),
    })
  );

  if (res.status === 401) throw new Error("Não autenticado");
  if (res.status === 409) return null; // já favoritado
  await assertOk(res, `POST ${endpoint}`);

  return (await res.json()) as FavoriteDTO;
}

export async function removeFavorite(coin_id: string): Promise<void> {
  const endpoint = buildUrl(`/api/favorites/${encodeURIComponent(coin_id)}`);
  const res = await fetch(endpoint, withAuth({ method: "DELETE" }));

  if (res.status === 401) throw new Error("Não autenticado");
  if (res.status === 204) return;
  await assertOk(res, `DELETE ${endpoint}`);
}
