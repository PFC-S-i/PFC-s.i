"use client";

import { useMemo } from "react";
import type { ITopic } from "@/types/topics.type";
import { EDUCATIONAL_TOPICS } from "../data/topics.data";

export function useEducationalTopics() {
  const topics = useMemo<ITopic[]>(() => EDUCATIONAL_TOPICS, []);
  return { topics };
}
