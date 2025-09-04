// src/lib/api.ts
const BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_API_URL ||
  "http://localhost:8000"
).replace(/\/+$/, ""); // remove barra(s) no final

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = BASE_URL + (path.startsWith("/") ? path : `/${path}`);
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erro ${res.status} ao buscar ${url}: ${text}`);
  }
  return res.json() as Promise<T>;
}
