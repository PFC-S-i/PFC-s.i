"use client";

import { Star } from "lucide-react";
import { Button } from "@/components";
import { fmtBRL, fmtPct } from "../utils/format";
import { Market } from "../types/types";

type Props = {
  market: Market;
  index: number;
  isFav: boolean;
  favBusy: boolean;
  onToggleFav: (id: string) => void;
  onSelect: () => void;
};

export function MarketRow({
  market,
  index,
  isFav,
  favBusy,
  onToggleFav,
  onSelect,
}: Props) {
  const change = market.price_change_percentage_24h;
  const changeClass =
    change == null
      ? ""
      : change > 0
      ? "text-emerald-400"
      : change < 0
      ? "text-rose-400"
      : "";

  const rankToShow =
    typeof market.market_cap_rank === "number"
      ? market.market_cap_rank
      : index + 1;

  return (
    <div
      onClick={onSelect}
      className="grid grid-cols-[56px_1fr_180px_140px_56px] items-center px-6 py-4 rounded-2xl bg-[#1B1B1B] border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer"
      role="button"
      tabIndex={0}
    >
      <div className="opacity-80">{rankToShow}</div>

      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={market.image}
          alt={market.name}
          className="h-6 w-6 rounded-full"
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col">
          <span className="font-medium">{market.name}</span>
          <span className="text-xs opacity-60">
            {market.symbol?.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="text-right font-medium">
        {fmtBRL(market.current_price)}
      </div>

      <div className={`text-right font-medium ${changeClass}`}>
        {fmtPct(change)}
      </div>

      <div className="flex justify-end">
        <span className="sr-only">Favorito</span>
        <Button
          aria-label={
            isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(market.id);
          }}
          disabled={favBusy}
          variant="ghost"
          className="p-2 rounded-xl hover:bg-white/5 active:scale-95 disabled:opacity-60"
          title="Favoritar"
        >
          <Star
            className={isFav ? "text-yellow-400" : "opacity-60"}
            fill={isFav ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </Button>
      </div>
    </div>
  );
}
