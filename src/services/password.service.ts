// src/services/password.service.ts

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

async function tryParseJson(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function toMessage(data: unknown, fallback: string): string {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    const d = obj.detail as unknown;
    if (typeof d === "string") return d;
    if (Array.isArray(d) && d[0] && typeof d[0] === "object") {
      const first = d[0] as Record<string, unknown>;
      if (typeof first.msg === "string") return first.msg;
    }
  }
  return fallback;
}

// Helper simples para header de auth (token no localStorage) + cookies (se backend usar cookie HttpOnly)
function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (typeof window !== "undefined") {
    // 🔧 AQUI O AJUSTE: procurar também por "auth_token"
    const token =
      localStorage.getItem("auth_token") || // principal
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function requestPasswordReset(
  email: string,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch(`${API}/api/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: email.trim() }),
    signal,
    credentials: "include",
  });

  if (!res.ok) {
    const data = await tryParseJson(res);
    throw new Error(
      toMessage(data, "Não foi possível enviar as instruções. Tente novamente.")
    );
  }

  const data = await tryParseJson(res);
  if (typeof data === "string") return data;
  return toMessage(
    data,
    "Se existir uma conta, enviaremos o link de redefinição."
  );
}

export async function resetPassword(
  token: string,
  newPassword: string,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch(`${API}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ token: token.trim(), new_password: newPassword }),
    signal,
    credentials: "include",
  });

  if (!res.ok) {
    const data = await tryParseJson(res);
    const fallback =
      res.status === 400
        ? "Token inválido ou expirado. Solicite um novo link."
        : "Não foi possível redefinir a senha. Tente novamente.";
    throw new Error(toMessage(data, fallback));
  }

  const data = await tryParseJson(res);
  if (typeof data === "string") return data;
  return toMessage(data, "Senha redefinida com sucesso.");
}

// alterar senha autenticado
export async function changePassword(
  oldPassword: string,
  newPassword: string,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API}/api/auth/change-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
    signal,
    credentials: "include", // envia cookies se o backend usar sessão/cookie
  });

  // Sucesso do seu backend: 204 (No Content)
  if (res.status === 204) return;

  const data = await tryParseJson(res);
  if (res.status === 401) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }
  if (!res.ok) {
    throw new Error(toMessage(data, "Não foi possível alterar a senha."));
  }
}
