"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCoinChart,
  getCoinMarket,
  type ChartPoint,
  type CoinMarket,
} from "@/services/prices.service";

export type RangeOpt = { label: string; hours: number };

export function useCoinDetails(params: {
  open: boolean;
  coinId: string | null;
  vs: "brl" | "usd";
  defaultRange?: RangeOpt;
}) {
  const {
    open,
    coinId,
    vs,
    defaultRange = { label: "24h", hours: 24 },
  } = params;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [market, setMarket] = useState<CoinMarket | null>(null);
  const [series, setSeries] = useState<ChartPoint[]>([]);
  const [range, setRange] = useState<RangeOpt>(defaultRange);

  const load = useCallback(
    async (id: string, hours: number) => {
      setLoading(true);
      setError(null);
      let cancelled = false;
      try {
        const [mkt, chart] = await Promise.all([
          getCoinMarket(id, vs),
          getCoinChart(id, hours, vs),
        ]);
        if (!cancelled) {
          setMarket(mkt);
          setSeries(chart);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : "Falha ao carregar";
          setError(message);
          setMarket(null);
          setSeries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
      return () => {
        cancelled = true;
      };
    },
    [vs]
  );

  useEffect(() => {
    if (!open || !coinId) return;
    load(coinId, range.hours);
  }, [open, coinId, range, load]);

  return { loading, error, market, series, range, setRange };
}
