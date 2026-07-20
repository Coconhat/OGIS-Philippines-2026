"use client";

/* Swipe-to-reveal actions.
   Swipe is neither discoverable nor accessible on its own, so every
   consumer must also expose the same actions through a visible
   control. This component only provides the gesture affordance. */

import { useRef, useState, type ReactNode } from "react";
import { haptic } from "@/lib/haptics";

const ACTION_WIDTH = 84;

export type SwipeAction = {
  label: string;
  onPress: () => void;
  tone?: "mint" | "coral" | "gray";
  icon?: ReactNode;
};

const tones = {
  mint: "bg-mint-text text-white",
  coral: "bg-coral-text text-white",
  gray: "bg-fill-1 text-label",
};

export function SwipeRow({
  actions,
  children,
  className = "",
}: {
  actions: SwipeAction[];
  children: ReactNode;
  className?: string;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const open = useRef(false);

  const maxOffset = actions.length * ACTION_WIDTH;

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    // Let vertical scrolling win.
    if (Math.abs(dy) > Math.abs(dx)) {
      start.current = null;
      return;
    }
    setDragging(true);
    const base = open.current ? -maxOffset : 0;
    setOffset(Math.min(0, Math.max(-maxOffset - 20, base + dx)));
  };

  const onPointerUp = () => {
    if (!start.current && !dragging) return;
    start.current = null;
    setDragging(false);
    const shouldOpen = offset < -maxOffset / 2;
    if (shouldOpen !== open.current) haptic("light");
    open.current = shouldOpen;
    setOffset(shouldOpen ? -maxOffset : 0);
  };

  return (
    <div className={`relative overflow-hidden rounded-tile ${className}`}>
      <div className="absolute inset-y-0 right-0 flex" aria-hidden>
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            tabIndex={-1}
            onClick={() => {
              a.onPress();
              open.current = false;
              setOffset(0);
            }}
            style={{ width: ACTION_WIDTH }}
            className={`text-footnote flex cursor-pointer flex-col items-center justify-center gap-1 font-semibold ${
              tones[a.tone ?? "gray"]
            }`}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging
            ? "none"
            : "transform var(--duration-control) var(--ease-ios)",
        }}
        className="relative touch-pan-y"
      >
        {children}
      </div>
    </div>
  );
}
