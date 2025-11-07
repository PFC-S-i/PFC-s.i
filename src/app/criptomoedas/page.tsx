"use client";

import { useMemo, useState } from "react";
import { useMarkets } from "./hooks/use-market";
import { useFavorites } from "./hooks/use-favorite";
import { useFilterSort } from "./hooks/use-filter-sort";
import { MarketTableHeader } from "./components/market-table-header";
import { MarketRow } from "./components/market-row";
import CoinDetailsModal from "./components/coin-details-modal";

const TOP_COUNT = 20;

export default function CriptomoedasPage() {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, loading, err } = useMarkets({ vs: "brl", count: TOP_COUNT });
  const { favorites, favBusy, toggleFav } = useFavorites();
  const visible = useFilterSort(data, q, favorites);

  const selectedCoin = useMemo(
    () =>
      selectedId && data ? data.find((c) => c.id === selectedId) ?? null : null,
    [selectedId, data]
  );

  return (
    <main className="px-4 md:px-10 lg:px-20 xl:px-32 py-10 text-gray-200">
      <h1 className="text-4xl font-semibold mb-8">Criptomoedas</h1>

      <div className="flex items-center justify-between mb-5 gap-4">
        <h2 className="text-xl font-medium opacity-90">Principais</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar"
          className="w-60 rounded-xl bg-[#1B1B1B] border border-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      <div className="grid w-full gap-2">
        <MarketTableHeader />

        {loading && (
          <div className="px-6 py-6 rounded-2xl bg-[#1B1B1B] border border-white/10">
            Carregando…
          </div>
        )}

        {!loading && err && (
          <div className="px-6 py-6 rounded-2xl bg-[#1B1B1B] border border-red-500/30 text-red-300">
            {err}
          </div>
        )}

        {!loading && !err && visible.length === 0 && (
          <div className="px-6 py-6 rounded-2xl bg-[#1B1B1B] border border-white/10 opacity-80">
            Nenhum resultado para “{q}”.
          </div>
        )}

        {!loading &&
          !err &&
          visible.map((c, i) => (
            <MarketRow
              key={c.id}
              market={c}
              index={i}
              isFav={favorites.has(c.id)}
              favBusy={favBusy.has(c.id)}
              onToggleFav={toggleFav}
              onSelect={() => setSelectedId(c.id)}
            />
          ))}
      </div>

      <CoinDetailsModal
        open={!!selectedId}
        coinId={selectedId}
        vs="brl"
        onClose={() => setSelectedId(null)}
        initial={
          selectedCoin
            ? {
                image: selectedCoin.image,
                name: selectedCoin.name,
                symbol: selectedCoin.symbol,
              }
            : undefined
        }
      />

      <div className="mt-14 h-px w-full bg-white/20" />
    </main>
  );
}
