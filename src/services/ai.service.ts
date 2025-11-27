// src/services/ai.service.ts
export type Label = "crypto" | "offtopic" | "uncertain";

export type MisinfoRisk =
  | "ok_informative"
  | "satire_or_obvious_fake"
  | "dubious_or_conspiratorial"
  | "scam_or_financial_fraud"
  | "not_about_crypto";

export type AiDecision = "allow" | "warn" | "block";

export type EventAI = {
  // Tema (se é cripto ou não)
  label: Label;
  score: number;
  reasons: string[];

  // Moderação dura (bloqueio)
  blocked: boolean;
  block_reasons: string[];

  // Desinformação / risco / aviso visual
  misinfo_risk: MisinfoRisk;
  decision: AiDecision;
  ui_label: string;
  reason: string;

  version: string;
};

export async function classifyEventLocalAPI(
  title: string,
  description: string
): Promise<EventAI> {
  const res = await fetch("/api/ai/classify-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    // aqui usamos "description", batendo com a rota
    body: JSON.stringify({ title, description }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `IA HTTP ${res.status}`);
  }

  return (await res.json()) as EventAI;
}
