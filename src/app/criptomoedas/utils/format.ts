export const fmtBRL = (v: number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v);

export const fmtPct = (v: number | null) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

/** Cria um formatador monetário para 'brl' | 'usd' */
export function makeMoney(vs: "brl" | "usd") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: vs.toUpperCase(),
    maximumFractionDigits: 2,
  });
}

/** Percentual com sinal e 2 casas */
export function makePctFmt() {
  return new Intl.NumberFormat("pt-BR", {
    signDisplay: "exceptZero",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Formatador de data/hora local para labels do gráfico */
export function makeTimeFmt() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (ts: number) =>
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(ts);
}
