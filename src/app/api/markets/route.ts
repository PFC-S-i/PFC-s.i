import { NextRequest, NextResponse } from "next/server";

type CGMarketDetail = {
  id: string;
  name: string;
  symbol: string;
  image?: string | null;
  current_price?: number | null;
  market_cap?: number | null;
  price_change_percentage_24h?: number | null;
};

function isCGMarketDetail(u: unknown): u is CGMarketDetail {
  if (typeof u !== "object" || u === null) return false;
  const o = u as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.symbol === "string"
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const vs = (searchParams.get("vs") ?? "brl").trim();

  // Se vier 'ids', usa ids; senão, usa Top N (default 20)
  const idsParam = (searchParams.get("ids") ?? "").trim();
  const hasIds = idsParam.length > 0;

  const count = Math.min(
    250,
    Math.max(1, Number(searchParams.get("count") ?? "20"))
  );
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const selectedIds = hasIds
    ? idsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const perPage = hasIds ? Math.min(250, selectedIds.length) : count;

  const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
  url.searchParams.set("vs_currency", vs);
  if (hasIds) url.searchParams.set("ids", selectedIds.join(","));
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  url.searchParams.set("sparkline", "false");
  url.searchParams.set("price_change_percentage", "24h");

  const headers: Record<string, string> = { Accept: "application/json" };
  const key = process.env.COINGECKO_DEMO_API_KEY;
  if (key) headers["x-cg-demo-api-key"] = key;

  try {
    const r = await fetch(url.toString(), {
      headers,
      next: { revalidate: 30 },
    });
    if (!r.ok) {
      const text = await r.text();
      return new NextResponse(
        JSON.stringify({
          error: "coingecko_error",
          status: r.status,
          details: text.slice(0, 200),
        }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    const raw = (await r.json()) as unknown;
    const items: CGMarketDetail[] = Array.isArray(raw)
      ? raw.filter(isCGMarketDetail)
      : [];

    const data = items.map((d) => ({
      id: d.id,
      symbol: d.symbol.toUpperCase(),
      name: d.name,
      image: d.image ?? "",
      current_price: d.current_price ?? null,
      market_cap: d.market_cap ?? null,
      price_change_percentage_24h: d.price_change_percentage_24h ?? null,
    }));

    const res = NextResponse.json(data);
    res.headers.set("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unexpected_error";
    return new NextResponse(
      JSON.stringify({ error: "fetch_failed", details: message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
