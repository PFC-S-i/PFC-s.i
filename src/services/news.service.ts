// services/news.service.ts

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  image?: string | null;
  published_at?: string | null;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
  "http://localhost:8000";

const DEFAULT_HEADERS: HeadersInit = { Accept: "application/json" };
const TIMEOUT_MS = 12_000;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
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
    });

    if (!res.ok) {
      let details = "";
      try {
        const data = await res.json();
        details = typeof data === "string" ? data : JSON.stringify(data);
      } catch {}
      throw new Error(
        `Erro HTTP ${res.status} ao chamar ${url}${
          details ? `: ${details}` : ""
        }`
      );
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/** GET /news/ */
export async function getNews(init?: RequestInit): Promise<NewsItem[]> {
  return apiFetch<NewsItem[]>("/news/", { method: "GET", ...init });
}
