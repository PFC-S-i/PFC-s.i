// src/app/api/ai/classify-event/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // garante ambiente Node (não Edge)

type Label = "crypto" | "offtopic" | "uncertain";
type Out = { label: Label; score: number; reasons: string[]; version: string };

const SYS_PROMPT =
  "Você é um classificador para eventos do ecossistema de criptomoedas. " +
  "Decida se o texto está relacionado a CRIPTO (blockchain, tokens, exchanges, carteiras, mineração, DeFi, NFTs, " +
  "regulação de cripto, hacks/exploits on-chain, airdrops, L2 etc.), FORA DO ESCOPO, ou INCERTO (falta contexto). " +
  "Responda apenas JSON no formato solicitado.";

function userPrompt(title: string, description: string) {
  return (
    "Classifique o evento a seguir.\n\n" +
    `Título: ${title.trim()}\n` +
    `Descrição: ${(description || "").trim()}\n\n` +
    "Regras:\n" +
    "- 'crypto' quando houver relação clara com criptomoedas/blockchain (nomes de moedas, exchanges, tokens, on-chain, etc.).\n" +
    "- 'offtopic' quando for alheio (ex.: esportes, política sem vínculo com cripto, tecnologia sem blockchain, etc.).\n" +
    "- 'uncertain' quando faltar contexto.\n" +
    "Retorne JSON com: { label: 'crypto|offtopic|uncertain', score: 0..1, reasons: string[<=8], version: string }.\n" +
    "O JSON deve ser válido e completo."
  );
}

function sanitize(out: any, model: string): Out {
  const label = (out?.label || "").toString() as Label;
  const allowed: Label[] = ["crypto", "offtopic", "uncertain"];
  const okLabel = allowed.includes(label) ? label : "uncertain";

  let score = Number(out?.score);
  if (!Number.isFinite(score)) score = 0.5;
  if (score < 0) score = 0;
  if (score > 1) score = 1;

  let reasons: string[] = Array.isArray(out?.reasons) ? out.reasons : [];
  reasons = reasons.map((s) => String(s)).slice(0, 8);

  const version = String(out?.version || `${model}@json`);

  return { label: okLabel, score: Number(score.toFixed(4)), reasons, version };
}

export async function POST(req: Request) {
  try {
    const { title, description } = (await req.json()) as {
      title?: string;
      description?: string;
    };

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "title é obrigatório (string)" },
        { status: 400 }
      );
    }

    const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
    if (provider !== "openai") {
      return NextResponse.json(
        { error: "AI_PROVIDER diferente de 'openai' não configurado nesta rota" },
        { status: 501 }
      );
    }

    const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY não configurada" },
        { status: 500 }
      );
    }

    // JSON mode estável via Chat Completions
    const body = {
      model,
      messages: [
        { role: "system", content: SYS_PROMPT },
        { role: "user", content: userPrompt(title, description || "") },
      ],
      // força JSON bem-formado
      response_format: { type: "json_object" },
      temperature: 0.2,
    };

    const rsp = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!rsp.ok) {
      const detail = await rsp.text();
      return NextResponse.json(
        { error: "Falha na chamada de IA", detail },
        { status: 502 }
      );
    }

    const data = await rsp.json();
    const content =
      data?.choices?.[0]?.message?.content || '{"label":"uncertain","score":0.5,"reasons":[],"version":""}';

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { label: "uncertain", score: 0.5, reasons: [], version: "" };
    }

    const out = sanitize(parsed, model);
    return NextResponse.json(out, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro inesperado", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
