/* One divided group instead of three floating stat cards.
   Each stat carries a tinted glyph — three bare numerals in a row read
   as a spreadsheet, and these are the metrics the whole product is
   arguing for. */

import type { ReactNode } from "react";

type Tint = "accent" | "mint" | "coral" | "sky";

type Item = {
  value: string;
  label: string;
  /** Full phrase for screen readers, e.g. "37 interruptions avoided". */
  readAs?: string;
  icon?: ReactNode;
  tint?: Tint;
  prominent?: boolean;
};

const chip: Record<Tint, string> = {
  accent: "bg-accent-dim text-accent-text",
  mint: "bg-mint-dim text-mint-text",
  coral: "bg-coral-dim text-coral-text",
  sky: "bg-sky-dim text-sky-text",
};

export function SummaryBoard({
  items,
  className = "",
}: {
  items: Item[];
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-3 overflow-hidden rounded-group bg-app-surface ${className}`}
    >
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`flex flex-col items-center px-2 py-4 text-center ${
            i > 0 ? "border-l border-separator" : ""
          }`}
        >
          {it.icon && (
            <span
              aria-hidden
              className={`mb-1.5 grid size-7 place-items-center rounded-pill ${
                chip[it.tint ?? "accent"]
              }`}
            >
              {it.icon}
            </span>
          )}
          <p
            className={`text-title-2 tabular-nums ${
              it.prominent ? "text-accent-text" : "text-label"
            }`}
            aria-label={it.readAs ?? `${it.value} ${it.label}`}
          >
            {it.value}
          </p>
          <p
            className="text-caption mt-0.5 leading-tight text-label-2"
            aria-hidden
          >
            {it.label}
          </p>
        </div>
      ))}
    </div>
  );
}
