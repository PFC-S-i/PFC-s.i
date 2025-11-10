// src/services/ai.service.ts
type Label = "crypto" | "offtopic" | "uncertain";
export type EventAI = { label: Label; score: number; reasons: string[]; version: string };

export async function classifyEventLocalAPI(
  title: string,
  description: string
): Promise<EventAI> {
  const res = await fetch("/api/ai/classify-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ title, description }),
  });

  if (!res.ok) {
    // Lança para o caller (post-card) poder fazer retry/backoff.
    const text = await res.text().catch(() => "");
    throw new Error(text || `IA HTTP ${res.status}`);
  }

  return (await res.json()) as EventAI;
}
