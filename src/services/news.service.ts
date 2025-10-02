export type NewsItem = {
  title: string;
  link: string;
  source: string;
  image?: string | null;
  published_at?: string | null;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
  "http://127.0.0.1:8000";

const DEFAULT_HEADERS: HeadersInit = { Accept: "application/json" };
export const TIMEOUT_MS = 12_000;

function resolveUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;

  if (p.startsWith("/api/")) return p;

  return `${BASE_URL}${p}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = resolveUrl(path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...DEFAULT_HEADERS,
        ...(init?.headers ?? {}),
      },
      signal: init?.signal ?? controller.signal,
      cache: url.startsWith("/api/") ? "no-store" : init?.cache,
    });

    if (!res.ok) {
      // tenta extrair detalhes de erro do backend/proxy
      let details = "";
      try {
        const data = await res.json();
        details = typeof data === "string" ? data : JSON.stringify(data);
      } catch {
        try {
          details = await res.text();
        } catch {}
      }
      throw new Error(
        `Erro HTTP ${res.status} ao chamar ${url}${
          details ? `: ${details}` : ""
        }`
      );
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    // Mensagem amigável para timeout/abort
    if (
      err instanceof DOMException &&
      (err.name === "AbortError" || err.message?.includes("aborted"))
    ) {
      throw new Error(
        `Tempo esgotado (${TIMEOUT_MS}ms) ao chamar ${url} (AbortError)`
      );
    }
    throw err instanceof Error ? err : new Error(String(err));
  } finally {
    clearTimeout(timeout);
  }
}

export async function getNews(init?: RequestInit): Promise<NewsItem[]> {
  return apiFetch<NewsItem[]>("/api/news", { method: "GET", ...init });
}
