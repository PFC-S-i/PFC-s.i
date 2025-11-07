"use client";

export function MarketTableHeader() {
  return (
    <div className="grid grid-cols-[56px_1fr_180px_140px_56px] items-center px-6 py-3 rounded-2xl bg-[#1B1B1B] border border-white/10 text-sm uppercase tracking-wide opacity-70">
      <span>#</span>
      <span>Nome</span>
      <span className="text-right">Preço</span>
      <span className="text-right">24h</span>
      <span className="sr-only">Favorito</span>
    </div>
  );
}
