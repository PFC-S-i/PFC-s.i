// ./src/app/criptomoedas/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Star } from "lucide-react";
import {
  listFavorites,
  addFavorite,
  removeFavorite,
} from "@/services/favorites.service";
import CoinDetailsModal from "./components/coin-details-modal";

type Market = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  market_cap_rank: number | null;
};

const TOP_COUNT = 20;

const fmtBRL = (v: number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v);

const fmtPct = (v: number | null) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

export default function CriptomoedasPage() {
  const [data, setData] = useState<Market[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // favoritos do backend
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favBusy, setFavBusy] = useState<Set<string>>(new Set());

  // estado do modal
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Carrega favoritos do usuário (se logado)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const set = await listFavorites();
        if (!cancelled) setFavorites(set);
      } catch {
        // segue sem favoritos
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Carrega Top 20
  useEffect(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/markets?vs=brl&count=${TOP_COUNT}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Market[];
        setData(json);
      } catch (e: unknown) {
        if ((e as { name?: string })?.name !== "AbortError") {
          setErr(e instanceof Error ? e.message : "Erro ao carregar dados");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // Alterna favorito (otimista, usa backend)
  async function toggleFav(id: string, e?: React.MouseEvent) {
    // não deixar abrir modal quando clicar na estrela
    if (e) e.stopPropagation();
    if (favBusy.has(id)) return;

    const wasFav = favorites.has(id);
    setFavBusy((s) => new Set(s).add(id));
    setFavorites((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (wasFav) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
    } catch {
      // Reverte em caso de erro (ex.: 401)
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(id);
        else next.delete(id);
        return next;
      });
    } finally {
      setFavBusy((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  // Busca + ordena (favoritos primeiro, depois rank, depois nome)
  const visible = useMemo(() => {
    const list = data ?? [];
    const term = q.trim().toLowerCase();

    const filtered = term
      ? list.filter(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            c.symbol.toLowerCase().includes(term)
        )
      : list;

    return [...filtered].sort((a, b) => {
      const af = favorites.has(a.id) ? 0 : 1;
      const bf = favorites.has(b.id) ? 0 : 1;
      if (af !== bf) return af - bf;

      const ar = a.market_cap_rank ?? Number.POSITIVE_INFINITY;
      const br = b.market_cap_rank ?? Number.POSITIVE_INFINITY;
      if (ar !== br) return ar - br;

      return a.name.localeCompare(b.name);
    });
  }, [data, q, favorites]);

  const content: ReactNode = (() => {
    if (loading) {
      return (
        <div className="px-6 py-6 rounded-2xl bg-[#1B1B1B] border border-white/10">
          Carregando…
        </div>
      );
    }
    if (err) {
      return (
        <div className="px-6 py-6 rounded-2xl bg-[#1B1B1B] border border-red-500/30 text-red-300">
          {err}
        </div>
      );
    }
    if (visible.length === 0) {
      return (
        <div className="px-6 py-6 rounded-2xl bg-[#1B1B1B] border border-white/10 opacity-80">
          Nenhum resultado para “{q}”.
        </div>
      );
    }

    return visible.map((c) => {
      const isFav = favorites.has(c.id);
      const change = c.price_change_percentage_24h;
      const changeClass =
        change == null
          ? ""
          : change > 0
          ? "text-green-400"
          : change < 0
          ? "text-red-400"
          : "";

      return (
        <button
          key={c.id}
          onClick={() => setSelectedId(c.id)}
          className="grid grid-cols-[56px_1fr_180px_140px_56px] items-center px-6 py-4 rounded-2xl bg-[#1B1B1B] border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors text-left cursor-pointer"
        >
          <div className="opacity-80">{c.market_cap_rank ?? "—"}</div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-medium">{c.name}</span>
              <span className="text-xs opacity-60">{c.symbol?.toUpperCase()}</span>
            </div>
          </div>

          <div className="text-right font-medium">{fmtBRL(c.current_price)}</div>

          <div className={`text-right font-medium ${changeClass}`}>{fmtPct(change)}</div>

          <div className="flex justify-end">
            <span className="sr-only">Favorito</span>
            <button
              aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              onClick={(e) => toggleFav(c.id, e)}
              disabled={favBusy.has(c.id)}
              className="p-2 rounded-xl hover:bg-white/5 active:scale-95 disabled:opacity-60"
              title="Favoritar"
            >
              <Star
                className={isFav ? "text-yellow-400" : "opacity-60"}
                fill={isFav ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </button>
      );
    });
  })();

  return (
    <main className="px-4 md:px-10 lg:px-20 xl:px-32 py-10 text-gray-200">
      <h1 className="text-4xl font-semibold mb-8">Criptomoedas</h1>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-medium opacity-90">Principais</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar"
          className="w-60 rounded-xl bg-[#1B1B1B] border border-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      <div className="grid w-full gap-2">
        <div className="grid grid-cols-[56px_1fr_180px_140px_56px] items-center px-6 py-3 rounded-2xl bg-[#1B1B1B] border border-white/10 text-sm uppercase tracking-wide opacity-70">
          <span>#</span>
          <span>Nome</span>
          <span className="text-right">Preço</span>
          <span className="text-right">24h</span>
          <span className="sr-only">Favorito</span>
        </div>

        {content}
      </div>

      <CoinDetailsModal open={!!selectedId} coinId={selectedId} vs="brl" onClose={() => setSelectedId(null)} />

      <div className="mt-14 h-px w-full bg-white/20" />
    </main>
  );
}
