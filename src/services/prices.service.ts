// src/services/prices.service.ts
import { apiFetch, RateLimitError } from "@/services/http.service";

export type CoinOption = { id: string; symbol: string; name: string };

// ===== lista de fallback (offline) =====
const COMMON_COINS: CoinOption[] = [
  { id: "bitcoin",     symbol: "btc",  name: "Bitcoin" },
  { id: "ethereum",    symbol: "eth",  name: "Ethereum" },
  { id: "tether",      symbol: "usdt", name: "Tether" },
  { id: "usd-coin",    symbol: "usdc", name: "USD Coin" },
  { id: "binancecoin", symbol: "bnb",  name: "BNB" },
  { id: "solana",      symbol: "sol",  name: "Solana" },
  { id: "ripple",      symbol: "xrp",  name: "XRP" },
  { id: "cardano",     symbol: "ada",  name: "Cardano" },
  { id: "dogecoin",    symbol: "doge", name: "Dogecoin" },
  { id: "tron",        symbol: "trx",  name: "TRON" },
  { id: "toncoin",     symbol: "ton",  name: "Toncoin" },
  { id: "polkadot",    symbol: "dot",  name: "Polkadot" },
  { id: "chainlink",   symbol: "link", name: "Chainlink" },
  { id: "matic-network", symbol: "matic", name: "Polygon (MATIC)" },
  { id: "litecoin",    symbol: "ltc",  name: "Litecoin" },
  { id: "avalanche-2", symbol: "avax", name: "Avalanche" },
  { id: "uniswap",     symbol: "uni",  name: "Uniswap" },
  { id: "stellar",     symbol: "xlm",  name: "Stellar" },
  { id: "aptos",       symbol: "apt",  name: "Aptos" },
  { id: "arbitrum",    symbol: "arb",  name: "Arbitrum" },
];

function normalizeCoins(raw: any): CoinOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((c) => {
      const id = String(c?.id ?? c?.coin_id ?? "").trim();
      const symbol = String(c?.symbol ?? c?.ticker ?? "").trim();
      const name = String(c?.name ?? c?.full_name ?? c?.title ?? "").trim();
      if (!id || !name) return null;
      return { id, symbol, name };
    })
    .filter(Boolean) as CoinOption[];
}

// ===== cache em memória + localStorage =====
const TOP_TTL_MS = 2 * 60 * 1000; // 2 min
const LS_KEY = "prices_top_v1";

let _topCache: { at: number; data: CoinOption[] } | null = null;
let _topInflight: Promise<CoinOption[]> | null = null;

function lsRead(): { at: number; data: CoinOption[] } | null {
  try {
    const txt = localStorage.getItem(LS_KEY);
    if (!txt) return null;
    const obj = JSON.parse(txt) as { at: number; data: CoinOption[] };
    if (!obj?.at || !Array.isArray(obj?.data)) return null;
    if (Date.now() - obj.at > TOP_TTL_MS) return null;
    return obj;
  } catch {
    return null;
  }
}

function lsWrite(data: CoinOption[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {}
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ===== TOP usando /markets com cache, dedupe e fallback =====
export async function topCoins(limit = 20, signal?: AbortSignal): Promise<CoinOption[]> {
  const now = Date.now();
  // 1) cache em memória
  if (_topCache && now - _topCache.at < TOP_TTL_MS) {
    if (_topCache.data.length >= limit) return _topCache.data.slice(0, limit);
  }
  // 2) cache no localStorage
  const ls = lsRead();
  if (ls) {
    _topCache = ls;
    if (ls.data.length >= limit) return ls.data.slice(0, limit);
  }
  // 3) dedupe
  if (_topInflight) return _topInflight.then((d) => d.slice(0, limit));

  const run = async (): Promise<CoinOption[]> => {
    const url = `/api/prices/markets?per_page=${limit}`;
    try {
      const data = await apiFetch<any>(url, { signal });
      const list = normalizeCoins(data);
      _topCache = { at: Date.now(), data: list };
      lsWrite(list);
      return list;
    } catch (e) {
      // 429 → respeita Retry-After (até 3s) e tenta 1x
      if (e instanceof RateLimitError) {
        const wait = typeof e.retryAfterMs === "number" ? Math.min(e.retryAfterMs, 3000) : 1200;
        await sleep(wait);
        try {
          const data = await apiFetch<any>(url, { signal });
          const list = normalizeCoins(data);
          _topCache = { at: Date.now(), data: list };
          lsWrite(list);
          return list;
        } catch {
          // fallback: usa cache antigo se houver; senão COMMON_COINS
          if (_topCache) return _topCache.data.slice(0, limit);
          if (ls) return ls.data.slice(0, limit);
          return COMMON_COINS.slice(0, limit);
        }
      }
      // outros erros → tenta cache; senão COMMON_COINS
      if (_topCache) return _topCache.data.slice(0, limit);
      if (ls) return ls.data.slice(0, limit);
      return COMMON_COINS.slice(0, limit);
    }
  };

  _topInflight = run();
  try {
    const out = await _topInflight;
    return out.slice(0, limit);
  } finally {
    _topInflight = null;
  }
}

// ===== Busca por texto com fallback offline =====
export async function searchCoins(q: string, perPage = 20, signal?: AbortSignal): Promise<CoinOption[]> {
  const term = q?.trim();
  if (!term) return [];
  const url = `/api/prices/coins/search?q=${encodeURIComponent(term)}&per_page=${perPage}`;
  try {
    const data = await apiFetch<any>(url, { signal });
    return normalizeCoins(data);
  } catch (e) {
    // 429 → tenta fallback local (cache/COMMON_COINS) para não travar o usuário
    if (e instanceof RateLimitError) {
      const base =
        (_topCache?.data?.length ? _topCache.data : lsRead()?.data) ?? COMMON_COINS;
      const t = term.toLowerCase();
      const filtered = base.filter(
        (c) =>
          c.name.toLowerCase().includes(t) ||
          (c.symbol || "").toLowerCase().includes(t) ||
          c.id.toLowerCase().includes(t)
      );
      return filtered.slice(0, perPage);
    }
    throw e;
  }
}
