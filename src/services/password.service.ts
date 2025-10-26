const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

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

  // Se a API retornar erro, tentamos extrair a mensagem
  if (!res.ok) {
    let detail = "Não foi possível enviar as instruções. Tente novamente.";
    try {
      const data = await res.json();
      if (typeof data === "string") return data; // fallback incomum
      if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
        detail = data.detail[0].msg;
      } else if (data?.detail) {
        detail =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      }
    } catch {
      /* ignore parsing errors */
    }
    throw new Error(detail);
  }

  // Espera um JSON string: "ok" / "enviado" etc.
  try {
    const data = await res.json();
    return typeof data === "string" ? data : "Verifique seu e-mail.";
  } catch {
    return "Verifique seu e-mail.";
  }
}

export async function resetPassword(
  token: string,
  newPassword: string,
  signal?: AbortSignal
): Promise<string> {
  const API = (
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");

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
    let detail =
      res.status === 400
        ? "Token inválido ou expirado. Solicite um novo link."
        : "Não foi possível redefinir a senha. Tente novamente.";
    try {
      const data = await res.json();
      if (typeof data === "string") detail = data;
      else if (data?.detail) {
        detail =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      }
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  try {
    const data = await res.json();
    return typeof data === "string" ? data : "Senha redefinida com sucesso.";
  } catch {
    return "Senha redefinida com sucesso.";
  }
}
