/** Junta classes condicionais de forma segura. */
export function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/** Formata um ISO date/time para um texto relativo em PT-BR. */
export function formatRelative(iso: string, nowDate?: Date) {
  const d = new Date(iso);
  const now = nowDate ?? new Date();

  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (!Number.isFinite(diffSec)) return "";

  if (diffSec < 0) return "agora";
  if (diffSec < 60) return "agora";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min atrás`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} h atrás`;

  const days = Math.floor(diffSec / 86400);
  if (days === 1) return "ontem";
  return `${days} dias atrás`;
}
