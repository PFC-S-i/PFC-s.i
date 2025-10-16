"use client";

import Link from "next/link";
import Image from "next/image";
import { EDUCATIONAL_TOPICS } from "@/app/educational/data/topics.data";

export function TopicsGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {EDUCATIONAL_TOPICS.map((topic) => {
        const segment = topic.route ?? topic.slug;
        const href = `/educational/${segment}`;

        return (
          <Link
            key={topic.slug}
            href={href}
            className="group rounded-2xl overflow-hidden border border-white/10 bg-[#1B1B1B] hover:bg-[#202020] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={topic.title}
          >
            <div className="aspect-[16/9] relative">
              <Image
                src={topic.img}
                alt={topic.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={segment === "criptomoedas"}
              />
            </div>
            <div className="p-4">
              <h3 className="text-base md:text-lg font-medium">
                {topic.title}
              </h3>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
