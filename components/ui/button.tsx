"use client";

import type { ReactNode } from "react";
import { Pressable } from "./pressable";

type Variant = "filled" | "tinted" | "gray" | "plain" | "destructive";
type Size = "large" | "medium" | "small";
type Tint = "accent" | "ink" | "coral" | "mint";

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  tint?: Tint;
  full?: boolean;
  icon?: ReactNode;
  href?: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

/* Filled buttons use the deeper end of each hue so white text clears
   3:1 — white on plain #ff8c17 is only 2.4:1. */
const fill: Record<Tint, string> = {
  accent: "bg-accent-deep text-white",
  ink: "bg-ink text-white",
  coral: "bg-coral-text text-white",
  mint: "bg-mint-text text-white",
};

const tinted: Record<Tint, string> = {
  accent: "bg-accent-dim text-accent-text",
  ink: "bg-fill-2 text-label",
  coral: "bg-coral-dim text-coral-text",
  mint: "bg-mint-dim text-mint-text",
};

const plain: Record<Tint, string> = {
  accent: "text-accent-text",
  ink: "text-label",
  coral: "text-coral-text",
  mint: "text-mint-text",
};

/* `small` keeps a 34px look but pads out to a 44px hit area — the
   minimum target, non-negotiable. */
const sizing: Record<Size, string> = {
  large: "min-h-[50px] px-6 text-headline rounded-[16px]",
  medium: "min-h-[44px] px-5 text-headline rounded-control",
  small: "min-h-[44px] px-3.5 text-footnote font-semibold rounded-control",
};

export function Button({
  children,
  variant = "filled",
  size = "medium",
  tint = "accent",
  full = false,
  icon,
  href,
  onPress,
  disabled,
  className = "",
  ...aria
}: ButtonProps) {
  const look =
    variant === "filled"
      ? `${fill[tint]} shadow-raised`
      : variant === "tinted"
        ? tinted[tint]
        : variant === "gray"
          ? "bg-fill-2 text-label"
          : variant === "destructive"
            ? "bg-coral-dim text-coral-text"
            : plain[tint];

  return (
    <Pressable
      href={href}
      onPress={onPress}
      disabled={disabled}
      highlight="scale"
      haptics={variant === "filled" ? "medium" : "light"}
      className={`inline-flex items-center justify-center gap-2 font-semibold ${sizing[size]} ${look} ${
        full ? "w-full" : ""
      } ${className}`}
      {...aria}
    >
      {icon}
      {children}
    </Pressable>
  );
}
