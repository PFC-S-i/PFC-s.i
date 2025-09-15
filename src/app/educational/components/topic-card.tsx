// src/features/educational/components/TopicCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import type { ITopic } from "@/types/topics.type";

type Props = { topic: ITopic; index: number };

export function TopicCard({ topic, index }: Props) {
  const isString = typeof topic.img === "string";

  return (
    <Link
      href={`/educational/${topic.slug}`}
      className="group rounded-2xl overflow-hidden bg-card hover:bg-foreground/5 "
    >
      <div className="relative aspect-[16/9]">
        <Image
          src={topic.img}
          alt={topic.title}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          placeholder={isString ? "empty" : "blur"}
          priority={index === 0}
        />
      </div>

      <div className="p-4">
        <h3 className="font-medium leading-snug">{topic.title}</h3>
      </div>
    </Link>
  );
}
