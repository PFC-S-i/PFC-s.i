// src/app/components/about/markets.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type Market = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  price_change_percentage_24h: number | null;
};

type MarketsProps = {
  items: Market[];
  className?: string;

  currencyFormatter?: Intl.NumberFormat;

  numberFormatter?: Intl.NumberFormat;

  asGrid?: boolean;
};

export function Markets({
  items,
  className,
  currencyFormatter,
  numberFormatter,
  asGrid = false,
}: MarketsProps) {
  const nfCurrency =
    currencyFormatter ??
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const nfNumber =
    numberFormatter ??
    new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

  if (!items?.length) {
    return (
      <div className="text-sm text-gray-500">Nenhuma moeda para exibir.</div>
    );
  }

  if (asGrid) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6",
          className
        )}
      >
        {items.map((c) => (
          <CoinCard
            key={c.id}
            coin={c}
            nfCurrency={nfCurrency}
            nfNumber={nfNumber}
          />
        ))}
      </div>
    );
  }

  // Modo carrossel
  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-1",
        className
      )}
      aria-label="Carrossel de cotações"
    >
      {items.map((c) => (
        <div
          key={c.id}
          className="
            snap-start shrink-0
            w-[85%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]
          "
        >
          <CoinCard coin={c} nfCurrency={nfCurrency} nfNumber={nfNumber} />
        </div>
      ))}
    </div>
  );
}

type CoinCardProps = {
  coin: Market;
  nfCurrency: Intl.NumberFormat;
  nfNumber: Intl.NumberFormat;
};

function CoinCard({ coin: c, nfCurrency, nfNumber }: CoinCardProps) {
  const change = c.price_change_percentage_24h ?? 0;
  const up = change >= 0;

  return (
    <div className="p-5 rounded-2xl border h-full bg-white/50 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.image}
          alt={c.name}
          className="h-8 w-8 rounded-full"
          loading="lazy"
        />
        <div>
          <div className="font-semibold">{c.name}</div>
          <div className="text-xs text-gray-500">{c.symbol}</div>
        </div>
      </div>

      <div className="text-2xl font-bold mb-1">
        {c.current_price != null ? nfCurrency.format(c.current_price) : "—"}
      </div>
      <div className={`text-sm ${up ? "text-emerald-600" : "text-rose-600"}`}>
        {up ? "▲" : "▼"} {nfNumber.format(change)}%
      </div>

      <div className="mt-4 text-xs text-gray-500">
        MC: {c.market_cap != null ? nfCurrency.format(c.market_cap) : "—"}
      </div>
    </div>
  );
}
