"use client";

/* The expressive card — the app's main surface.
   Meaning is carried by tone (color), not by elevation. Tiles are flat
   by default; `raised` is budgeted to one element per screen. */

import type { ReactNode } from "react";
import { Pressable } from "./pressable";

export type TileTone =
  | "plain"
  | "mute" // suppressed
  | "reply" // replied
  | "act" // acted
  | "alert" // escalated
  | "brand"; // the wallpaper gradient — budgeted, see docs/design-tokens.md

type TileProps = {
  children: ReactNode;
  tone?: TileTone;
  raised?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  href?: string;
  onPress?: () => void;
  className?: string;
  "aria-label"?: string;
};

/* Bright fills (alert, brand) take ink text rather than white — the
   reference decks do the same, and white on #ff6154 is only 3.0:1. */
const tones: Record<TileTone, string> = {
  plain: "bg-app-surface text-label",
  mute: "bg-card-mute text-label",
  reply: "bg-card-reply text-label",
  act: "bg-card-act text-label",
  alert: "bg-card-alert text-label",
  brand: "wallpaper text-label",
};

const pads = {
  none: "",
  sm: "p-3.5",
  md: "p-4",
  lg: "p-5",
};

export function Tile({
  children,
  tone = "plain",
  raised = false,
  padding = "md",
  href,
  onPress,
  className = "",
  ...aria
}: TileProps) {
  const cls = `rounded-tile overflow-hidden ${tones[tone]} ${pads[padding]} ${
    raised ? "shadow-raised" : "shadow-flat"
  } ${className}`;

  if (href || onPress) {
    return (
      <Pressable
        href={href}
        onPress={onPress}
        highlight="scale"
        className={`block w-full text-left ${cls}`}
        {...aria}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <div className={cls} {...aria}>
      {children}
    </div>
  );
}
