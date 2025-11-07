"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { ChartPoint } from "@/services/prices.service";

type Props = {
  loading: boolean;
  error: string | null;
  series: ChartPoint[];
  moneyFmt: (n: number) => string;
  timeFmt: (ts: number) => string;
};

export function ChartPanel({
  loading,
  error,
  series,
  moneyFmt,
  timeFmt,
}: Props) {
  return (
    <div className="p-4">
      <div className="h-72 w-full rounded-xl border border-white/10 bg-[#121212] p-2">
        {loading ? (
          <div className="grid h-full place-items-center text-sm opacity-70">
            Carregando gráfico…
          </div>
        ) : error ? (
          <div className="grid h-full place-items-center text-sm text-red-400">
            {error}
          </div>
        ) : series.length === 0 ? (
          <div className="grid h-full place-items-center text-sm opacity-70">
            Sem dados para o intervalo selecionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeOpacity={0.1} vertical={false} />
              <XAxis
                dataKey="t"
                tickFormatter={(v: number | string) => timeFmt(Number(v))}
                minTickGap={32}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={(v: number | string) => moneyFmt(Number(v))}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: "#1B1B1B",
                  border: "1px solid rgba(255,255,255,.1)",
                }}
                labelFormatter={(v: number | string) => timeFmt(Number(v))}
                formatter={(value: number | string) => [
                  moneyFmt(Number(value)),
                  "Preço",
                ]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="currentColor"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
