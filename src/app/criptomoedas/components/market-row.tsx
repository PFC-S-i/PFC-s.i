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
      className="
        flex flex-col gap-3
        px-4 py-4
        rounded-2xl
        bg-[#1B1B1B]
        border border-white/10
        hover:border-white/20 hover:bg-white/5
        transition-colors
        cursor-pointer
        md:grid md:grid-cols-[56px_1fr_180px_140px_56px] md:items-center md:px-6 md:py-4
      "
      role="button"
      tabIndex={0}
    >
      {/* Linha superior (mobile) + colunas 1 e 2 no desktop */}
      <div className="flex items-center justify-between md:justify-start md:gap-4">
        <div className="opacity-80 md:w-10">{rankToShow}</div>

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

        {/* Preço aparece aqui no mobile; some no desktop (onde tem coluna própria) */}
        <div className="text-right font-medium md:hidden">
          {fmtBRL(market.current_price)}
        </div>
      </div>

      {/* Linha inferior (apenas mobile): variação + favorito */}
      <div className="flex items-center justify-between text-sm md:hidden">
        <div className={`font-medium ${changeClass}`}>{fmtPct(change)}</div>

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
          className="p-1.5 rounded-xl hover:bg-white/5 active:scale-95 disabled:opacity-60"
          title="Favoritar"
        >
          <Star
            className={isFav ? "text-yellow-400" : "opacity-60"}
            fill={isFav ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </Button>
      </div>

      {/* Colunas exclusivas do desktop (md+) */}
      <div className="hidden md:block text-right font-medium">
        {fmtBRL(market.current_price)}
      </div>

      <div className={`hidden md:block text-right font-medium ${changeClass}`}>
        {fmtPct(change)}
      </div>

      <div className="hidden md:flex justify-end">
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
