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

function toLabel(name: string, symbol?: string | null) {
  const s =
    typeof symbol === "string" && symbol.length
      ? ` (${symbol.toUpperCase()})`
      : "";
  return `${name}${s}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vs = (searchParams.get("vs") ?? "brl").trim();
  const count = Math.min(
    250,
    Math.max(1, Number(searchParams.get("count") ?? "20"))
  );
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
  url.searchParams.set("vs_currency", vs);
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", String(count));
  url.searchParams.set("page", String(page));
  url.searchParams.set("sparkline", "false");

  const headers: Record<string, string> = { Accept: "application/json" };
  const key = process.env.COINGECKO_DEMO_API_KEY;
  if (key) headers["x-cg-demo-api-key"] = key;

  const r = await fetch(url.toString(), {
    headers,
    next: { revalidate: 3600 },
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
  const items: CGMarketsItem[] = Array.isArray(raw)
    ? raw.filter(isCGMarketsItem)
    : [];

  const options = items.map((d) => ({
    id: d.id,
    label: toLabel(d.name, d.symbol ?? null),
  }));

  const res = NextResponse.json(options);
  res.headers.set(
    "Cache-Control",
    "s-maxage=3600, stale-while-revalidate=86400"
  );
  return res;
}
