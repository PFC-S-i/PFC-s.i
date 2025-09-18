// src/services/login.service.ts
// Service responsável por autenticar o usuário via rota proxy do Next.js
// (src/app/api/login/route.ts), salvar o JWT e expor helpers para usá-lo.

export type LoginRequest = {
  email: string;
  password: string;
  name?: string; // opcional, aparece no schema do backend
};

export type LoginResponse = {
  access_token: string;
};

// chave usada no localStorage
const TOKEN_KEY = "auth_token";

// timeout maior por causa de possíveis cold starts no Render
const TIMEOUT_MS = 60_000;

/** Salva o token no localStorage (client-side). */
export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/** Lê o token do localStorage. */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Remove o token do localStorage (logout). */
export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/** Retorna o header Authorization com o token atual (se existir). */
export function getAuthHeader() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Faz login usando o PROXY do Next.js.
 * - Chama: POST /api/login  (que por sua vez chama ${NEXT_PUBLIC_API_URL}/auth/login)
 * - Body: { email, password, name? }
 * - Resposta esperada: { access_token }
 */
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  // usa sempre o proxy para evitar CORS
  const url = `/api/login`;

  // timeout simples
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // tenta decodificar JSON mesmo em erro (FastAPI pode trazer detail)
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      let message = "Não foi possível entrar. Verifique suas credenciais.";
      const detail = (data as any)?.detail;
      if (Array.isArray(detail) && detail[0]?.msg) message = detail[0].msg;
      else if (typeof detail === "string") message = detail;
      throw new Error(message);
    }

    const { access_token } = data as LoginResponse;
    if (!access_token) {
      throw new Error("Resposta inválida do servidor (sem access_token).");
    }

    setAuthToken(access_token);
    return { access_token };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Tempo de requisição excedido. Tente novamente.");
    }
    throw new Error(err?.message || "Erro ao efetuar login.");
  } finally {
    clearTimeout(timeout);
  }
}
