"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import { CARD, GRID_COLS, HEADER_ROW } from "../lib/ui";
import { changeClass, Fav, fmtBRL, fmtPct } from "../lib/utils";
import { listFavorites } from "@/services/favorites.service";

/** Mercado mínimo para montar a linha do favorito */
type Market = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  market_cap_rank: number | null;
};

function FavoriteHeader() {
  return (
    <div className={`hidden md:grid ${HEADER_ROW}`}>
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
    <div className="rounded-xl bg-[#151515] border border-white/10 px-4 py-3">
      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs opacity-60 shrink-0">
              #{fav.rank ?? "—"}
            </span>

            {/* imagem + nome + símbolo, igual ao MarketRow */}
            <div className="flex items-center gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fav.image}
                alt={fav.name}
                className="h-6 w-6 rounded-full"
                loading="lazy"
                decoding="async"
              />
              <div className="min-w-0">
                <div className="font-medium truncate">{fav.name}</div>
                <div className="text-xs opacity-60 truncate">{fav.symbol}</div>
              </div>
            </div>
          </div>

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

        <div className="mt-2 flex items-center justify-between text-sm">
          <div className="font-medium">{fmtBRL(fav.price)}</div>
          <div className={`font-medium ${changeClass(fav.change24h)}`}>
            {fmtPct(fav.change24h)}
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className={`${GRID_COLS} items-center hidden md:grid`}>
        <div className="opacity-80">{fav.rank ?? "—"}</div>

        <div className="flex items-center gap-3">
          {/* imagem + nome + símbolo, igual ao MarketRow */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fav.image}
            alt={fav.name}
            className="h-6 w-6 rounded-full"
            loading="lazy"
            decoding="async"
          />
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
    </div>
  );
}

export default function Favorites() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Fav[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1) IDs das moedas favoritadas do usuário
        const idsSet = await listFavorites(); // Set<string>
        const ids = Array.from(idsSet);
        if (cancelled) return;

        if (ids.length === 0) {
          setItems([]);
          return;
        }

        // 2) Detalhes das moedas
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        const url = `/api/markets?vs=brl&ids=${encodeURIComponent(
          ids.join(",")
        )}`;
        const res = await fetch(url, { cache: "no-store", signal: ac.signal });
        if (!res.ok) throw new Error(`Erro ${res.status}: ${await res.text()}`);

        const markets = (await res.json()) as Market[];
        if (cancelled) return;

        // 3) Monta os favoritos para a UI do profile
        const mapped: Fav[] = markets.map((m, idx) => ({
          id: m.id,
          rank:
            typeof m.market_cap_rank === "number" ? m.market_cap_rank : idx + 1,
          name: m.name,
          symbol: m.symbol?.toUpperCase?.() ?? m.symbol,
          image: m.image || "",
          price: m.current_price ?? 0,
          change24h: m.price_change_percentage_24h ?? 0,
        }));

        mapped.sort((a, b) => a.name.localeCompare(b.name));

        setItems(mapped);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "Falha ao carregar favoritos"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="mt-2 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#151515] border border-white/10 px-4 py-3 animate-pulse"
            >
              <div className="h-5 w-24 bg-white/10 rounded mb-2" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="mt-3 text-sm text-red-400">{error}</div>;
    }

    if (items.length === 0) {
      return (
        <div className="mt-3 text-sm opacity-70">
          Você ainda não favoritou nenhuma moeda.
        </div>
      );
    }

    return (
      <>
        <FavoriteHeader />
        <div className="mt-2 space-y-2">
          {items.map((f) => (
            <FavoriteRow key={f.id} fav={f} />
          ))}
        </div>
      </>
    );
  }, [loading, error, items]);

  return (
    <section className={`${CARD} p-6 mb-8`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Favoritos</h2>
        <span className="text-xs opacity-70">
          {loading ? "Carregando..." : `${items.length} item(ns)`}
        </span>
      </div>
      {content}
    </section>
  );
}
