"use client";

import { useMemo } from "react";
import { Market } from "../types/types";

export function useFilterSort(
  data: Market[] | null,
  q: string,
  favorites: Set<string>
) {
  return useMemo(() => {
    const list = data ?? [];
    const term = q.trim().toLowerCase();

    const filtered = term
      ? list.filter(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            c.symbol.toLowerCase().includes(term)
        )
      : list;

    const sorted = [...filtered].sort((a, b) => {
      const af = favorites.has(a.id) ? 0 : 1;
      const bf = favorites.has(b.id) ? 0 : 1;
      if (af !== bf) return af - bf;

      const ar = a.market_cap_rank ?? Number.POSITIVE_INFINITY;
      const br = b.market_cap_rank ?? Number.POSITIVE_INFINITY;
      if (ar !== br) return ar - br;

      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [data, q, favorites]);
}
