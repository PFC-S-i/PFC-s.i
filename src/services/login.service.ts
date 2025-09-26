"use client";

export type LoginRequest = { email: string; password: string; name?: string };
export type LoginResponse = { access_token: string };
export type AuthUser = { id?: string; email?: string; name?: string };

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const setAuthToken = (t: string) => {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t);
};
export const getAuthToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
export const clearAuthToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
};

export const setAuthUser = (u: AuthUser) => {
  if (typeof window !== "undefined")
    localStorage.setItem(USER_KEY, JSON.stringify(u));
};
export const getAuthUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};
export const clearAuthUser = () => {
  if (typeof window !== "undefined") localStorage.removeItem(USER_KEY);
};

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;

    const b64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "===".slice((b64.length + 3) % 4);

    try {
      return JSON.parse(atob(padded));
    } catch {
      const bin = atob(padded);
      const utf8 = decodeURIComponent(
        Array.from(
          bin,
          (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")
        ).join("")
      );
      return JSON.parse(utf8);
    }
  } catch {
    return null;
  }
}

function isExpired(payload: Record<string, unknown> | null): boolean {
  const exp =
    typeof payload?.["exp"] === "number"
      ? (payload["exp"] as number)
      : undefined;
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now;
}

export function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const anyErr = err as Record<string, unknown>;
    if (typeof anyErr.message === "string") return anyErr.message;
    if (typeof anyErr.detail === "string") return anyErr.detail;
    if (Array.isArray(anyErr.detail) && anyErr.detail.length > 0) {
      const first = anyErr.detail[0] as Record<string, unknown>;
      if (typeof first?.msg === "string") return first.msg;
    }
  }
  return "Não foi possível completar a ação. Tente novamente.";
}

export async function login({
  email,
  password,
}: LoginRequest): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let message = `Erro ${res.status} ao autenticar.`;
    try {
      const data = await res.json();
      if (typeof data?.message === "string") message = data.message;
      else if (typeof data?.detail === "string") message = data.detail;
      else if (Array.isArray(data?.detail) && data.detail[0]?.msg)
        message = String(data.detail[0].msg);
    } catch {
      const txt = await res.text();
      if (txt) message = txt;
    }
    throw new Error(message);
  }

  const data = (await res.json()) as LoginResponse;
  if (!data?.access_token)
    throw new Error("Resposta inválida: access_token ausente.");

  setAuthToken(data.access_token);

  const payload = decodeJwt(data.access_token);
  if (isExpired(payload)) {
    logout();
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const user: AuthUser = {
    id:
      typeof payload?.["sub"] === "string"
        ? (payload["sub"] as string)
        : undefined,
    email:
      typeof payload?.["email"] === "string"
        ? (payload["email"] as string)
        : undefined,
    name:
      typeof payload?.["name"] === "string"
        ? (payload["name"] as string)
        : undefined,
  };

  setAuthUser(user);
  return user;
}

export function logout() {
  clearAuthToken();
  clearAuthUser();
}
