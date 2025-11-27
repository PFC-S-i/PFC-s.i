// src/app/api/ai/classify-event/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Label = "crypto" | "offtopic" | "uncertain";

type MisinfoRisk =
  | "ok_informative"
  | "satire_or_obvious_fake"
  | "dubious_or_conspiratorial"
  | "scam_or_financial_fraud"
  | "not_about_crypto";

type Decision = "allow" | "warn" | "block";

type Out = {
  label: Label;
  score: number;
  reasons: string[];

  blocked: boolean;
  block_reasons: string[];

  misinfo_risk: MisinfoRisk;
  decision: Decision;
  ui_label: string;
  reason: string;

  version: string;
};

type RawClassification = {
  label?: unknown;
  score?: unknown;
  reasons?: unknown;
  blocked?: unknown;
  block_reasons?: unknown;
  misinfo_risk?: unknown;
  decision?: unknown;
  ui_label?: unknown;
  reason?: unknown;
  version?: unknown;
};

const SYS_PROMPT = [
  "Você é um classificador para posts de fórum sobre o ecossistema de criptomoedas.",
  "",
  "TAREFA 1 – TEMA DO POST:",
  '- Verifique se o texto está relacionado a CRIPTOMOEDAS, blockchain, tokens, exchanges, DeFi, NFTs, Web3, economia ligada a cripto etc.',
  '- Se SIM, use o rótulo "crypto".',
  '- Se NÃO (assunto aleatório, futebol, política geral, fofoca etc.), use o rótulo "offtopic".',
  '- Se você realmente não conseguir decidir, use o rótulo "uncertain".',
  "",
  "TAREFA 2 – RISCO DE DESINFORMAÇÃO / TOM DO CONTEÚDO:",
  "- Classifique o risco de desinformação em uma das categorias:",
  "  * ok_informative: conteúdo plausível, pode conter opinião, mas sem sinais fortes de notícia falsa.",
  "  * satire_or_obvious_fake: texto em tom humorístico ou satírico, com exageros óbvios, poderes impossíveis, personagens inventados etc.",
  "  * dubious_or_conspiratorial: alegações extraordinárias, teorias conspiratórias ou muito improváveis sem evidências.",
  "  * scam_or_financial_fraud: golpes financeiros, promessas garantidas de lucro, esquemas de pirâmide, pedidos suspeitos de envio de dinheiro/chaves privadas.",
  "  * not_about_crypto: quando o tema principal não é cripto (mesmo que cite cripto de leve).",
  "",
  "TAREFA 3 – DECISÃO:",
  "- Defina uma decisão em:",
  '  * allow: pode publicar normalmente.',
  '  * warn: pode publicar, mas com aviso tipo "Possível fake news / sátira".',
  '  * block: não deve publicar.',
  "",
  "REGRAS ESPECIAIS:",
  "- Se houver discurso de ódio, ameaças, incentivo à violência, crimes, conteúdo sexual pesado/inapropriado ou incentivo a auto-mutilação/suicídio, defina decision = \"block\" e blocked = true.",
  "- Se houver golpe financeiro óbvio (scam_or_financial_fraud), use decision = \"block\" e blocked = true.",
  '- Se o texto for claramente satírico ou absurdo (por exemplo Vaticano confiscando todos os Bitcoins do mundo, algoritmos místicos como "Proof of Faith", personagens como "Satoshi São Pedro"), use misinfo_risk = "satire_or_obvious_fake" e decision = "warn" (blocked = false).',
  "",
  "CAMPOS DE SAÍDA:",
  "- score: número de 0 a 1 indicando a confiança no rótulo de TEMA (crypto/offtopic/uncertain).",
  "- reasons: lista curta de textos explicando o porquê do rótulo de TEMA.",
  "- blocked: true somente quando o conteúdo realmente NÃO deve ser publicado.",
  "- block_reasons: se blocked = true, liste os motivos (golpe, ódio, ilegal, etc.). Se blocked = false, use [].",
  '- ui_label: texto curto para aparecer visualmente (ex.: "Conteúdo informativo", "Possível fake news / sátira", "Conteúdo duvidoso, verifique fontes", "Aviso: possível golpe ou fraude").',
  "- reason: uma frase curta explicando o risco de desinformação (ligada a misinfo_risk/decision).",
  "",
  "FORMATO:",
  "Responda ESTRITAMENTE em JSON, sem texto extra, no formato:",
  `{
    "label": "crypto" | "offtopic" | "uncertain",
    "score": 0.0,
    "reasons": ["texto explicando sua decisão sobre o tema"],
    "blocked": false,
    "block_reasons": [],
    "misinfo_risk": "ok_informative" | "satire_or_obvious_fake" | "dubious_or_conspiratorial" | "scam_or_financial_fraud" | "not_about_crypto",
    "decision": "allow" | "warn" | "block",
    "ui_label": "texto curto para badge",
    "reason": "frase explicando o risco de desinformação",
    "version": "v3-moderation-2025-11"
  }`,
].join("\n");

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, description } = body as {
      title?: string;
      description?: string;
    };

    if (!title && !description) {
      return NextResponse.json(
        { error: "title ou description são obrigatórios" },
        { status: 400 }
      );
    }

    const userText = `TÍTULO: ${title ?? ""}\n\nCONTEÚDO:\n${description ?? ""}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: SYS_PROMPT },
        {
          role: "user",
          content: userText,
        },
      ],
    });

    const rawText = completion.choices[0]?.message?.content ?? "{}";

    let parsed: RawClassification;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {};
    }

    const label = validateLabel(parsed.label);
    const misinfo_risk = validateMisinfoRisk(parsed.misinfo_risk, label);
    const decision = validateDecision(parsed.decision);

    const reasons =
      Array.isArray(parsed.reasons) && parsed.reasons.length > 0
        ? parsed.reasons.map(String)
        : ["Classificação gerada sem motivos detalhados."];

    let blocked: boolean;
    if (typeof parsed.blocked === "boolean") {
      blocked = parsed.blocked;
    } else {
      blocked = decision === "block";
    }

    let block_reasons: string[];
    if (Array.isArray(parsed.block_reasons)) {
      block_reasons = parsed.block_reasons.map(String);
    } else if (blocked) {
      block_reasons = ["Conteúdo bloqueado pela moderação automática."];
    } else {
      block_reasons = [];
    }

    const ui_label =
      typeof parsed.ui_label === "string" && parsed.ui_label.trim().length > 0
        ? parsed.ui_label.trim()
        : defaultUiLabel(misinfo_risk);

    const reasonText =
      typeof parsed.reason === "string" && parsed.reason.trim().length > 0
        ? parsed.reason.trim()
        : reasons[0] ?? "Classificação de desinformação gerada sem detalhes.";

    const score =
      typeof parsed.score === "number" ? clamp(parsed.score, 0, 1) : 0;

    const version =
      typeof parsed.version === "string"
        ? parsed.version
        : "v3-moderation-2025-11";

    const out: Out = {
      label,
      score,
      reasons,
      blocked,
      block_reasons,
      misinfo_risk,
      decision,
      ui_label,
      reason: reasonText,
      version,
    };

    return NextResponse.json(out, { status: 200 });
  } catch (err) {
    console.error("Erro em /api/ai/classify-event:", err);
    return NextResponse.json(
      { error: "Erro ao classificar o evento via IA." },
      { status: 500 }
    );
  }
}

function validateLabel(value: unknown): Label {
  if (value === "crypto" || value === "offtopic" || value === "uncertain") {
    return value;
  }
  return "uncertain";
}

function validateMisinfoRisk(
  value: unknown,
  label: Label
): MisinfoRisk {
  if (
    value === "ok_informative" ||
    value === "satire_or_obvious_fake" ||
    value === "dubious_or_conspiratorial" ||
    value === "scam_or_financial_fraud" ||
    value === "not_about_crypto"
  ) {
    return value;
  }

  // Fallback: se não é cripto, marca como fora de tema;
  // se é cripto, assume informativo.
  if (label !== "crypto") {
    return "not_about_crypto";
  }
  return "ok_informative";
}

function validateDecision(value: unknown): Decision {
  if (value === "allow" || value === "warn" || value === "block") {
    return value;
  }
  return "allow";
}

function defaultUiLabel(misinfo_risk: MisinfoRisk): string {
  switch (misinfo_risk) {
    case "satire_or_obvious_fake":
      return "Possível fake news / sátira";
    case "dubious_or_conspiratorial":
      return "Conteúdo duvidoso, verifique fontes";
    case "scam_or_financial_fraud":
      return "Aviso: possível golpe ou fraude";
    case "not_about_crypto":
      return "Conteúdo fora do tema de cripto";
    case "ok_informative":
    default:
      return "Conteúdo informativo";
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
