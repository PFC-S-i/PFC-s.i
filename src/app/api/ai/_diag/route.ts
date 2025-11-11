import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const hasKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

  // Tenta um GET leve em /models só para validar conectividade/autorização
  let pingStatus: number | null = null;
  let pingOk = false;
  let pingDetail: unknown = null;

  if (provider === "openai" && hasKey) {
    try {
      const r = await fetch(`${base}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        cache: "no-store",
      });
      pingStatus = r.status;
      if (r.ok) {
        pingOk = true;
      } else {
        try {
          pingDetail = await r.json();
        } catch {
          try {
            pingDetail = await r.text();
          } catch {
            pingDetail = null;
          }
        }
      }
    } catch (e) {
      pingDetail = String(e);
    }
  }

  return NextResponse.json({
    env: {
      provider,
      base,
      model,
      hasKey, // true/false apenas
      node: process.version,
      vercelEnv: process.env.VERCEL_ENV || null,
      region: process.env.VERCEL_REGION || null,
    },
    connectivity: {
      pingOk,
      pingStatus,
      pingDetail,
    },
  });
}
