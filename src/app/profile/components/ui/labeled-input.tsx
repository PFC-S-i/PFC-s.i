type Props = {
  id: string;
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
};

const INPUT =
  "rounded-xl bg-[#151515] border border-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed";

export default function LabeledInput({
  id,
  label,
  type = "text",
  value,
  placeholder,
  disabled,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm opacity-80" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        className={INPUT}
        disabled={disabled}
        aria-busy={disabled ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
