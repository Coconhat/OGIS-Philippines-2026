/* 4px capsule. Every bar in the app used to be a bare div with no
   role and no value — screen readers got nothing. */

type ProgressProps = {
  value: number; // 0..1
  label: string; // required — what this bar measures
  tint?: "accent" | "mint" | "coral" | "sky";
  className?: string;
};

const tints = {
  accent: "bg-accent",
  mint: "bg-mint",
  coral: "bg-coral",
  sky: "bg-sky",
};

export function Progress({
  value,
  label,
  tint = "accent",
  className = "",
}: ProgressProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-1 overflow-hidden rounded-pill bg-fill-1 ${className}`}
    >
      <div
        className={`h-full rounded-pill transition-[width] duration-700 ease-ios ${tints[tint]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
