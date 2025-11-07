"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Market } from "../types/types";

type UseMarketsOpts = { vs?: "brl" | "usd"; count?: number };
type UseMarketsReturn = {
  data: Market[] | null;
  loading: boolean;
  err: string | null;
  refetch: () => Promise<void>;
};

function isAbortError(err: unknown): boolean {
  return (err as { name?: string } | null)?.name === "AbortError";
}

export function useMarkets({
  vs = "brl",
  count = 20,
}: UseMarketsOpts = {}): UseMarketsReturn {
  const [data, setData] = useState<Market[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchNow = useCallback(
    async (signal?: AbortSignal): Promise<Market[]> => {
      setErr(null);
      const res = await fetch(`/api/markets?vs=${vs}&count=${count}`, {
        cache: "no-store",
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Market[];
    },
    [vs, count]
  );

  useEffect(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);

    (async () => {
      try {
        const json = await fetchNow(ac.signal);
        if (!ac.signal.aborted) setData(json);
      } catch (e: unknown) {
        if (!isAbortError(e)) {
          setErr(e instanceof Error ? e.message : "Erro ao carregar dados");
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [fetchNow]);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const json = await fetchNow();
      setData(json);
    } catch (e: unknown) {
      if (!isAbortError(e)) {
        setErr(e instanceof Error ? e.message : "Erro ao atualizar dados");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchNow]);

  return { data, loading, err, refetch };
}
