"use client";

import { useEducationalTopics } from "../hooks/use-educational-topics";
import { TopicCard } from "./topic-card";

export function TopicsGrid() {
  const { topics } = useEducationalTopics();

  return (
    <div className="grid gap-6 sm:gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((t, i) => (
        <TopicCard key={t.slug} topic={t} index={i} />
      ))}
    </div>
  );
}
