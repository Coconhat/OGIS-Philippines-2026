"use client";

import { useState } from "react";
import { haptic } from "@/lib/haptics";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={() => {
        haptic("medium");
        onChange(!checked);
      }}
      className={`relative h-[31px] w-[51px] shrink-0 cursor-pointer rounded-pill p-[2px] transition-colors duration-[--duration-control] ${
        checked ? "bg-accent" : "bg-fill-1"
      } ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      {/* The knob widens while held — the real iOS detail. */}
      <span
        className="block h-[27px] rounded-pill bg-white shadow-[0_3px_8px_rgb(23_23_23/0.15),0_3px_1px_rgb(23_23_23/0.06)] transition-all duration-[--duration-control] ease-spring"
        style={{
          width: pressed ? 32 : 27,
          transform: `translateX(${checked ? (pressed ? 15 : 20) : 0}px)`,
        }}
      />
    </button>
  );
}
