import type { ForumPost } from "@/types/forum";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth_token");
}

function buildHeaders(init?: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (init?.headers) {
    const h = init.headers as HeadersInit;
    if (h instanceof Headers) {
      h.forEach((v, k) => (headers[k] = String(v)));
    } else if (Array.isArray(h)) {
      for (const [k, v] of h) headers[k] = String(v);
    } else {
      Object.assign(headers, h as Record<string, string>);
    }
  }

  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

type JsonUnknown = unknown;

function extractErrorDetail(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const maybe = payload as { detail?: unknown };
    if (typeof maybe.detail === "string") return maybe.detail;
  }
  return null;
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: buildHeaders(init),
    credentials: "include",
  });

  const text = await res.text();
  const data: JsonUnknown = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const detail = extractErrorDetail(data);
    const message = detail ?? `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return data as T;
}

function q(
  params: Record<string, string | number | boolean | null | undefined>
) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === "") continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export type Me = {
  id: string;
  name: string | null;
  email: string;
};

export type EventItem = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  coin_id: string | null;
  starts_at: string;
  ends_at: string | null;
  likes_count: number;
  dislikes_count: number;
  created_at: string;
  updated_at: string;
};

export type EventsListResponse = {
  items: EventItem[];
  meta: { page: number; page_size: number; total: number };
};

export type CreateEventInput = {
  title: string;
  description: string;
  coin_id: string;
  starts_at?: string; // default = now
  ends_at?: string | null;
};

export type CoinOption = {
  id: string;
  symbol: string;
  name: string;
  image?: string | null;
};

/** Estrutura “crua” que pode vir dos endpoints de moedas */
type RawCoin = {
  id?: unknown;
  coin_id?: unknown;
  symbol?: unknown;
  name?: unknown;
  image?: unknown;
};

function toCoinOptionUnknown(it: unknown): CoinOption {
  const o = (typeof it === "object" && it !== null ? it : {}) as Record<
    string,
    unknown
  >;
  const idRaw = o["id"];
  const coinIdRaw = o["coin_id"];
  const symbolRaw = o["symbol"];
  const nameRaw = o["name"];
  const imageRaw = o["image"];

  const id =
    typeof idRaw === "string" || typeof idRaw === "number"
      ? String(idRaw)
      : typeof coinIdRaw === "string" || typeof coinIdRaw === "number"
      ? String(coinIdRaw)
      : "";

  const symbol = typeof symbolRaw === "string" ? symbolRaw.toUpperCase() : "";
  const name = typeof nameRaw === "string" ? nameRaw : "";
  const image = typeof imageRaw === "string" ? imageRaw : null;

  return { id, symbol, name, image };
}

export async function getMe(): Promise<Me> {
  return http<Me>("/api/users/me");
}

export async function createEvent(input: CreateEventInput): Promise<EventItem> {
  const payload = {
    title: input.title.trim(),
    description: input.description.trim(),
    coin_id: input.coin_id,
    starts_at: input.starts_at ?? new Date().toISOString(),
    ends_at: input.ends_at ?? null,
  };
  return http<EventItem>("/api/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listEvents(params?: {
  q?: string | null;
  coin_id?: string | null;
  from?: string | null;
  to?: string | null;
  page?: number;
  page_size?: number;
  sort?: string;
}): Promise<EventsListResponse> {
  const query = q({
    q: params?.q ?? null,
    coin_id: params?.coin_id ?? null,
    from: params?.from ?? null,
    to: params?.to ?? null,
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 20,
    sort: params?.sort ?? "starts_at:asc",
  });
  return http<EventsListResponse>(`/api/events${query}`);
}

export async function searchCoins(query: string): Promise<CoinOption[]> {
  const qs = q({ query });
  const data = await http<unknown>(`/api/prices/coins/search${qs}`);
  const items = Array.isArray(data) ? (data as unknown[]) : [];
  return items.map(toCoinOptionUnknown);
}

export async function topCoins(per_page = 20): Promise<CoinOption[]> {
  const qs = q({ per_page });
  const data = await http<unknown>(`/api/prices/markets${qs}`);
  const items = Array.isArray(data) ? (data as unknown[]) : [];
  return items.map(toCoinOptionUnknown);
}
export function toForumPost(e: EventItem): ForumPost {
  const post: ForumPost = {
    id: e.id,
    title: e.title,
    description: e.description,
    author: "Usuário",
    createdAt: e.created_at,
  };
  return post;
}

export function toForumPosts(res: EventsListResponse): ForumPost[] {
  return res.items.map(toForumPost);
}
