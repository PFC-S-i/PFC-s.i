import { NextRequest, NextResponse } from "next/server";

type CGMarketsItem = {
  id: string;
  name: string;
  symbol?: string | null;
};

function isCGMarketsItem(u: unknown): u is CGMarketsItem {
  if (typeof u !== "object" || u === null) return false;
  const o = u as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.name === "string";
}

/** ===== In-memory cache simples (dev / server full) ===== */
type CoinRow = { id: string; name: string; symbol: string | null };
type CacheEntry = { data: CoinRow[]; exp: number };

const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

async function fetchWithRetry(
  url: URL,
  headers: Record<string, string>,
  tries = 2
): Promise<Response> {
  for (let i = 0; i <= tries; i++) {
    const r = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 },
    });
    if (r.status !== 429) return r;

    const retryAfter = Number(r.headers.get("retry-after") ?? "2");
    await new Promise((res) =>
      setTimeout(res, Math.min(5000, Math.max(1000, retryAfter * 1000)))
    );
  }
  // última tentativa mesmo depois do loop
  return fetch(url.toString(), { headers, next: { revalidate: 3600 } });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vs = (searchParams.get("vs") ?? "brl").trim();
  const count = Math.min(
    250,
    Math.max(1, Number(searchParams.get("count") ?? "20"))
  );
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const cacheKey = `${vs}:${count}:${page}`;
  const now = Date.now();

  // 1) cache quente
  const hit = cache.get(cacheKey);
  if (hit && now < hit.exp) {
    const res = NextResponse.json(hit.data);
    res.headers.set(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate=86400"
    );
    return res;
  }

  // 2) já tem uma requisição em andamento com essa chave
  const inflightHit = inflight.get(cacheKey);
  if (inflightHit) {
    const result = await inflightHit;
    const res = NextResponse.json(result.data);
    res.headers.set(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate=86400"
    );
    return res;
  }

  // 3) monta a chamada ao CoinGecko
  const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
  url.searchParams.set("vs_currency", vs);
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", String(count));
  url.searchParams.set("page", String(page));
  url.searchParams.set("sparkline", "false");

  const headers: Record<string, string> = { Accept: "application/json" };
  const key = process.env.COINGECKO_DEMO_API_KEY;
  if (key) headers["x-cg-demo-api-key"] = key; // header da demo key

  const pending = (async () => {
    const r = await fetchWithRetry(url, headers, 2);

    if (!r.ok) {
      // se tínhamos algo em cache, devolve "stale" rapidinho
      if (hit) {
        const staleRes = NextResponse.json(hit.data);
        staleRes.headers.set(
          "Cache-Control",
          "s-maxage=60, stale-while-revalidate=86400"
        );
        return { data: hit.data, exp: now + 60 * 1000 } as CacheEntry;
      }
      const text = await r.text();
      throw new Response(
        JSON.stringify({
          error: "coingecko_error",
          status: r.status,
          details: text.slice(0, 200),
        }),
        {
          status: 502,
          headers: { "content-type": "application/json" },
        }
      );
    }

    const raw = (await r.json()) as unknown;
    const items: CGMarketsItem[] = Array.isArray(raw)
      ? raw.filter(isCGMarketsItem)
      : [];
    const data: CoinRow[] = items.map((d) => ({
      id: d.id,
      name: d.name,
      symbol: d.symbol ?? null,
    }));

    const entry: CacheEntry = { data, exp: now + CACHE_TTL_MS };
    cache.set(cacheKey, entry);
    return entry;
  })();

  inflight.set(cacheKey, pending);

  try {
    const entry = await pending;
    const res = NextResponse.json(entry.data);
    res.headers.set(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate=86400"
    );
    return res;
  } catch (e: unknown) {
    if (e instanceof Response) {
      // já construímos uma Response lá em cima
      return e;
    }
    const detail =
      e instanceof Error ? e.message : typeof e === "string" ? e : "";
    return new NextResponse(
      JSON.stringify({
        error: "unexpected_error",
        details: detail,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  } finally {
    inflight.delete(cacheKey);
  }
}
