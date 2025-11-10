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

export type UpdateMeRequest = { name: string };

export async function updateMe(body: UpdateMeRequest): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/api/users/me`, {
    method: "PATCH",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    try {
      const data = await res.json();
      throw new Error(getErrorMessage(data));
    } catch {
      const txt = await res.text();
      throw new Error(txt || `Erro ${res.status} ao atualizar o perfil.`);
    }
  }

  return (await res.json()) as MeResponse;
}

/** Exclui definitivamente a conta do usuário autenticado. */
export async function deleteMe(): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/me`, {
    method: "DELETE",
    headers: {
      accept: "application/json",
      ...authHeaders(),
    },
  });

  // Sucesso típico no back: 204 No Content
  if (res.status === 204) return;

  // Alguns backends retornam 200 OK; também tratamos como sucesso.
  if (res.ok) return;

  // Erro → tenta extrair JSON; senão, usa texto
  try {
    const data = await res.json();
    throw new Error(getErrorMessage(data));
  } catch {
    const txt = await res.text();
    throw new Error(txt || `Erro ${res.status} ao excluir a conta.`);
  }
}
