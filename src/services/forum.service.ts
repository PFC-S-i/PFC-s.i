// src/services/forum.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ForumPost } from "@/types/forum";

/** =========================
 *  HTTP base + helpers
 *  =======================*/
const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function buildHeaders(init?: RequestInit): HeadersInit {
  const base: Record<string, string> = { "Content-Type": "application/json" };

  if (init?.headers) {
    const h = init.headers as HeadersInit;
    if (h instanceof Headers) h.forEach((v, k) => (base[k] = String(v)));
    else if (Array.isArray(h)) for (const [k, v] of h) base[k] = String(v);
    else if (typeof h === "object" && h)
      Object.assign(base, h as Record<string, string>);
  }

  const token = getAuthToken();
  if (token) base.Authorization = `Bearer ${token}`;
  return base;
}

async function http<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API}${path}`;
  const res = await fetch(url, { ...init, headers: buildHeaders(init) });

  const raw = await res.text();
  const maybeJSON = raw ? safeParseJSON(raw) : null;

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    if (maybeJSON && typeof maybeJSON === "object") {
      const d = (maybeJSON as any).detail;
      if (Array.isArray(d)) msg = d[0]?.msg ?? msg;
      else if (typeof d === "string") msg = d;
    } else if (typeof raw === "string" && raw.trim().length) {
      msg = raw;
    }
    throw new Error(msg);
  }

  if (!raw) return undefined as unknown as T; // 204 / sem corpo
  return maybeJSON as T;
}

function safeParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** =========================
 *  Tipos do domínio
 *  =======================*/
export type Me = { id: string; email: string; name?: string | null };

export type VoteResponse = {
  event_id: string;
  value: -1 | 0 | 1;
  likes_count: number;
  dislikes_count: number;
};

export type ApiEvent = {
  id: string;
  user_id: string;
  user_name?: string | null;
  title: string;
  description: string;
  coin_id: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at: string; // ISO
  updated_at?: string | null;
  likes_count?: number;
  dislikes_count?: number;
  ai_label?: "crypto" | "offtopic" | "uncertain" | null;
  ai_score?: number | null;
  ai_version?: string | null;
};

export type EventsListResponse = {
  items: ApiEvent[];
  // o back retorna "meta", mas mantemos "count" opcional p/ compat:
  meta?: { page: number; page_size: number; total: number };
  count?: number;
};

export type CreateEventInput = {
  title: string;
  description: string;
  coin_id: string;
  starts_at?: string; // ISO UTC
  ends_at?: string;   // ISO UTC
};

export type UpdateEventInput = CreateEventInput;

export type CoinOption = { id: string; name: string; symbol: string };
type ApiList<T> = { items: T[]; count?: number };
type MarketLite = { id: string; name: string; symbol: string };

/** Mapeia o EventOut do back para o ForumPost (modelo usado no front) */
export function toForumPost(e: ApiEvent): ForumPost {
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? "",
    author: e.user_name?.trim?.() || "Usuário",
    createdAt: e.created_at ?? new Date().toISOString(),
    likes: typeof e.likes_count === "number" ? e.likes_count : 0,
    dislikes: typeof e.dislikes_count === "number" ? e.dislikes_count : 0,
  };
}

/** =========================
 *  Services (API)
 *  =======================*/

export async function getMe(): Promise<Me> {
  return http<Me>("/api/users/me", { method: "GET" });
}

export async function listEvents(
  params: {
    q?: string | null;
    coin_id?: string | null;
    from?: string | null;
    to?: string | null;
    page?: number;
    page_size?: number;
    sort?: string;
  } = {}
): Promise<EventsListResponse> {
  const q = new URLSearchParams();
  if (params.q) q.set("q", params.q);
  if (params.coin_id) q.set("coin_id", params.coin_id);
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  if (params.page) q.set("page", String(params.page));
  if (params.page_size) q.set("page_size", String(params.page_size));
  if (params.sort) q.set("sort", params.sort);
  const qs = q.toString() ? `?${q.toString()}` : "";
  return http<EventsListResponse>(`/api/events${qs}`, { method: "GET" });
}

export async function getEvent(id: string): Promise<ApiEvent> {
  return http<ApiEvent>(`/api/events/${id}`, { method: "GET" });
}

/**
 * Cria evento garantindo que starts_at e ends_at SEMPRE sejam enviados.
 * - Se o chamador não passar datas, usamos nowIso para ambos.
 * - Se passar apenas starts_at, usamos o mesmo valor em ends_at (compatibilidade com back que exige os dois).
 */
export async function createEvent(input: CreateEventInput): Promise<ApiEvent> {
  const nowIso = new Date().toISOString();

  const payload = {
    title: (input.title ?? "").trim(),
    description: (input.description ?? "").trim(),
    coin_id: input.coin_id,
    starts_at: input.starts_at ?? nowIso,
    ends_at: input.ends_at ?? input.starts_at ?? nowIso,
  };

  return http<ApiEvent>("/api/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEvent(
  id: string,
  input: UpdateEventInput
): Promise<ApiEvent> {
  // Para PATCH, enviamos só o que fizer sentido — mas se o back exigir ambas as datas,
  // mantemos a mesma regra do create.
  const nowIso = new Date().toISOString();
  const body: Record<string, unknown> = {
    title: input.title?.trim(),
    description: input.description?.trim(),
    coin_id: input.coin_id,
  };

  if (input.starts_at || input.ends_at) {
    body.starts_at = input.starts_at ?? nowIso;
    body.ends_at = input.ends_at ?? input.starts_at ?? nowIso;
  }

  return http<ApiEvent>(`/api/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await http<void>(`/api/events/${id}`, { method: "DELETE" });
}

/** ========= Likes / Dislikes (rotas oficiais do seu back) ========= */
export async function likeEvent(id: string): Promise<VoteResponse> {
  return http<VoteResponse>(`/api/events/${id}/like`, { method: "POST" });
}
export async function dislikeEvent(id: string): Promise<VoteResponse> {
  return http<VoteResponse>(`/api/events/${id}/dislike`, { method: "POST" });
}

/** =========================
 *  Outros
 *  =======================*/
export async function topCoins(limit = 20): Promise<CoinOption[]> {
  const res = await http<ApiList<MarketLite>>(
    `/api/prices/top?limit=${encodeURIComponent(String(limit))}`,
    { method: "GET" }
  );
  return (res.items || []).map((m) => ({
    id: m.id,
    name: m.name,
    symbol: (m.symbol || "").toUpperCase(),
  }));
}
