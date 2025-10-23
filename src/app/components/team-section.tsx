"use client";

import Image, { StaticImageData } from "next/image";
import { Linkedin } from "lucide-react";

import gu from "@/gu.jpg";
import eu from "@/joao.jpg";
import moura from "@/moura.jpg";

type Member = {
  name: string;
  role: string;
  src: StaticImageData;
  alt?: string;
  linkedin: string;
};

export function TeamSection() {
  const members: Member[] = [
    {
      name: "Gustavo Fernandes",
      role: "Front-end",
      src: gu,
      alt: "Foto de Gustavo Fernandes",
      linkedin: "https://www.linkedin.com/in/gustavo-fernandes-silva",
    },
    {
      name: "João Vitor Bonifácio",
      role: "Back-end",
      src: eu,
      alt: "Foto de João Vitor Bonifácio",
      linkedin: "https://www.linkedin.com/in/joaobonifacioa",
    },
    {
      name: "Fernando Moura",
      role: "Back-end",
      src: moura,
      alt: "Foto de Fernando Moura",
      linkedin: "https://www.linkedin.com/in/fernando-barbosa-moura-156179337",
    },
  ];

  return (
    <section className="w-full py-12">
      <h2 className="text-center text-2xl md:text-3xl font-semibold mb-8">
        Conheça nosso{" "}
        <span className="px-3 text-primary rounded-2xl">Time</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {members.map((m, i) => (
          <article
            key={m.name}
            className="group relative rounded-2xl border border-white/5 bg-[#1B1B1B] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors hover:border-white/15 focus-within:ring-2 focus-within:ring-primary/70"
          >
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-10 -translate-x-1/2 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl transition-colors group-hover:bg-emerald-500/30" />
            </div>

            <div className="mx-auto h-40 w-40 rounded-full ring-1 ring-white/10 overflow-hidden">
              <Image
                src={m.src}
                alt={m.alt ?? m.name}
                width={160}
                height={160}
                className="h-40 w-40 object-cover transition-transform group-hover:scale-[1.03]"
                placeholder="blur"
                priority={i === 0}
              />
            </div>

            <div className="mt-5 text-center">
              <h3 className="text-lg font-semibold">{m.name}</h3>
              <p className="text-sm text-white/60">{m.role}</p>
            </div>

            {/* Ícone + label “LinkedIn”   */}
            <div className="mt-3 flex justify-center">
              <a
                href={m.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir LinkedIn de ${m.name}`}
                title={`Abrir LinkedIn de ${m.name}`}
                className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm text-white/60 transition hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
