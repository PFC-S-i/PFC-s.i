"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { getNews } from "@/services/news.service";
import type { NewsItem } from "@/services/news.service";

const AUTOPLAY_MS = 6000;
const SLIDE_BASIS =
  "flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%]";
const SLIDE_CLASS = `min-w-0 pr-4 md:pr-6 ${SLIDE_BASIS}`;
const SKELETON_COUNT = 3;

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

function SkeletonCard() {
  return (
    <div className="h-full rounded-xl bg-card p-4">
      <div className="mb-3 aspect-video w-full animate-pulse rounded-lg bg-foreground/10" />
      <div className="mb-2 h-4 w-4/5 animate-pulse rounded bg-foreground/10" />
      <div className="h-4 w-2/5 animate-pulse rounded bg-foreground/10" />
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full overflow-hidden rounded-xl bg-card transition hover:border-b"
    >
      {item.image ? (
        <div className="aspect-video w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.title || "Notícia"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="grid aspect-video w-full place-items-center text-xs text-foreground/60">
          sem imagem
        </div>
      )}
      <div className="p-4">
        <h3 className="text-sm font-semibold leading-snug text-foreground">
          {item.title}
        </h3>
        <p className="mt-2 text-xs text-foreground/70">
          {item.source}
          {item.published_at ? ` • ${formatDate(item.published_at)}` : ""}
        </p>
      </div>
    </a>
  );
}

type NavButtonProps = {
  side: "left" | "right";
  label: string;
  onClick: () => void;
};
function NavButton({ side, label, onClick }: NavButtonProps) {
  const base =
    "absolute top-1/2 -translate-y-1/2 rounded-full bg-card px-3 py-2 text-sm text-foreground hover:bg-foreground/10";
  const pos = side === "left" ? "left-2" : "right-2";
  const symbol = side === "left" ? "‹" : "›";
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`${base} ${pos}`}
    >
      {symbol}
    </button>
  );
}

export default function NewsCarousel() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const plugins = useMemo(
    () => [
      Autoplay({
        delay: AUTOPLAY_MS,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    plugins
  );

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      try {
        const data = await getNews();
        if (!isMounted) return;
        setItems(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e: unknown) {
        if (!isMounted) return;
        const msg =
          e instanceof Error ? e.message : "Erro ao carregar notícias.";
        setError(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const showNav = items.length > 3;
  const isEmpty = !loading && items.length === 0 && !error;

  return (
    <section
      aria-label="Últimas notícias"
      className="mx-auto w-full max-w-5xl space-y-2 py-2"
    >
      <div className="flex items-center text-center justify-center px-2">
        <h2 className="text-xl text-foreground">
          Acompanhe as principais{" "}
          <span className="font-bold text-primary">notícias</span> sobre o mundo
          cripto
        </h2>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-2xl bg-background">
          <div
            ref={emblaRef}
            className="overflow-hidden"
            aria-roledescription="carousel"
          >
            <ul className="m-0 flex list-none p-4 sm:p-5">
              {loading
                ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <li key={i} className={SLIDE_CLASS}>
                      <SkeletonCard />
                    </li>
                  ))
                : items.map((n) => (
                    <li key={n.link} className={SLIDE_CLASS}>
                      <NewsCard item={n} />
                    </li>
                  ))}
            </ul>
          </div>
        </div>

        {showNav && (
          <>
            <NavButton
              side="left"
              label="Anterior"
              onClick={() => emblaApi?.scrollPrev()}
            />
            <NavButton
              side="right"
              label="Próximo"
              onClick={() => emblaApi?.scrollNext()}
            />
          </>
        )}
      </div>

      {error && <p className="text-sm text-primary">{error}</p>}
      {isEmpty && (
        <p className="text-sm text-foreground/80">
          Nenhuma notícia disponível agora.
        </p>
      )}
    </section>
  );
}
