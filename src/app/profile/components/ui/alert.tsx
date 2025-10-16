import { type ReactNode } from "react";

export default function Alert({
  kind,
  children,
}: {
  kind: "error" | "success";
  children: ReactNode;
}) {
  const base = "mb-4 rounded-lg px-4 py-2";
  const tone =
    kind === "error"
      ? "border border-red-500/40 bg-red-500/10 text-red-200"
      : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
  return <div className={`${base} ${tone}`}>{children}</div>;
}
