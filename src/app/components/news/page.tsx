"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@/components";
import { getNews, NewsItem } from "@/services/news.service";

export default function NewsPage() {
  const [q, setQ] = useState<string>(""); // sem placeholder
  const [items, setItems] = useState<NewsItem[]>([]);
  const [filtered, setFiltered] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Carrega a lista do backend uma única vez
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await getNews(); // GET /news/
        setItems(data);
        setFiltered(data);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Falha ao carregar notícias.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Handler da busca (filtra localmente por título ou fonte)
  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setHasSearched(true);
    const term = q.trim().toLowerCase();
    if (!term) {
      setFiltered(items);
      return;
    }
    const next = items.filter(
      (it) =>
        it.title?.toLowerCase().includes(term) ||
        it.source?.toLowerCase().includes(term)
    );
    setFiltered(next);
  }

  // Placeholder de imagem em SVG (sem rede)
  const fallbackImg = useMemo(
    () =>
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
          <rect width='100%' height='100%' fill='#111111'/>
          <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#999999' font-family='Arial' font-size='20'>Sem imagem</text>
        </svg>`
      ),
    []
  );

  return (
    <main className="py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold">Notícias de Criptomoedas</h1>
        <p className="text-muted-foreground">
          Acompanhe aqui as últimas notícias sobre criptomoedas de várias
          fontes.
        </p>
      </header>

      {/* Formulário: sem datas e sem placeholder */}
      <form onSubmit={onSearch} className="mb-6 flex items-center gap-2">
        <Input
          className="flex-1 border px-3 py-2"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Termo de busca"
          // sem placeholder
        />
        <Button type="submit" variant="outline" disabled={loading}>
          {loading ? "Carregando..." : "Buscar"}
        </Button>
      </form>

      {err && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm">
          {err}
        </div>
      )}

      {/* Mensagem quando não há resultados DEPOIS de uma busca */}
      {!loading && !err && hasSearched && filtered.length === 0 && (
        <div className="rounded-xl p-4 text-sm text-muted-foreground">
          Não encontramos nenhuma notícia sobre criptomoedas relacionada ao que
          você buscou
        </div>
      )}

      {filtered.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((a, i) => {
            const src = a.source || "Fonte";
            const href = a.link || "#";

            return (
              <li
                key={`${href}-${i}`}
                className="group rounded-xl overflow-hidden"
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <div className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.image || fallbackImg}
                      alt={a.title || "Imagem da notícia"}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-2 top-2 rounded-lg bg-black/35 px-2 py-1 text-[11px] text-white">
                      {src}
                    </div>

                    {a.published_at && (
                      <div className="absolute right-2 top-2 rounded-lg bg-black/35 px-2 py-1 text-[11px] text-white">
                        {new Date(a.published_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-black/0 p-3 text-white">
                      <h3 className="text-sm font-semibold leading-snug">
                        {a.title || "Sem título"}
                      </h3>
                    </div>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
