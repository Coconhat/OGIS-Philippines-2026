"use client";

/* The Doorkeeper — the AFK assistant given a body.
   It's the moon from the wordmark, filled with the same warm gradient
   as .wallpaper, so the mascot *is* the brand rather than sitting
   next to it. Five states, one per moment in the demo's story. */

import { useId } from "react";

export type DoorkeeperState =
  | "dozing" // you're online; it's off duty
  | "watching" // AFK is on; it's at the door
  | "thinking" // reading an incoming message
  | "alarmed" // something real got through
  | "pleased"; // welcome back

type DoorkeeperProps = {
  state: DoorkeeperState;
  size?: number;
  className?: string;
};

const EYE = "#4a2708";

const label: Record<DoorkeeperState, string> = {
  dozing: "Your AFK assistant, dozing",
  watching: "Your AFK assistant, watching the door",
  thinking: "Your AFK assistant, reading a message",
  alarmed: "Your AFK assistant, alarmed",
  pleased: "Your AFK assistant, pleased to see you",
};

function Eyes({ state }: { state: DoorkeeperState }) {
  // Closed, downturned arcs — asleep.
  if (state === "dozing") {
    return (
      <g
        stroke={EYE}
        strokeWidth={3.4}
        strokeLinecap="round"
        fill="none"
        opacity={0.9}
      >
        <path d="M39 56 q7 6.5 14 0" />
        <path d="M67 56 q7 6.5 14 0" />
      </g>
    );
  }

  // Closed, upturned arcs — a smile with the eyes.
  if (state === "pleased") {
    return (
      <g stroke={EYE} strokeWidth={3.4} strokeLinecap="round" fill="none">
        <path d="M39 59 q7 -7.5 14 0" />
        <path d="M67 59 q7 -7.5 14 0" />
      </g>
    );
  }

  // Narrowed, glancing up — concentrating.
  if (state === "thinking") {
    return (
      <g fill={EYE}>
        <ellipse cx={45} cy={55} rx={5} ry={3.2} />
        <ellipse cx={73} cy={55} rx={5} ry={3.2} />
      </g>
    );
  }

  const wide = state === "alarmed";
  const rx = wide ? 6.4 : 5.2;
  const ry = wide ? 7.2 : 5.8;

  return (
    <g className={state === "watching" ? "dk-blink" : undefined}>
      <g fill={EYE}>
        <ellipse cx={46} cy={57} rx={rx} ry={ry} />
        <ellipse cx={74} cy={57} rx={rx} ry={ry} />
      </g>
      {/* catchlights — the difference between "eyes" and "two dots" */}
      <g fill="#fff" opacity={0.9}>
        <circle cx={47.9} cy={54.6} r={1.7} />
        <circle cx={75.9} cy={54.6} r={1.7} />
      </g>
    </g>
  );
}

function Mouth({ state }: { state: DoorkeeperState }) {
  if (state === "alarmed") {
    return <ellipse cx={60} cy={76} rx={4.6} ry={5.4} fill={EYE} />;
  }
  if (state === "pleased") {
    return (
      <path
        d="M50 71 q10 11 20 0"
        stroke={EYE}
        strokeWidth={3.4}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  if (state === "watching") {
    // Neutral, attentive — a short flat line.
    return (
      <path
        d="M54.5 75 h11"
        stroke={EYE}
        strokeWidth={3.2}
        strokeLinecap="round"
        opacity={0.85}
      />
    );
  }
  if (state === "thinking") {
    return (
      <path
        d="M54 75 q6 3.5 12 -1.5"
        stroke={EYE}
        strokeWidth={3.2}
        strokeLinecap="round"
        fill="none"
        opacity={0.85}
      />
    );
  }
  // dozing — a small contented curve
  return (
    <path
      d="M54.5 73.5 q5.5 5 11 0"
      stroke={EYE}
      strokeWidth={3.2}
      strokeLinecap="round"
      fill="none"
      opacity={0.75}
    />
  );
}

export function Doorkeeper({
  state,
  size = 96,
  className = "",
}: DoorkeeperProps) {
  const uid = useId().replace(/:/g, "");
  const body = `dk-body-${uid}`;
  const sheen = `dk-sheen-${uid}`;
  const clip = `dk-clip-${uid}`;

  const bodyMotion =
    state === "alarmed"
      ? "dk-shake"
      : state === "dozing"
        ? "dk-float"
        : undefined;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={label[state]}
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id={body} cx="22%" cy="10%" r="98%">
          <stop offset="0%" stopColor="#ffd9a8" />
          <stop offset="50%" stopColor="#ffb45c" />
          <stop offset="100%" stopColor="#f07800" />
        </radialGradient>
        {/* Specular highlight — the difference between a disc and a form. */}
        <radialGradient id={sheen} cx="30%" cy="18%" r="42%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={clip}>
          <circle cx={60} cy={60} r={46} />
        </clipPath>
      </defs>

      {/* Contact shadow. Without it the character floats; with it, it's
          standing somewhere. */}
      <ellipse
        cx={60}
        cy={110}
        rx={34}
        ry={5.5}
        fill="#b45c00"
        opacity={0.18}
        className={state === "dozing" ? "dk-float" : undefined}
      />

      {/* Alarm rings — only when something real is breaking through */}
      {state === "alarmed" && (
        <>
          <circle
            className="dk-ring"
            cx={60}
            cy={60}
            r={47}
            fill="none"
            stroke="var(--color-coral)"
            strokeWidth={3}
          />
          <circle
            className="dk-ring"
            cx={60}
            cy={60}
            r={47}
            fill="none"
            stroke="var(--color-coral)"
            strokeWidth={3}
            style={{ animationDelay: "0.55s" }}
          />
        </>
      )}

      <g className={bodyMotion}>
        <g clipPath={`url(#${clip})`}>
          <circle cx={60} cy={60} r={46} fill={`url(#${body})`} />
          {/* offset shading — reads as a moon's terminator */}
          <circle cx={95} cy={88} r={45} fill="#c25c00" opacity={0.16} />
          {/* bounce light along the lower edge, so the form turns */}
          <circle cx={60} cy={104} r={40} fill="#ffd9a8" opacity={0.22} />
          <circle cx={60} cy={60} r={46} fill={`url(#${sheen})`} />
        </g>

        <g className={state === "watching" ? "dk-scan" : undefined}>
          <Eyes state={state} />
        </g>
        <Mouth state={state} />
      </g>

      {/* Sleeping z's — drifting up and to the right, off the head. */}
      {state === "dozing" && (
        <g fill={EYE} fontWeight={800} opacity={0.55}>
          <text className="dk-zzz" x={96} y={30} fontSize={19}>
            z
          </text>
          <text
            className="dk-zzz"
            x={110}
            y={17}
            fontSize={13}
            style={{ animationDelay: "1.3s" }}
          >
            z
          </text>
        </g>
      )}

      {/* Orbiting spark while it reads */}
      {state === "thinking" && (
        <g className="dk-orbit">
          <circle cx={60} cy={8} r={4} fill="var(--color-accent)" />
        </g>
      )}
    </svg>
  );
}
