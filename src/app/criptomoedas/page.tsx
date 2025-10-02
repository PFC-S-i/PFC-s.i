// app/criptomoedas/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

type Market = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  market_cap_rank: number | null;
};

const FAVORITES_KEY = "favorite_coins";

const fmtBRL = (v: number | null) =>
  v == null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const fmtPct = (v: number | null) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

export default function CriptomoedasPage() {
  const [data, setData] = useState<Market[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Carrega favoritos do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  // Busca dados (proxy local -> CoinGecko)
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/markets?per_page=50&page=1`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Market[];
        if (!dead) setData(json);
      } catch (e: any) {
        if (!dead) setErr(e?.message ?? "Erro ao carregar dados");
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => {
      dead = true;
    };
  }, []);

  // Salva favoritos
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    } catch {}
  }, [favorites]);

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!q.trim()) return list;
    const term = q.trim().toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(term) || c.symbol.toLowerCase().includes(term),
    );
  }, [data, q]);

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
        {/* Cabeçalho */}
        <div className="grid grid-cols-[56px_1fr_180px_140px_56px] items-center px-6 py-3 rounded-2xl bg-[#1B1B1B] border border-white/10 text-sm uppercase tracking-wide opacity-70">
          <span>#</span>
          <span>Nome</span>
          <span className="text-right">Preço</span>
          <span className="text-right">24h</span>
          <span className="sr-only">Favorito</span>
        </div>

        {/* Estados */}
        {loading && (
          <div className="px-6 py-6 rounded-2xl bg-[#1B1B1B] border border-white/10">
            Carregando…
          </div>
        )}
        {err && !loading && (
          <div className="px-6 py-6 rounded-2xl bg-[#1B1B1B] border border-red-500/30 text-red-300">
            {err}
          </div>
        )}

        {/* Linhas */}
        {!loading &&
          !err &&
          filtered.map((c) => {
            const pct = c.price_change_percentage_24h ?? 0;
            const positive = pct > 0;
            const negative = pct < 0;

            return (
              <div
                key={c.id}
                className="grid grid-cols-[56px_1fr_180px_140px_56px] items-center px-6 py-4 rounded-2xl bg-[#1B1B1B] border border-white/10 hover:border-white/20 transition-colors"
              >
                {/* rank */}
                <div className="opacity-80">{c.market_cap_rank ?? "—"}</div>

                {/* nome + símbolo */}
                <div className="flex items-center gap-3">
                  <img src={c.image} alt={c.name} className="size-6 rounded-full" />
                  <div className="flex flex-col">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs opacity-60">{c.symbol?.toUpperCase()}</span>
                  </div>
                </div>

                {/* preço */}
                <div className="text-right font-medium">{fmtBRL(c.current_price)}</div>

                {/* 24h */}
                <div
                  className={[
                    "text-right font-medium",
                    positive ? "text-green-400" : "",
                    negative ? "text-red-400" : "",
                  ].join(" ")}
                >
                  {fmtPct(c.price_change_percentage_24h)}
                </div>

                {/* estrela */}
                <div className="flex justify-end">
                  <button
                    aria-label={favorites.has(c.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    onClick={() => toggleFav(c.id)}
                    className="p-2 rounded-xl hover:bg-white/5 active:scale-95"
                    title="Favoritar"
                  >
                    <Star
                      className={favorites.has(c.id) ? "text-yellow-400" : "opacity-60"}
                      // truque para "preencher" o ícone do lucide
                      fill={favorites.has(c.id) ? "currentColor" : "none"}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              </div>
            );
          })}

        {!loading && !err && filtered.length === 0 && (
          <div className="px-6 py-6 rounded-2xl bg-[#1B1B1B] border border-white/10 opacity-80">
            Nenhum resultado para “{q}”.
          </div>
        )}
      </div>

      {/* linha do rodapé como no mock */}
      <div className="mt-14 h-px w-full bg-white/20" />
    </main>
  );
}
