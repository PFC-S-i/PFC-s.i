import { Star } from "lucide-react";
import { CARD, GRID_COLS, HEADER_ROW } from "../lib/ui";
import { changeClass, Fav, fmtBRL, fmtPct } from "../lib/utils";

const DEMO_FAVORITES: Fav[] = [
  {
    id: "bitcoin",
    rank: 1,
    name: "Bitcoin",
    symbol: "BTC",
    image: "",
    price: 352345.12,
    change24h: 1.23,
  },
  {
    id: "ethereum",
    rank: 2,
    name: "Ethereum",
    symbol: "ETH",
    image: "",
    price: 17654.89,
    change24h: -0.84,
  },
  {
    id: "solana",
    rank: 5,
    name: "Solana",
    symbol: "SOL",
    image: "",
    price: 689.45,
    change24h: 4.7,
  },
];

function FavoriteHeader() {
  return (
    <div className={HEADER_ROW}>
      <span>#</span>
      <span>Nome</span>
      <span className="text-right">Preço</span>
      <span className="text-right">24h</span>
      <span className="sr-only">Favorito</span>
    </div>
  );
}

function FavoriteRow({ fav }: { fav: Fav }) {
  return (
    <div
      className={`${GRID_COLS} items-center px-4 py-3 rounded-xl bg-[#151515] border border-white/10`}
    >
      <div className="opacity-80">{fav.rank ?? "—"}</div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="font-medium">{fav.name}</span>
          <span className="text-xs opacity-60">{fav.symbol}</span>
        </div>
      </div>

      <div className="text-right font-medium">{fmtBRL(fav.price)}</div>

      <div className={`text-right font-medium ${changeClass(fav.change24h)}`}>
        {fmtPct(fav.change24h)}
      </div>

      <div className="flex justify-end">
        <button
          className="p-2 rounded-lg opacity-80 cursor-default"
          aria-label="Favorito"
          disabled
        >
          <Star
            fill="currentColor"
            className="text-yellow-400"
            strokeWidth={1.5}
          />
        </button>
      </div>
    </div>
  );
}

export default function FavoritesDemo() {
  return (
    <section className={`${CARD} p-6 mb-8`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Favoritos (DEMO)</h2>
        <span className="text-xs opacity-70">
          Exibição ilustrativa — sem integração
        </span>
      </div>

      <FavoriteHeader />
      <div className="mt-2 space-y-2">
        {DEMO_FAVORITES.map((f) => (
          <FavoriteRow key={f.id} fav={f} />
        ))}
      </div>
    </section>
  );
}
