"use client";

/* The Doorkeeper, with a little texture under it.

   On a plain white card the character reads as an emoji floating in
   space. Rather than tinting the card or scattering confetti, this puts
   a quiet grey dot field behind it, masked so it dissolves at the edges.
   The card stays white, the character keeps all the colour, and the
   texture just stops the space from being empty.

   Decorative only: aria-hidden, pointer-events-none, and frozen by the
   global prefers-reduced-motion guard. */

import { Doorkeeper, type DoorkeeperState } from "./doorkeeper";

export function DoorkeeperStage({
  state,
  size = 142,
  className = "",
}: {
  state: DoorkeeperState;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto ${className}`}
      style={{ width: size * 1.5, height: size * 1.06 }}
    >
      <div
        aria-hidden
        className="dot-field pointer-events-none absolute inset-0"
      />

      <div className="dk-drift absolute inset-0 grid place-items-center">
        <Doorkeeper state={state} size={size} />
      </div>
    </div>
  );
}
