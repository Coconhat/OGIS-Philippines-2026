"use client";

/* The autonomy dial.

   Rendered as a stepped power meter rather than a slider: four bars of
   increasing height that fill as you hand over more. A plain track says
   "a value between two ends"; rising bars say "you are giving this thing
   more power", which is what the control actually means.

   It's a radiogroup underneath — arrow keys, Home/End and roving
   tabindex behave exactly like SegmentedControl. The meter is
   presentation on top of correct semantics, not a replacement. */

import { useRef, useState } from "react";
import { haptic } from "@/lib/haptics";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Stop<T extends number> = { value: T; label: string };

type DialProps<T extends number> = {
  value: T;
  onChange: (value: T) => void;
  stops: Stop<T>[];
  /** Accessible name for the group. */
  label: string;
  className?: string;
};

/** Bars grow left to right, so the shape itself reads as escalation. */
const BAR_HEIGHTS = [22, 34, 46, 58];

export function Dial<T extends number>({
  value,
  onChange,
  stops,
  label,
  className = "",
}: DialProps<T>) {
  const strip = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [dragging, setDragging] = useState(false);
  const reduced = useReducedMotion();

  const index = Math.max(
    0,
    stops.findIndex((s) => s.value === value),
  );
  const last = stops.length - 1;

  const select = (i: number, focus = true) => {
    const next = stops[i];
    if (!next || next.value === value) return;
    haptic("light");
    onChange(next.value);
    if (focus) refs.current[i]?.focus();
  };

  /** Nearest bar to a clientX within the strip. */
  const stopFromX = (clientX: number) => {
    const el = strip.current;
    if (!el) return index;
    const r = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return Math.min(last, Math.floor(ratio * stops.length));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      select(Math.min(last, index + 1));
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      select(Math.max(0, index - 1));
    }
    if (e.key === "Home") {
      e.preventDefault();
      select(0);
    }
    if (e.key === "End") {
      e.preventDefault();
      select(last);
    }
  };

  const glide = reduced
    ? ""
    : "transition-all duration-[--duration-control] ease-spring";

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={`select-none ${className}`}
    >
      <div
        ref={strip}
        onPointerDown={(e) => {
          setDragging(true);
          e.currentTarget.setPointerCapture?.(e.pointerId);
          select(stopFromX(e.clientX), false);
        }}
        onPointerMove={(e) => dragging && select(stopFromX(e.clientX), false)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        className="flex cursor-pointer touch-none items-end gap-2 rounded-tile bg-fill-2 px-3 pt-3 pb-2.5"
        style={{ height: BAR_HEIGHTS[last] + 22 }}
      >
        {stops.map((s, i) => {
          const lit = i <= index;
          const isCurrent = i === index;
          return (
            <span
              key={s.value}
              aria-hidden
              className={`flex-1 rounded-[6px] ${glide} ${
                lit ? "wallpaper" : "bg-fill-1"
              } ${isCurrent && dragging ? "scale-y-105" : ""}`}
              style={{
                height: BAR_HEIGHTS[i] ?? BAR_HEIGHTS[last],
                transformOrigin: "bottom",
                // The live bar glows; the ones behind it sit flat.
                boxShadow: isCurrent
                  ? "0 4px 14px rgb(255 140 23 / 0.45)"
                  : "none",
                opacity: lit ? 1 : 0.9,
              }}
            />
          );
        })}
      </div>

      {/* Real radios, 44pt tall, doubling as the labels. */}
      <div className="flex">
        {stops.map((s, i) => {
          const selected = s.value === value;
          return (
            <button
              key={s.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              className={`text-caption min-h-[44px] flex-1 cursor-pointer px-0.5 pt-1.5 transition-colors duration-200 ${
                selected
                  ? "font-bold text-accent-text"
                  : "font-medium text-label-2"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Read-only echo of the dial, for showing the current rung elsewhere. */
export function LevelMeter({
  index,
  count = 4,
  className = "",
}: {
  index: number;
  count?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-end gap-[3px] ${className}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-[2px] ${i <= index ? "bg-accent" : "bg-fill-1"}`}
          style={{ height: 6 + i * 4 }}
        />
      ))}
    </span>
  );
}
