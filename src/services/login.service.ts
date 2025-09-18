// src/services/login.service.ts
export type LoginRequest = { email: string; password: string; name?: string };
export type LoginResponse = { access_token: string };

type DecodedJwt = {
  name?: string;
  email?: string;
  sub?: string;
  [k: string]: unknown;
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// ========= helpers de storage =========
export function setAuthToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}
export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function clearAuthToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

export type AuthUser = { name?: string; email?: string; id?: string };
export function setAuthUser(user: AuthUser) {
  if (typeof window !== "undefined")
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
export function clearAuthUser() {
  if (typeof window !== "undefined") localStorage.removeItem(USER_KEY);
}

// ========= utils =========
function decodeJwt<T = DecodedJwt>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:changed"));
  }
}

// -------- tipos/guards para lidar com `detail` da API --------
type ApiDetailArrayItem = { msg?: string; [k: string]: unknown };
type ApiErrorDetail = string | ApiDetailArrayItem[] | unknown;

function isDetailArray(detail: ApiErrorDetail): detail is ApiDetailArrayItem[] {
  return Array.isArray(detail);
}

function isStringDetail(detail: ApiErrorDetail): detail is string {
  return typeof detail === "string";
}

type ApiMaybeError = Partial<Record<"detail", ApiErrorDetail>>;

// ========= ações =========
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  // sem timeout para não abortar durante cold start do backend
  const res = await fetch(`/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    let message = "Não foi possível entrar. Verifique suas credenciais.";
    const detail = (data as ApiMaybeError).detail;

    if (isDetailArray(detail) && detail[0]?.msg) {
      message = detail[0].msg ?? message;
    } else if (isStringDetail(detail)) {
      message = detail;
    }

    throw new Error(message);
  }

  const { access_token } = (data as LoginResponse) ?? {};
  if (!access_token) {
    throw new Error("Resposta inválida do servidor (sem access_token).");
  }

  setAuthToken(access_token);

  const decoded = decodeJwt<DecodedJwt>(access_token);
  setAuthUser({
    name: decoded?.name,
    email: decoded?.email ?? payload.email,
    id: decoded?.sub,
  });

  // avisa o Provider/Header na MESMA aba
  notifyAuthChanged();

  return { access_token };
}

export function logout() {
  clearAuthToken();
  clearAuthUser();
  notifyAuthChanged(); // avisa a UI
}

export function getAuthHeader(): Record<string, string> {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
