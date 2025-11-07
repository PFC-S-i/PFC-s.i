// ./src/app/criptomoedas/components/coin-details/header.tsx
"use client";

import Image from "next/image";
import { X, TrendingDown, TrendingUp } from "lucide-react";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Props = {
  image?: string;
  name?: string;
  symbol?: string;
  vs: "brl" | "usd";
  price: string;
  pct24?: number | null;
  pctLabel: string; // ex: "1,23%"
  onClose: () => void;
};

export function Header({
  image,
  name,
  symbol,
  vs,
  price,
  pct24,
  pctLabel,
  onClose,
}: Props) {
  const isUp = (pct24 ?? 0) >= 0;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4">
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#121212] grid place-items-center">
          {image ? (
            <Image
              src={image}
              alt={name ?? "Moeda"}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <span className="text-xs font-semibold uppercase">
              {(symbol ?? "?").slice(0, 3).toUpperCase()}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold">
            {name ?? "Carregando…"}
            {symbol && (
              <span className="opacity-70"> {symbol.toUpperCase()}</span>
            )}
          </h3>
          <p className="text-sm opacity-70">
            Cotação e detalhes — {vs.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3 text-sm">
        <span className="opacity-70">Preço</span>
        <strong className="tabular-nums">{price}</strong>

        {pct24 != null && (
          <span
            className={cx(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5",
              isUp
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-rose-500/15 text-rose-400"
            )}
            title="Variação 24h"
          >
            {isUp ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {pctLabel}
          </span>
        )}
      </div>

      <button
        onClick={onClose}
        className="rounded-lg p-2 transition-colors hover:bg-white/10"
        aria-label="Fechar"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
