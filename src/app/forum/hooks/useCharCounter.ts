export function useCharCounter(value: string, max: number) {
  const count = value?.length ?? 0;
  const pct = Math.min(100, Math.round((count / max) * 100));
  return { count, pct };
}
