import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function GET() {
  // só para testar no navegador
  return NextResponse.json({ health: "ok" });
}

export async function POST(req: NextRequest) {
  try {
    if (!API_URL) {
      return NextResponse.json(
        { detail: "API base não configurada (NEXT_PUBLIC_API_URL)." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { detail: text || res.statusText };
    }

    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { detail: "Erro ao comunicar com o backend de registro." },
      { status: 502 }
    );
  }
}
