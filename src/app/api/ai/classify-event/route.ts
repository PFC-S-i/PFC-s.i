// src/app/api/ai/classify-event/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Label = "crypto" | "offtopic" | "uncertain";

type Out = {
  label: Label;
  score: number; // 0–1 confiança no rótulo de tema
  reasons: string[];

  blocked: boolean;
  block_reasons: string[];

  version: string;
};

type RawClassification = {
  label?: unknown;
  score?: unknown;
  reasons?: unknown;
  blocked?: unknown;
  block_reasons?: unknown;
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
  "TAREFA 2 – MODERAÇÃO / CONTEÚDO PROBLEMÁTICO:",
  "- Verifique se há:",
  "  * discurso de ódio, ofensas graves, xingamentos direcionados a pessoas ou grupos;",
  "  * ameaças, incentivo à violência ou apologia a crimes (roubo, tráfico, fraude, golpe, lavagem de dinheiro etc.);",
  "  * instruções para praticar atividades ilegais ou claramente maliciosas (por exemplo, invadir sistemas, espalhar malware, roubar senhas, fraudar mercado etc.);",
  "  * conteúdo sexual explícito, exploração de menores, ou temas sexuais inapropriados;",
  "  * incentivo à auto-mutilação ou suicídio.",
  '- Se houver QUALQUER desses itens, considere que o post deve ser BLOQUEADO.',
  "",
  "SAÍDA:",
  "Você DEVE responder estritamente em JSON, no formato:",
  `{
    "label": "crypto" | "offtopic" | "uncertain",
    "score": number (0 a 1),
    "reasons": ["texto explicando sua decisão sobre o tema"],
    "blocked": boolean,
    "block_reasons": ["se blocked=true, liste motivos de moderação; se false, pode ser []"],
    "version": "v2-moderation-2025-11"
  }`,
].join("\n");

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, content } = body as {
      title?: string;
      content?: string;
    };

    if (!title && !content) {
      return NextResponse.json(
        { error: "title ou content são obrigatórios" },
        { status: 400 }
      );
    }

    const userText = `TÍTULO: ${title ?? ""}\n\nCONTEÚDO:\n${content ?? ""}`;

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
      // fallback bruto em caso de resposta mal-formatada
      parsed = {};
    }

    const out: Out = {
      label: validateLabel(parsed.label),
      score: typeof parsed.score === "number" ? clamp(parsed.score, 0, 1) : 0,
      reasons: Array.isArray(parsed.reasons)
        ? parsed.reasons.map(String)
        : ["Classificação gerada sem motivos detalhados."],
      blocked:
        typeof parsed.blocked === "boolean" ? parsed.blocked : false,
      block_reasons: Array.isArray(parsed.block_reasons)
        ? parsed.block_reasons.map(String)
        : [],
      version:
        typeof parsed.version === "string"
          ? parsed.version
          : "v2-moderation-2025-11",
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

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
