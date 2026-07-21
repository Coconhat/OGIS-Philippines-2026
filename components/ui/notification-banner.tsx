"use client";

/* The in-the-moment nudge, shaped like an iOS notification.

   Deliberately NOT an Alert: `Alert variant="critical"` means someone
   real needed you and AFK let them through — the app's most loaded beat.
   A nudge is the opposite vector: nobody called, you went anyway. Same
   treatment for both makes them indistinguishable at a glance.

   So this is non-modal. It does not trap focus, does not steal focus,
   and does not stop you scrolling. `aria-live` does the announcing. A
   modal that seizes the phone because you scrolled is the paternalistic
   screen-time UX this product argues against.

   Opacity note: this used `material-bar` (translucent + backdrop-blur)
   and you could read the feed straight through it. backdrop-filter
   doesn't composite reliably on an element running a transform
   animation, so the blur silently dropped and left only the 76% white.
   A notification has to be legible over arbitrary content — it's opaque
   now, and the depth comes from the shadow instead. */

import { useEffect, useRef, useState } from "react";
import type { Nudge, NudgeAction } from "@/lib/data";
import { nudgeTierTheme } from "@/lib/data";
import { Pressable } from "./pressable";
import { Button } from "./button";
import { MarkAfk } from "@/components/demo/sim-icons";
import {
  IconAlertTriangle,
  IconClock,
  IconEye,
  IconMoon,
  IconX,
} from "@/components/icons";

const glyphs = {
  eye: IconEye,
  clock: IconClock,
  alertTriangle: IconAlertTriangle,
  moon: IconMoon,
};

// If `animationend` never fires (background tab, interrupted animation)
// the banner would stick around forever. Belt and braces.
const EXIT_FALLBACK_MS = 500;
const SWIPE_DISMISS_PX = 40;

type Props = {
  nudge: Nudge;
  /** Honoured only when motion is allowed — auto-dismissing text is a
      WCAG 2.2.1 timing issue independent of motion preference. */
  autoDismiss: boolean;
  onAction: (action: NudgeAction) => void;
  onDismiss: () => void;
};

export function NotificationBanner({
  nudge,
  autoDismiss,
  onAction,
  onDismiss,
}: Props) {
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const Glyph = glyphs[nudge.icon];
  const theme = nudgeTierTheme[nudge.tier];

  /* NudgeHost keys this on `nudge.id`, so a new nudge remounts and
     `phase`/`drag` start fresh. Don't drop that key — without it a
     banner that superseded a dismissing one would inherit its exit. */

  useEffect(() => {
    if (phase !== "out") return;
    const t = setTimeout(onDismiss, EXIT_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [phase, onDismiss]);

  useEffect(() => {
    if (!autoDismiss || !nudge.autoDismissMs) return;
    const t = setTimeout(() => setPhase("out"), nudge.autoDismissMs);
    return () => clearTimeout(t);
  }, [autoDismiss, nudge.autoDismissMs, nudge.id]);

  const urgent = nudge.tier >= 3;

  return (
    <div
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      onAnimationEnd={() => phase === "out" && onDismiss()}
      onPointerDown={(e) => {
        start.current = e.clientY;
      }}
      onPointerMove={(e) => {
        if (start.current === null) return;
        const dy = e.clientY - start.current;
        // Downward drag is resisted; this only dismisses upward.
        setDrag(dy < 0 ? dy : dy * 0.2);
      }}
      onPointerUp={() => {
        if (drag < -SWIPE_DISMISS_PX) setPhase("out");
        else setDrag(0);
        start.current = null;
      }}
      onPointerCancel={() => {
        setDrag(0);
        start.current = null;
      }}
      style={drag ? { transform: `translateY(${drag}px)` } : undefined}
      className={`rounded-tile mx-2.5 mt-2.5 overflow-hidden bg-app-surface shadow-float ring-1 ring-black/5 ${
        phase === "out"
          ? "animate-[banner-out_.28s_var(--ease-ios)_both]"
          : "animate-[banner-in_.42s_var(--ease-spring)_both]"
      }`}
    >
      {/* Tier stripe: colour, but never colour alone — the glyph in the
          chip below carries the same meaning. */}
      <div className={`h-1 w-full ${theme.stripe}`} />

      <div className="p-3.5">
        {/* The iOS notification header: app icon, app name, timestamp. */}
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid size-[18px] shrink-0 place-items-center rounded-[5px] text-accent-deep"
            style={{
              background:
                "linear-gradient(180deg, #ffd9a8 0%, #ffab48 45%, #f07800 100%)",
            }}
          >
            <MarkAfk size={13} />
          </span>
          <span className="text-caption font-bold tracking-wide text-label-2 uppercase">
            AFK
          </span>
          <span
            className={`text-caption rounded-pill px-2 py-0.5 font-bold ${theme.chip}`}
          >
            {theme.label}
          </span>
          <span className="text-caption ml-auto text-label-3">now</span>
          <Pressable
            onPress={() => setPhase("out")}
            aria-label="Dismiss notification"
            highlight="opacity"
            className="-mr-1.5 grid size-11 shrink-0 place-items-center text-label-3"
          >
            <IconX size={14} strokeWidth={2.6} />
          </Pressable>
        </div>

        <p className="text-headline mt-1.5 text-balance text-label">
          {nudge.headline}
        </p>
        <p className="text-footnote mt-1 text-balance text-label-2">
          {nudge.body}
        </p>

        {/* The measurement that earns the nudge. Nothing is asserted
            that can't be pointed at. */}
        <span
          className={`text-caption mt-2.5 inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-bold tabular-nums ${theme.chip}`}
        >
          <Glyph size={11} />
          {nudge.evidence}
        </span>
      </div>

      {/* Actions are siblings of the body, never nested — a button
          inside a tappable card is invalid HTML and wrecks keyboard
          order. mission-row.tsx solves the same problem the same way. */}
      {nudge.actions.length > 0 && (
        <div className="flex gap-2 border-t border-separator p-2.5">
          {nudge.actions.map((a, i) => (
            <Button
              key={a.label}
              /* `tinted` only — `filled` carries an internal
                 shadow-raised, and the banner is already shadow-float. */
              variant="tinted"
              tint={i === 0 && urgent ? "coral" : i === 0 ? "accent" : "ink"}
              size="small"
              full
              onPress={() => onAction(a)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
