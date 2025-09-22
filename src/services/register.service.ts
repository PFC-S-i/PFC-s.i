export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  id: string;
  email: string;
  name: string;
};

// -------- tipos/guards para lidar com `detail` da API --------
type ApiDetailArrayItem = { msg?: string; [k: string]: unknown };
type ApiErrorDetail = string | ApiDetailArrayItem[] | unknown;

function isDetailArray(detail: ApiErrorDetail): detail is ApiDetailArrayItem[] {
  return Array.isArray(detail);
}
function isStringDetail(detail: ApiErrorDetail): detail is string {
  return typeof detail === "string";
}
type ApiMaybeError = Partial<Record<"detail", ApiErrorDetail>>;

/**
 * Faz o POST para /api/register (rota do Next que faz proxy para o backend).
 */
export async function registerUser(
  payload: RegisterRequest
): Promise<RegisterResponse> {
  const res = await fetch(`/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    let message = "Não foi possível criar sua conta.";
    const detail = (data as ApiMaybeError).detail;

    if (isDetailArray(detail) && detail[0]?.msg) {
      message = detail[0].msg ?? message;
    } else if (isStringDetail(detail)) {
      message = detail;
    }

    throw new Error(message);
  }

  // Backend promete { id, email, name }
  const parsed = data as RegisterResponse;
  if (!parsed?.id || !parsed?.email) {
    throw new Error("Resposta inválida do servidor ao registrar.");
  }

  return parsed;
}
