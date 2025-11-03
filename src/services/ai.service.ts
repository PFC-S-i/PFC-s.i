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
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) {
    // fallback conservador
    return { label: "uncertain", score: 0.5, reasons: ["ai_error"], version: "local@error" };
  }
  return (await res.json()) as EventAI;
}
