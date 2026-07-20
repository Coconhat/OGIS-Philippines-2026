"use client";

/* The interaction substrate every other primitive builds on.
   The detail that matters here is cancel-on-scroll: native lists drop
   their highlight the moment your finger starts moving. Without it,
   rows stay lit while you scroll and the whole app feels like a web
   page in a phone frame. */

import Link from "next/link";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { haptic, type HapticKind } from "@/lib/haptics";

const CANCEL_THRESHOLD = 10; // px of movement before we treat it as a scroll

export type PressableProps = {
  href?: string;
  onPress?: () => void;
  /** How the press reads. `fill` for rows, `scale` for buttons. */
  highlight?: "fill" | "scale" | "opacity" | "none";
  haptics?: HapticKind;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<
  React.HTMLAttributes<HTMLElement>,
  "onClick" | "className" | "children"
>;

export function Pressable({
  href,
  onPress,
  highlight = "fill",
  haptics = "light",
  disabled = false,
  className = "",
  children,
  ...rest
}: PressableProps) {
  const [pressed, setPressed] = useState(false);
  const origin = useRef<{ x: number; y: number } | null>(null);

  const down = useCallback((e: React.PointerEvent) => {
    origin.current = { x: e.clientX, y: e.clientY };
    setPressed(true);
  }, []);

  const move = useCallback((e: React.PointerEvent) => {
    const o = origin.current;
    if (!o) return;
    if (
      Math.abs(e.clientX - o.x) > CANCEL_THRESHOLD ||
      Math.abs(e.clientY - o.y) > CANCEL_THRESHOLD
    ) {
      origin.current = null;
      setPressed(false);
    }
  }, []);

  const end = useCallback(() => {
    origin.current = null;
    setPressed(false);
  }, []);

  const activate = useCallback(() => {
    if (disabled) return;
    haptic(haptics);
    onPress?.();
  }, [disabled, haptics, onPress]);

  const pressStyles =
    highlight === "none" || disabled
      ? ""
      : highlight === "fill"
        ? pressed
          ? "bg-fill-3"
          : "bg-transparent"
        : highlight === "scale"
          ? pressed
            ? "scale-[0.965]"
            : "scale-100"
          : pressed
            ? "opacity-60"
            : "opacity-100";

  const transition =
    highlight === "fill"
      ? // instant in, eased out — matches UITableViewCell
        pressed
        ? "transition-none"
        : "transition-colors duration-200"
      : "transition-transform duration-[--duration-control] ease-spring";

  const cls = [
    "select-none touch-manipulation outline-none",
    disabled ? "opacity-40 pointer-events-none" : "cursor-pointer",
    pressStyles,
    transition,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handlers = {
    onPointerDown: down,
    onPointerMove: move,
    onPointerUp: end,
    onPointerCancel: end,
    onPointerLeave: end,
  };

  if (href && !disabled) {
    return (
      <Link href={href} className={cls} onClick={activate} {...handlers} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={activate}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...handlers}
      {...rest}
    >
      {children}
    </button>
  );
}
