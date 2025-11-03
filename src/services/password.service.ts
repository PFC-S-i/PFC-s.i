const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");
 
async function tryParseJson(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
function toMessage(data: unknown, fallback: string): string {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    const d = obj.detail as unknown;
    if (typeof d === "string") return d;
    if (Array.isArray(d) && d[0] && typeof d[0] === "object") {
      const first = d[0] as Record<string, unknown>;
      if (typeof first.msg === "string") return first.msg;
    }
  }
  return fallback;
}

export async function requestPasswordReset(
  email: string,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch(`${API}/api/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: email.trim() }),
    signal,
  });

  if (!res.ok) {
    const data = await tryParseJson(res);
    throw new Error(
      toMessage(data, "Não foi possível enviar as instruções. Tente novamente.")
    );
  }

  const data = await tryParseJson(res);
  if (typeof data === "string") return data;
  return toMessage(
    data,
    "Se existir uma conta, enviaremos o link de redefinição."
  );
}

export async function resetPassword(
  token: string,
  newPassword: string,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch(`${API}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ token: token.trim(), new_password: newPassword }),
    signal,
  });

  if (!res.ok) {
    const data = await tryParseJson(res);
    const fallback =
      res.status === 400
        ? "Token inválido ou expirado. Solicite um novo link."
        : "Não foi possível redefinir a senha. Tente novamente.";
    throw new Error(toMessage(data, fallback));
  }

  const data = await tryParseJson(res);
  if (typeof data === "string") return data;
  return toMessage(data, "Senha redefinida com sucesso.");
}