// src/app/components/about/about.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/button";

type Market = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  price_change_percentage_24h: number | null;
};

type CoinOption = { id: string; label: string };

const TOP_COUNT = 20;

export function About() {
  // Dados do carrossel
  const [data, setData] = useState<Market[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Opções (Top 20) e filtro
  const [options, setOptions] = useState<CoinOption[]>([]);
  const [optLoading, setOptLoading] = useState(true);
  const [optError, setOptError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tempSelection, setTempSelection] = useState<Set<string>>(new Set());
  // Se for null => usar count=20; se string => usar ids=...
  const [activeIds, setActiveIds] = useState<string | null>(null);

  // Carrega Top 20 para o dropdown
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setOptLoading(true);
        setOptError(null);
        const res = await fetch(`/api/coin-options?vs=brl&count=${TOP_COUNT}`, {
          cache: "force-cache",
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const opts = (await res.json()) as CoinOption[];
        if (cancelled) return;
        setOptions(opts);
        // Seleção padrão: todas as 20
        setTempSelection(new Set(opts.map((o) => o.id)));
        setActiveIds(null);
      } catch (e: unknown) {
        if (!cancelled) {
          setOptError(
            e instanceof Error ? e.message : "Falha ao carregar Top 20"
          );
          setOptions([]);
        }
      } finally {
        if (!cancelled) setOptLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fechar dropdown ao clicar fora
  const filterWrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDocClick(ev: MouseEvent) {
      if (!filterOpen) return;
      const el = filterWrapRef.current;
      if (el && !el.contains(ev.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [filterOpen]);

  function openFilter() {
    const activeSet =
      activeIds === null
        ? new Set(options.map((o) => o.id))
        : new Set(activeIds.split(",").filter(Boolean));
    setTempSelection(activeSet);
    setFilterOpen((v) => !v);
  }
  function toggleCoin(id: string) {
    const next = new Set(tempSelection);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setTempSelection(next);
  }
  function clearFilter() {
    setTempSelection(new Set());
  }
  function selectAllVisible(ids: string[]) {
    const next = new Set(tempSelection);
    ids.forEach((id) => next.add(id));
    setTempSelection(next);
  }

  // Busca local dentro do Top 20
  const visibleOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    );
  }, [options, search]);

  // Fetch / polling
  const controllerRef = useRef<AbortController | null>(null);
  async function load({ quiet = false }: { quiet?: boolean } = {}) {
    try {
      if (!quiet) setLoading(true);
      setError(null);

      const prev = controllerRef.current;
      if (prev) prev.abort();
      const ac = new AbortController();
      controllerRef.current = ac;

      const url =
        activeIds === null
          ? `/api/markets?vs=brl&count=${TOP_COUNT}`
          : `/api/markets?vs=brl&ids=${encodeURIComponent(activeIds)}`;

      const res = await fetch(url, { cache: "no-store", signal: ac.signal });
      if (!res.ok) throw new Error(`Erro ${res.status}: ${await res.text()}`);

      const json = (await res.json()) as Market[];
      setData(json);
      setLastUpdated(new Date());
    } catch (e: unknown) {
      const isAbort = e instanceof DOMException && e.name === "AbortError";
      if (!isAbort)
        setError(e instanceof Error ? e.message : "Falha ao carregar dados");
    } finally {
      if (!quiet) setLoading(false);
    }
  }

  // Inicia o polling quando as opções estiverem prontas
  useEffect(() => {
    const ready = !optLoading && (options.length > 0 || !!optError);
    if (!ready) return;

    // Primeira carga
    load();

    // Atualiza a cada 30s
    const id = setInterval(() => {
      load({ quiet: true });
    }, 30_000);

    // Cleanup
    return () => {
      clearInterval(id);
      const ctrl = controllerRef.current;
      if (ctrl) ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optLoading, options.length, optError, activeIds]);

  async function applyFilter() {
    const chosen = Array.from(tempSelection);
    if (chosen.length === 0) return;
    // Se todas as 20 estiverem selecionadas, manter activeIds = null (Top 20)
    if (chosen.length === options.length) setActiveIds(null);
    else setActiveIds(chosen.join(","));
    setFilterOpen(false);
    await load({ quiet: false });
  }

  // Carrossel + navegação
  const listRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function updateNavAvailability() {
    const el = listRef.current;
    if (!el) return;
    const tol = 2;
    setCanPrev(el.scrollLeft > tol);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - tol);
  }
  function scrollByViewport(dir: -1 | 1) {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    updateNavAvailability();
    const onScroll = () => updateNavAvailability();
    const onResize = () => updateNavAvailability();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [data]);

  const nfBRL = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

  const selectedCount =
    activeIds === null
      ? options.length
      : activeIds.split(",").filter(Boolean).length;

  return (
    <section id="sobre" className="py-20 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-3xl font-bold">Top 20 por Market Cap</h2>

        <div className="flex items-center gap-3">
          {/* Filtro (Top 20) */}
          <div ref={filterWrapRef} className="relative">
            <Button
              className="bg-card border-primary hover:bg-card/10"
              onClick={openFilter}
              tooltipContent="Escolher subset do Top 20"
            >
              Filtrar moedas ({selectedCount})
            </Button>

            {filterOpen && (
              <div
                className="
                absolute top-full mt-2 z-20
                w-[min(92vw,800px)] max-w-[calc(100vw-2rem)]
                left-0 sm:left-auto sm:right-0
                rounded-2xl border bg-background backdrop-blur shadow-lg p-4"
              >
                <input
                  className="w-full rounded-xl shadow-lg px-3 py-2 mb-3"
                  placeholder="Buscar dentro do Top 20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-gray-500">
                    Selecionadas: {tempSelection.size}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        selectAllVisible(visibleOptions.map((o) => o.id))
                      }
                    >
                      Selecionar todos
                    </Button>
                    <Button variant="outline" onClick={clearFilter}>
                      Limpar
                    </Button>
                  </div>
                </div>

                {/* Lista com scroll */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[60vh] overflow-auto pr-1">
                  {visibleOptions.map((opt) => {
                    const checked = tempSelection.has(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer hover:bg-primary/10"
                        title={opt.id}
                      >
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={checked}
                          onChange={() => toggleCoin(opt.id)}
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    );
                  })}
                  {visibleOptions.length === 0 && (
                    <div className="text-sm text-gray-500 col-span-full">
                      Nada encontrado.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilterOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={applyFilter}
                    variant="outline"
                    disabled={tempSelection.size === 0}
                  >
                    Aplicar filtros
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            className="bg-card border-primary hover:bg-card/10"
            onClick={() => load()}
            isLoading={loading}
            tooltipContent="Buscar cotações agora"
          >
            Atualizar agora
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-center text-red-600 bg-red-50 border border-red-200 p-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-2xl border animate-pulse">
              <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-20 bg-gray-200 rounded mb-4" />
              <div className="h-10 w-full bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {data && !loading && !error && (
        <>
          {/* Carrossel */}
          <div
            ref={listRef}
            className="
              flex gap-4 overflow-x-auto scroll-smooth
              snap-x snap-mandatory
              [scrollbar-width:none] [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden px-1
            "
          >
            {data.map((c) => {
              const change = c.price_change_percentage_24h ?? 0;
              const up = change >= 0;
              return (
                <div
                  key={c.id}
                  className="
                    snap-start shrink-0
                    w-[85%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]
                  "
                >
                  <div className="p-5 rounded-2xl h-full bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.image}
                        alt={c.name}
                        className="h-8 w-8 rounded-full"
                        loading="lazy"
                      />
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.symbol}</div>
                      </div>
                    </div>

                    <div className="text-2xl font-bold mb-1">
                      {c.current_price != null
                        ? nfBRL.format(c.current_price)
                        : "—"}
                    </div>
                    <div
                      className={`text-sm ${
                        up ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {up ? "▲" : "▼"} {nf.format(change)}%
                    </div>
                    <div className="mt-4 text-xs text-gray-300">
                      MC:{" "}
                      {c.market_cap != null ? nfBRL.format(c.market_cap) : "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navegação inferior (para desktop) */}
          <div className="mt-5 hidden lg:flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollByViewport(-1)}
              disabled={!canPrev}
              className="min-w-10"
              tooltipContent="Anterior"
            >
              ‹
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollByViewport(1)}
              disabled={!canNext}
              className="min-w-10"
              tooltipContent="Próximo"
            >
              ›
            </Button>
          </div>
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Atualizado às {lastUpdated.toLocaleTimeString("pt-BR")}
            </span>
          )}
        </>
      )}
    </section>
  );
}
