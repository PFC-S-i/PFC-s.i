// src/services/news.service.ts
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
// Ajuste se o Render estiver em cold start
export const TIMEOUT_MS = 20_000;

/* -------------------------- Type Guards & Helpers -------------------------- */
type JsonRecord = Record<string, unknown>;

function isRecord(x: unknown): x is JsonRecord {
  return typeof x === "object" && x !== null;
}

function isAbortError(err: unknown): boolean {
  if (typeof DOMException !== "undefined" && err instanceof DOMException) {
    return err.name === "AbortError";
  }
  if (isRecord(err)) {
    const name = err["name"];
    const message = err["message"];
    return (
      (typeof name === "string" && name === "AbortError") ||
      (typeof message === "string" && message.includes("aborted"))
    );
  }
  return false;
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

function firstString(...vals: unknown[]): string | null {
  for (const v of vals) {
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

/* ------------------------------- URL resolver ------------------------------ */
function resolveUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${p}`;
}

/* ------------------------- Normalização de respostas ------------------------ */
function normalizeArray(json: unknown): unknown[] {
  if (Array.isArray(json)) return json;
  if (isRecord(json) && Array.isArray(json.items)) return json.items;
  if (isRecord(json) && Array.isArray(json.data)) return json.data;
  return [];
}

function toNewsItem(raw: unknown): NewsItem {
  const r: JsonRecord = isRecord(raw) ? raw : {};

  const title = firstString(r["title"], r["headline"]) ?? "";
  const link = firstString(r["link"], r["url"]) ?? "#";
  const source = firstString(r["source"], r["provider"], r["site"]) ?? "";
  const image = firstString(r["image"], r["image_url"], r["thumbnail"]);
  const published_at = firstString(r["published_at"], r["publishedAt"]);

  return {
    title,
    link,
    source,
    image: image ?? null,
    published_at: published_at ?? null,
  };
}

/* --------------------------------- Fetcher --------------------------------- */
async function apiFetchRaw(path: string, init?: RequestInit) {
  const url = resolveUrl(path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const isApi = path.startsWith("/api/") || path.startsWith("api/");

    const res = await fetch(url, {
      ...init,
      headers: {
        ...DEFAULT_HEADERS,
        ...(init?.headers ?? {}),
      },
      signal: init?.signal ?? controller.signal,
      cache: isApi ? "no-store" : init?.cache,
    });

    if (!res.ok) {
      // tenta extrair detalhes
      let details = "";
      try {
        const data: unknown = await res.json();
        details = typeof data === "string" ? data : JSON.stringify(data);
      } catch {
        try {
          const txt = await res.text();
          details = txt;
        } catch {
          // ignore
        }
      }
      throw new Error(
        `Erro HTTP ${res.status} ao chamar ${url}${
          details ? `: ${details}` : ""
        }`
      );
    }

    const parsed: unknown = await res.json();
    return parsed;
  } catch (err: unknown) {
    if (isAbortError(err)) {
      throw new Error(
        `Tempo esgotado (${TIMEOUT_MS}ms) ao chamar ${url} (AbortError)`
      );
    }
    throw toError(err);
  } finally {
    clearTimeout(timeout);
  }
}

/* --------------------------------- Public API -------------------------------- */
export async function getNews(init?: RequestInit): Promise<NewsItem[]> {
  const json = await apiFetchRaw("/api/news", {
    method: "GET",
    cache: "no-store",
    ...init,
  });

  const list = normalizeArray(json).map(toNewsItem);

  // (opcional) log leve para depuração
  if (process.env.NODE_ENV !== "production" && list.length === 0) {
     
    console.warn("[news.service] /api/news retornou vazio:", json);
  }
  return list;
}
