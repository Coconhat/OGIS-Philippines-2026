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
import { missionCreatedTheme, nudgeTierTheme } from "@/lib/data";
import { Pressable } from "./pressable";
import { MarkAfk } from "@/components/demo/sim-icons";
import {
  IconAlertTriangle,
  IconClock,
  IconEye,
  IconMoon,
  IconTarget,
  IconX,
} from "@/components/icons";

const glyphs = {
  eye: IconEye,
  clock: IconClock,
  alertTriangle: IconAlertTriangle,
  moon: IconMoon,
  target: IconTarget,
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
  /* A written mission is not a fifth warning tier — it's the one thing
     in this channel that hands you something, so it never borrows a
     tier's colour. */
  const written = nudge.kind === "missionCreated";
  const theme = written ? missionCreatedTheme : nudgeTierTheme[nudge.tier];

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

  const urgent = !written && nudge.tier >= 3;

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
      className={`mx-2.5 mt-2.5 overflow-hidden rounded-[26px] bg-app-surface ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgb(23_23_23/0.06),0_12px_32px_rgb(23_23_23/0.16)] ${
        phase === "out"
          ? "animate-[banner-out_.28s_var(--ease-ios)_both]"
          : "animate-[banner-in_.42s_var(--ease-spring)_both]"
      }`}
    >
      <div className="p-4 pb-3.5">
        {/* iOS notification header: real app icon, app name, timestamp. */}
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-[30px] shrink-0 place-items-center rounded-[9px] text-white shadow-[0_1px_2px_rgb(180_90_0/0.35)]"
            style={{
              background:
                "linear-gradient(155deg, #ffc07a 0%, #ff9d33 46%, #f07800 100%)",
            }}
          >
            <MarkAfk size={17} />
          </span>
          <span className="text-[13px] font-extrabold tracking-tight text-label">
            AFK
          </span>
          {/* Severity as a soft dot-chip — colour plus a glyph, never
              colour alone. */}
          <span
            className={`inline-flex items-center gap-1 rounded-pill px-2 py-[3px] text-[10.5px] font-bold ${theme.chip}`}
          >
            <Glyph size={10} />
            {theme.label}
          </span>
          <span className="ml-auto text-[12px] font-medium text-label-3">
            now
          </span>
          <Pressable
            onPress={() => setPhase("out")}
            aria-label="Dismiss notification"
            highlight="opacity"
            className="-mr-1 grid size-7 shrink-0 place-items-center rounded-pill bg-fill-2 text-label-3"
          >
            <IconX size={12} strokeWidth={2.8} />
          </Pressable>
        </div>

        <p className="mt-2.5 text-[15.5px] leading-snug font-bold tracking-tight text-balance text-label">
          {nudge.headline}
        </p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-balance text-label-2">
          {nudge.body}
        </p>

        {/* The measurement that earns the nudge — quiet, factual, the
            number sitting right under the claim. */}
        <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold tabular-nums text-label-3">
          <span className={`size-1.5 rounded-pill ${theme.stripe}`} />
          {nudge.evidence}
        </span>
      </div>

      {/* iOS interactive-notification actions: full-width, split by
          hairlines. Siblings of the body, never nested — a button inside
          a tappable card wrecks keyboard order. */}
      {nudge.actions.length > 0 && (
        <div className="grid border-t border-separator" style={{ gridTemplateColumns: `repeat(${nudge.actions.length}, 1fr)` }}>
          {nudge.actions.map((a, i) => {
            const primary = i === 0;
            const tint = !primary
              ? "font-semibold text-label-2"
              : written
                ? "font-bold text-mint-text"
                : urgent
                  ? "font-bold text-coral-text"
                  : "font-bold text-accent-text";
            return (
              <button
                key={a.label}
                type="button"
                onClick={() => onAction(a)}
                className={`min-h-[50px] cursor-pointer px-3 text-[15px] transition-colors duration-150 active:bg-fill-2 ${
                  i > 0 ? "border-l border-separator" : ""
                } ${tint}`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
