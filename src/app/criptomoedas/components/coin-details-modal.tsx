"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { X, TrendingUp, TrendingDown, Clock } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  getCoinMarket,
  getCoinChart,
  type CoinMarket,
  type ChartPoint,
} from "@/services/prices.service";

type Props = {
  open: boolean;
  coinId: string | null;
  vs?: "brl" | "usd";
  onClose: () => void;
};

const RANGES = [
  { label: "3h", hours: 3 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 24 * 7 },
] as const;

function cx(...c: Array<string | false | null | undefined>): string {
  return c.filter(Boolean).join(" ");
}

export default function CoinDetailsModal({
  open,
  coinId,
  vs = "brl",
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<(typeof RANGES)[number]>(RANGES[2]); // 24h
  const [market, setMarket] = useState<CoinMarket | null>(null);
  const [series, setSeries] = useState<ChartPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  const money = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: vs.toUpperCase(),
        maximumFractionDigits: 2,
      }),
    [vs]
  );

  const pctFmt = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        signDisplay: "exceptZero",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const timeFmt = useMemo(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return (ts: number) =>
      new Intl.DateTimeFormat("pt-BR", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      }).format(ts);
  }, []);

  const load = useCallback(
    async (id: string, hours: number) => {
      setLoading(true);
      setError(null);
      try {
        const [mkt, chart] = await Promise.all([
          getCoinMarket(id, vs),
          getCoinChart(id, hours, vs),
        ]);
        setMarket(mkt);
        setSeries(chart);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Falha ao carregar";
        setError(message);
        setMarket(null);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    },
    [vs]
  );

  useEffect(() => {
    if (!open || !coinId) return;
    load(coinId, range.hours);
  }, [open, coinId, range, load]);

  if (!open || !coinId) return null;

  const p = market?.current_price ?? null;
  const pct24 = market?.price_change_percentage_24h ?? null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px]"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 grid place-items-center p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#1B1B1B] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-[#121212] uppercase">
                {(market?.symbol ?? market?.id ?? "?").slice(0, 3)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {market?.name ?? "Carregando…"}
                  {market?.symbol ? (
                    <span className="opacity-70">
                      {" "}
                      ({market.symbol.toUpperCase()})
                    </span>
                  ) : null}
                </h3>
                <p className="text-sm opacity-70">
                  Cotação e detalhes — {vs.toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-4">
            <div className="flex items-center gap-1 text-sm opacity-80">
              <Clock className="h-4 w-4" />
              Intervalo:
            </div>
            <div className="flex items-center gap-2">
              {RANGES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setRange(r)}
                  className={cx(
                    "rounded-lg border px-3 py-1.5 transition",
                    r.label === range.label
                      ? "border-white/40 bg-white/10"
                      : "border-white/10 hover:bg-white/5"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-3 text-sm">
              <span className="opacity-70">Preço</span>
              <strong className="tabular-nums">
                {p != null ? money.format(p) : "—"}
              </strong>
              {pct24 != null && (
                <span
                  className={cx(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5",
                    pct24 >= 0
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-rose-500/15 text-rose-400"
                  )}
                  title="Variação 24h"
                >
                  {pct24 >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {pctFmt.format(pct24)}%
                </span>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="p-4">
            <div className="h-72 w-full rounded-xl border border-white/10 bg-[#121212] p-2">
              {loading ? (
                <div className="grid h-full place-items-center text-sm opacity-70">
                  Carregando gráfico…
                </div>
              ) : error ? (
                <div className="grid h-full place-items-center text-sm text-red-400">
                  {error}
                </div>
              ) : series.length === 0 ? (
                <div className="grid h-full place-items-center text-sm opacity-70">
                  Sem dados para o intervalo selecionado.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <CartesianGrid strokeOpacity={0.1} vertical={false} />
                    <XAxis
                      dataKey="t"
                      tickFormatter={(v: number | string) => timeFmt(Number(v))}
                      minTickGap={32}
                      tickMargin={8}
                    />
                    <YAxis
                      tickFormatter={(v: number | string) =>
                        money.format(Number(v))
                      }
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1B1B1B",
                        border: "1px solid rgba(255,255,255,.1)",
                      }}
                      labelFormatter={(v: number | string) =>
                        timeFmt(Number(v))
                      }
                      formatter={(value: number | string) => [
                        money.format(Number(value)),
                        "Preço",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="currentColor"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Máx. 24h"
              value={
                market?.high_24h != null ? money.format(market.high_24h) : "—"
              }
            />
            <Stat
              label="Mín. 24h"
              value={
                market?.low_24h != null ? money.format(market.low_24h) : "—"
              }
            />
            <Stat
              label="Cap. de Mercado"
              value={
                market?.market_cap != null
                  ? money.format(market.market_cap)
                  : "—"
              }
            />
            <Stat
              label="Volume 24h"
              value={
                market?.total_volume != null
                  ? money.format(market.total_volume)
                  : "—"
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#121212] p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className="mt-1 text-lg font-medium tabular-nums">{value}</div>
    </div>
  );
}
