// src/services/http.service.ts
/**
 * Cliente HTTP centralizado (front → backend FastAPI via NEXT_PUBLIC_API_URL).
 * Usa fetch e normaliza mensagens de erro.
 */

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class RateLimitError extends Error {
  retryAfterMs?: number;
  constructor(message = "Too Many Requests", retryAfterMs?: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

const API = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

/** Tenta extrair uma mensagem útil do payload de erro do backend */
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

async function tryParseJson(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * apiFetch: chama o backend (aceita caminho relativo ou URL absoluta)
 * - Encaminha body/headers/signal
 * - Trata 401 com UnauthorizedError
 * - Tenta parsear JSON de erro para mensagem amigável
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isAbs = /^https?:\/\//i.test(path);
  const url = isAbs ? path : `${API}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (res.status === 429) {
  // tenta respeitar Retry-After (segundos ou data HTTP)
  const ra = res.headers.get("retry-after");
  let retryMs: number | undefined;
  if (ra) {
    const n = Number(ra);
    if (Number.isFinite(n)) retryMs = Math.max(0, n * 1000);
    else {
      const t = Date.parse(ra);
      if (!Number.isNaN(t)) retryMs = Math.max(0, t - Date.now());
    }
  }
  throw new RateLimitError("Limite de requisições atingido", retryMs);
}

  if (res.ok) {
    // tenta JSON; se não for JSON, retorna como any
    const data = await tryParseJson(res);
    return (data as T) ?? (undefined as unknown as T);
  }

  // Erros
  if (res.status === 401) {
    throw new UnauthorizedError();
  }

  const data = await tryParseJson(res);
  const msg = toMessage(data, `HTTP ${res.status}`);
  throw new Error(msg);
}
