import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Label = "crypto" | "offtopic" | "uncertain";

type Out = {
  label: Label;
  score: number;
  reasons: string[];
  version: string;
};

type RawClassification = {
  label?: unknown;
  score?: unknown;
  reasons?: unknown;
  version?: unknown;
};

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

function sanitize(
  raw: RawClassification | null | undefined,
  model: string
): Out {
  const allowed: Label[] = ["crypto", "offtopic", "uncertain"];

  const rawLabel = typeof raw?.label === "string" ? raw.label : "";
  const label: Label = allowed.includes(rawLabel as Label)
    ? (rawLabel as Label)
    : "uncertain";

  let score =
    typeof raw?.score === "number" && Number.isFinite(raw.score)
      ? raw.score
      : 0.5;
  if (score < 0) score = 0;
  if (score > 1) score = 1;

  let reasons: string[] = [];
  if (Array.isArray(raw?.reasons)) {
    reasons = raw!.reasons.map((item) => String(item)).slice(0, 8);
  }

  const version =
    typeof raw?.version === "string" && raw.version.trim().length > 0
      ? raw.version
      : `${model}@json`;

  return {
    label,
    score: Number(score.toFixed(4)),
    reasons,
    version,
  };
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
        {
          error: "AI_PROVIDER diferente de 'openai' não configurado nesta rota",
        },
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

    const body = {
      model,
      messages: [
        { role: "system", content: SYS_PROMPT },
        { role: "user", content: userPrompt(title, description || "") },
      ],
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

    const data = (await rsp.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const content =
      data?.choices?.[0]?.message?.content ||
      '{"label":"uncertain","score":0.5,"reasons":[],"version":""}';

    let parsed: unknown;
    try {
      parsed = JSON.parse(content) as unknown;
    } catch {
      parsed = {
        label: "uncertain",
        score: 0.5,
        reasons: [],
        version: "",
      } satisfies RawClassification;
    }

    const out = sanitize(
      typeof parsed === "object" && parsed !== null
        ? (parsed as RawClassification)
        : null,
      model
    );

    return NextResponse.json(out, { status: 200 });
  } catch (err: unknown) {
    const detail =
      err instanceof Error ? err.message : typeof err === "string" ? err : "";
    return NextResponse.json(
      { error: "Erro inesperado", detail },
      { status: 500 }
    );
  }
}
