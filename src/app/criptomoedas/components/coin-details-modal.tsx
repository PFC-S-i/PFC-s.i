// ./src/app/criptomoedas/components/coin-details-modal.tsx
"use client";

import { Clock } from "lucide-react";
import {
  makeMoney,
  makePctFmt,
  makeTimeFmt,
} from "@/app/criptomoedas/utils/format";
import type { CoinMarket } from "@/services/prices.service";
import { RangeOpt, useCoinDetails } from "../hooks/use-coin-details";
import { ModalShell } from "./coin-details/modal-shell";
import { Header } from "./coin-details/header";
import { RangePicker } from "./coin-details/range-picker";
import { ChartPanel } from "./coin-details/chart-panel";
import { StatsGrid } from "./coin-details/stats-grid";

type Props = {
  open: boolean;
  coinId: string | null;
  vs?: "brl" | "usd";
  onClose: () => void;
  initial?: { image?: string; name?: string; symbol?: string };
};

const RANGES = [
  { label: "3h", hours: 3 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 24 * 7 },
] as const satisfies readonly RangeOpt[];

type ImageObject = { small?: string; thumb?: string; large?: string };
type MarketData = Partial<CoinMarket> & { image?: string | ImageObject };

function resolveImageSrc(
  img: string | ImageObject | undefined,
  fallback?: string
): string | undefined {
  if (!img) return fallback;
  if (typeof img === "string") return img;
  return img.small ?? img.thumb ?? img.large ?? fallback;
}
export default function CoinDetailsModal({
  open,
  coinId,
  vs = "brl",
  onClose,
  initial,
}: Props) {
  const { loading, error, market, series, range, setRange } = useCoinDetails({
    open,
    coinId,
    vs,
    defaultRange: RANGES[2],
  });

  if (!open || !coinId) return null;

  const money = makeMoney(vs);
  const pctFmt = makePctFmt();
  const timeFmt = makeTimeFmt();

  const m: MarketData = (market ?? {}) as MarketData;

  const img = resolveImageSrc(m.image, initial?.image);
  const name = m.name ?? initial?.name ?? "Carregando…";
  const symbol = m.symbol ?? initial?.symbol ?? undefined;

  const currentPrice = m.current_price ?? null;
  const pct24 = m.price_change_percentage_24h ?? null;

  return (
    <ModalShell open={open} onClose={onClose}>
      <Header
        image={img}
        name={name}
        symbol={symbol}
        vs={vs}
        price={currentPrice != null ? money.format(currentPrice) : "—"}
        pct24={pct24}
        pctLabel={`${pctFmt.format(Number(pct24 ?? 0))}%`}
        onClose={onClose}
      />

      <RangePicker
        ranges={RANGES}
        selected={range}
        onSelect={setRange}
        leading={
          <div className="flex items-center gap-1 text-sm opacity-80">
            <Clock className="h-4 w-4" />
            Intervalo:
          </div>
        }
      />

      <ChartPanel
        loading={loading}
        error={error}
        series={series}
        moneyFmt={(n) => money.format(n)}
        timeFmt={timeFmt}
      />

      <StatsGrid
        high24h={m.high_24h ?? null}
        low24h={m.low_24h ?? null}
        marketCap={m.market_cap ?? null}
        volume24h={m.total_volume ?? null}
        moneyFmt={(n) => money.format(n)}
      />
    </ModalShell>
  );
}
