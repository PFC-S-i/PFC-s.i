export type Fav = {
  id: string;
  rank: number | null;
  name: string;
  symbol: string;
  image: string;
  price: number | null;
  change24h: number | null;
};

export const EMAIL_RE = /^\S+@\S+\.\S+$/;

export const fmtBRL = (v: number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v || 0);

export const fmtPct = (v: number | null) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

export function getErrMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e ?? "Erro desconhecido");
}

export function changeClass(change: number | null) {
  if (change == null) return "";
  if (change > 0) return "text-green-400";
  if (change < 0) return "text-red-400";
  return "";
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
