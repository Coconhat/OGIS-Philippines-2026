/* The Doorkeeper's voice.
   This and the disclosed-reply signature in Triage are the only two
   places Caveat is allowed to appear in the demo — a consistent rule
   reads as a system, scattered handwriting reads as a mood board. */

import type { ReactNode } from "react";

type SpeechBubbleProps = {
  children: ReactNode;
  /** Handwritten attribution, e.g. "— your AFK assistant" */
  signature?: string;
  tone?: "default" | "alert";
  /** Which side the tail points toward the mascot from. */
  tail?: "bottom" | "top" | "none";
  className?: string;
};

export function SpeechBubble({
  children,
  signature,
  tone = "default",
  tail = "bottom",
  className = "",
}: SpeechBubbleProps) {
  const alert = tone === "alert";

  return (
    <div className={`relative w-fit max-w-[30ch] ${className}`}>
      {/* The hairline matters: on a white card a white bubble has no
          container at all, and the tail reads as a stray triangle. */}
      <div
        className={`rounded-tile px-4 py-3 shadow-raised ${
          alert
            ? "bg-card-alert text-label"
            : "bg-app-surface text-label ring-1 ring-separator"
        }`}
      >
        <p className="text-subhead text-center font-medium text-balance">
          {children}
        </p>
        {signature && (
          <p
            className={`hand text-hand mt-1 text-center ${
              alert ? "text-label/70" : "text-label-2"
            }`}
          >
            {signature}
          </p>
        )}
      </div>

      {tail !== "none" && (
        <span
          aria-hidden
          /* Only the two outward-facing edges get the hairline, so it
             wraps the point without drawing a line through the bubble. */
          className={`absolute left-1/2 size-3.5 -translate-x-1/2 rotate-45 ${
            alert
              ? "bg-card-alert"
              : `bg-app-surface border-separator ${
                  tail === "bottom" ? "border-r border-b" : "border-t border-l"
                }`
          } ${tail === "bottom" ? "-bottom-[6px]" : "-top-[6px]"}`}
        />
      )}
    </div>
  );
}
