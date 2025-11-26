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
import { Loader2 } from "lucide-react";

type Point = {
  t: number;
  price: number;
};

type Props = {
  loading: boolean;
  error?: string | null;
  series?: Point[];
  moneyFmt: (n: number) => string;
  timeFmt: (ts: number) => string;
};

export function ChartPanel({
  loading,
  error,
  series = [],
  moneyFmt,
  timeFmt,
}: Props) {
  const data = series.map((p) => ({
    time: timeFmt(p.t),
    price: p.price,
    rawTime: p.t,
  }));

  const { domainMin, domainMax } = calcDomain(series);

  return (
    <div className="h-72 w-full px-4 pb-4">
      {loading ? (
        <div className="flex h-full items-center justify-center gap-2 text-sm opacity-70">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando gráfico…
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center text-sm text-rose-300">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm opacity-70">
          Sem dados para este intervalo.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />
            <YAxis
              domain={[domainMin, domainMax]}
              tickFormatter={(v) => moneyFmt(Number(v))}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              width={90}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0f0f0f",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "0.75rem",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.7)" }}
              formatter={(value) => [moneyFmt(Number(value)), "Preço"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#38bda9"
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function calcDomain(series: Point[]) {
  if (!series.length) return { domainMin: 0, domainMax: 0 };

  const prices = series.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  // todos iguais
  if (min === max) {
    const padding = min === 0 ? 1 : min * 0.01;
    return {
      domainMin: Math.max(0, min - padding),
      domainMax: max + padding,
    };
  }

  const diff = max - min;
  const padding = diff * 0.15;

  return {
    domainMin: Math.max(0, min - padding),
    domainMax: max + padding,
  };
}
