"use client";

type Range = { label: string; hours: number };

type Props = {
  ranges: readonly Range[];
  selected: Range;
  onSelect: (r: Range) => void;
  leading?: React.ReactNode; // ex: ícone + "Intervalo:"
};

export function RangePicker({ ranges, selected, onSelect, leading }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-4">
      {leading}

      <div className="flex items-center gap-2">
        {ranges.map((r) => (
          <button
            key={r.label}
            onClick={() => onSelect(r)}
            className={
              r.label === selected.label
                ? "rounded-lg border px-3 py-1.5 transition border-white/40 bg-white/10"
                : "rounded-lg border px-3 py-1.5 transition border-white/10 hover:bg-white/5"
            }
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
