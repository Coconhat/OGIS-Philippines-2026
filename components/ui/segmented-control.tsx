"use client";

/* iOS segmented control. The thumb translates on a spring — that
   overshoot is most of what makes the control feel native.
   Semantics are radiogroup, not a row of aria-pressed buttons: this
   is single-select, and the old Home ladder had it wrong. */

import { useRef } from "react";
import { haptic } from "@/lib/haptics";

type Option<T> = { value: T; label: string; sublabel?: string };

type SegmentedControlProps<T extends string | number> = {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  /** Accessible name for the group. */
  label: string;
  size?: "regular" | "tall";
  className?: string;
};

export function SegmentedControl<T extends string | number>({
  value,
  onChange,
  options,
  label,
  size = "regular",
  className = "",
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  const select = (i: number) => {
    const next = options[i];
    if (!next) return;
    haptic("light");
    onChange(next.value);
    refs.current[i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      select((index + 1) % options.length);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      select((index - 1 + options.length) % options.length);
    }
    if (e.key === "Home") {
      e.preventDefault();
      select(0);
    }
    if (e.key === "End") {
      e.preventDefault();
      select(options.length - 1);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={`relative flex rounded-[10px] bg-fill-1 p-[2px] ${className}`}
    >
      {/* Thumb */}
      <span
        aria-hidden
        className="absolute top-[2px] bottom-[2px] rounded-[8px] bg-white shadow-[0_3px_8px_rgb(0_0_0/0.12),0_3px_1px_rgb(0_0_0/0.04)] transition-transform duration-[--duration-control] ease-spring"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={String(o.value)}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => select(i)}
            className={`relative z-10 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-[8px] px-1 transition-colors duration-200 ${
              size === "tall" ? "min-h-[48px] py-1.5" : "min-h-[34px]"
            } ${selected ? "text-label" : "text-label-2"}`}
          >
            <span className="text-footnote font-semibold">{o.label}</span>
            {o.sublabel && (
              <span className="text-caption mt-px font-medium text-label-2">
                {o.sublabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
