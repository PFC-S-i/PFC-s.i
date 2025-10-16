"use client";

import { authHeaders, getErrorMessage } from "./login.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

export type MeResponse = {
  id: string;
  email: string;
  name: string | null;
};

export async function fetchMe(): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/api/users/me`, {
    method: "GET",
    headers: {
      accept: "application/json",
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    // Tenta extrair uma mensagem útil
    try {
      const data = await res.json();
      throw new Error(getErrorMessage(data));
    } catch {
      const txt = await res.text();
      throw new Error(txt || `Erro ${res.status} ao carregar o perfil.`);
    }
  }

  return (await res.json()) as MeResponse;
}
