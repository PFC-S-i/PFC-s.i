// src/types/topics.type.ts
import type { StaticImageData } from "next/image";

export interface ITopic {
  slug: string;
  title: string;
  img: StaticImageData | string;
}
