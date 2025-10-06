"use client";

import Link from "next/link";
import Image, { type StaticImageData } from "next/image";

import imgEducacional from "../../educacional.webp";
import imgCriptomoedas from "../../Criptomoedas.jpg";
import imgNoticias from "../../noticias.jpg";

type Feature = {
  title: string;
  description: string;
  href: string;
  image?: StaticImageData;
  alt?: string;
};

export function FeatureCardsSection() {
  const features: Feature[] = [
    {
      title: "Educacional",
      description:
        "Aprenda do zero com guias rápidos, conceitos essenciais e conteúdos práticos.",
      href: "/educational",
      image: imgEducacional,
      alt: "Página Educacional",
    },
    {
      title: "Criptomoedas",
      description:
        "Acompanhe preços, variações e rankings de forma simples e direta.",
      href: "/criptomoedas",
      image: imgCriptomoedas,
      alt: "Página Criptomoedas",
    },
    {
      title: "Notícias",
      description:
        "Veja os principais destaques do mercado em tempo real e bem organizados.",
      href: "/news",
      image: imgNoticias,
      alt: "Página Notícias",
    },
  ];

  return (
    <section className="w-full py-16">
      <ul className="mx-auto w-full max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        {features.map((f, i) => {
          const alternate = i % 2 === 1;

          return (
            <li key={f.title}>
              <Link
                href={f.href}
                className="group block rounded-3xl border border-white/5 bg-[#1B1B1B] p-6 md:p-8 lg:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] hover:border-primary/20 transition-colors"
              >
                <div
                  className={[
                    "flex flex-col gap-5",
                    alternate ? "md:flex-row-reverse" : "md:flex-row",
                    "md:items-center md:gap-10 lg:gap-12",
                  ].join(" ")}
                >
                  <div className="relative h-28 w-28 md:h-32 md:w-32 lg:h-36 lg:w-36 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <Image
                      src={f.image!}
                      alt={f.alt ?? f.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 144px"
                      priority={i === 0}
                    />
                  </div>

                  <div className={alternate ? "md:text-right" : ""}>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-base md:text-lg lg:text-xl text-white/75 leading-relaxed">
                      {f.description}
                    </p>
                    <div
                      className={[
                        "mt-4 text-base md:text-lg opacity-80 group-hover:opacity-100",
                        alternate ? "md:flex md:justify-end" : "",
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center gap-2">
                        Acessar
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="transition-transform group-hover:translate-x-0.5"
                        >
                          <path
                            d="M5 12h14m0 0-5-5m5 5-5 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
