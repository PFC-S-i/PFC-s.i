export type NewsItem = {
  title: string;
  link: string;
  source: string;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
  "http://localhost:8000";

const DEFAULT_HEADERS: HeadersInit = {
  Accept: "application/json",
};

/** Tempo máximo de espera por resposta (ms) */
const TIMEOUT_MS = 12_000;

/**
 * Função utilitária que faz fetch com timeout e trata erros de rede/HTTP.
 */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Garante que não teremos // duplo na URL final
  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  // Timeout (permite sobrescrever via init.signal se vier de fora)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...DEFAULT_HEADERS,
        ...(init?.headers ?? {}),
      },
      // Se o caller já passar um signal, priorizamos ele; senão usamos o nosso
      signal: init?.signal ?? controller.signal,
      // Em páginas Server Components você pode querer cachear/revalidar:
      // next: { revalidate: 300 }, // descomente se for usar no server
    });

    if (!res.ok) {
      // Tenta extrair mensagem de erro do corpo (se houver)
      let details = "";
      try {
        const data = await res.json();
        details = typeof data === "string" ? data : JSON.stringify(data);
      } catch {
        // ignore
      }
      throw new Error(
        `Erro HTTP ${res.status} ao chamar ${url}${
          details ? `: ${details}` : ""
        }`
      );
    }

    // Tipagem genérica T
    return (await res.json()) as T;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error(`Requisição para ${url} expirou após ${TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * GET /news/
 * Retorna a lista de notícias no formato:
 * [{ title: string, link: string, source: string }]
 */
export async function getNews(init?: RequestInit): Promise<NewsItem[]> {
  return apiFetch<NewsItem[]>("/news/", {
    method: "GET",
    ...init,
  });
}
