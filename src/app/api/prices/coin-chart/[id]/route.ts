// src/app/api/prices/coin-chart/[id]/route.ts
import { NextResponse } from "next/server";

export const revalidate = 120; // 2 min de cache em edge/CDN
const MAX_HOURS = 24 * 31;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

async function fetchWithRetry(
  url: URL,
  headers: Record<string, string>,
  tries = 2
) {
  for (let i = 0; i <= tries; i++) {
    const r = await fetch(url.toString(), { headers, next: { revalidate } });
    if (r.status !== 429) return r;
    const retryAfter = Number(r.headers.get("retry-after") ?? "2");
    await new Promise((res) =>
      setTimeout(res, clamp(retryAfter * 1000, 1000, 5000))
    );
  }
  return fetch(url.toString(), { headers, next: { revalidate } });
}

type RouteParams = { id: string };

export async function GET(
  req: Request, // <- use o Request nativo
  { params }: { params: RouteParams } // <- contexto com params (sem Promise)
) {
  const id = params.id;
  const { searchParams } = new URL(req.url);
  const vs = (searchParams.get("vs") ?? "brl").toLowerCase();
  const hours = clamp(Number(searchParams.get("hours") ?? "24"), 1, MAX_HOURS);

  const to = Math.floor(Date.now() / 1000);
  const from = to - hours * 3600;

  const url = new URL(
    `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(
      id
    )}/market_chart/range`
  );
  url.searchParams.set("vs_currency", vs);
  url.searchParams.set("from", String(from));
  url.searchParams.set("to", String(to));

  const headers: Record<string, string> = { Accept: "application/json" };
  const key = process.env.COINGECKO_DEMO_API_KEY;
  if (key) headers["x-cg-demo-api-key"] = key;

  const r = await fetchWithRetry(url, headers, 2);
  if (!r.ok) {
    const text = await r.text();
    return new NextResponse(
      JSON.stringify({
        error: "coingecko_error",
        status: r.status,
        details: text.slice(0, 300),
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  const raw = (await r.json()) as { prices?: [number, number][] };
  const prices = Array.isArray(raw?.prices) ? raw.prices : [];
  const items = prices.map(([t, price]) => ({
    t: Number(t),
    price: Number(price),
  }));

  const res = NextResponse.json({ items });
  res.headers.set(
    "Cache-Control",
    `s-maxage=${revalidate}, stale-while-revalidate=3600`
  );
  return res;
}
