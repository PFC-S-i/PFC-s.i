"use client";

type Props = {
  high24h?: number | null;
  low24h?: number | null;
  marketCap?: number | null;
  volume24h?: number | null;
  moneyFmt: (n: number) => string;
};

export function StatsGrid({
  high24h,
  low24h,
  marketCap,
  volume24h,
  moneyFmt,
}: Props) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Cap. de Mercado"
        value={marketCap != null ? moneyFmt(marketCap) : "—"}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#121212] p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className="mt-1 text-lg font-medium tabular-nums">{value}</div>
    </div>
  );
}
