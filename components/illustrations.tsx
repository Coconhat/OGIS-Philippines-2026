/* Keeby-style feature illustrations: soft gray shapes, one orange accent. */

const g1 = "#e9e9e9";
const g2 = "#d9d9d9";
const g3 = "#c9c9c9";
const orange = "#ff8c17";
const orangeSoft = "#ffd9a8";

const frame = {
  width: "100%",
  height: "auto",
} as const;

export function BellIllo() {
  return (
    <svg viewBox="0 0 200 120" style={frame} aria-hidden>
      <g className="anim-swing">
        <path
          d="M100 22c-20 0-32 14-32 32 0 22-8 28-12 32h88c-4-4-12-10-12-32 0-18-12-32-32-32z"
          fill={g1}
        />
        <path
          d="M100 22c-20 0-32 14-32 32 0 22-8 28-12 32h44V22z"
          fill={g2}
          opacity="0.5"
        />
        <rect x="90" y="92" width="20" height="10" rx="5" fill={g2} />
      </g>
      <circle className="anim-pop" cx="130" cy="34" r="12" fill={orange} />
      <path
        className="anim-pulse"
        d="M148 26c4 5 6 11 6 17M156 18c6 7 9 16 9 25"
        stroke={orangeSoft}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function BubblesIllo() {
  return (
    <svg viewBox="0 0 200 120" style={frame} aria-hidden>
      <path
        d="M36 26h84a12 12 0 0 1 12 12v18a12 12 0 0 1-12 12H62l-16 12v-12h-10a12 12 0 0 1-12-12V38a12 12 0 0 1 12-12z"
        fill={g1}
      />
      <rect x="48" y="42" width="56" height="7" rx="3.5" fill={g3} />
      <rect x="48" y="55" width="36" height="7" rx="3.5" fill={g3} opacity="0.6" />
      <g className="anim-bob">
        <path
          d="M112 62h52a10 10 0 0 1 10 10v12a10 10 0 0 1-10 10h-6v10l-14-10h-32a10 10 0 0 1-10-10V72a10 10 0 0 1 10-10z"
          fill={orange}
        />
        <rect x="114" y="74" width="40" height="6" rx="3" fill="#fff" opacity="0.85" />
      </g>
      <g className="anim-pop">
        <circle cx="163" cy="55" r="9" fill={orangeSoft} />
        <path
          d="M159.5 55l2.5 2.5 5-5"
          stroke="#e07300"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

export function CallIllo() {
  return (
    <svg viewBox="0 0 200 120" style={frame} aria-hidden>
      <rect x="52" y="18" width="52" height="88" rx="14" fill={g1} />
      <rect x="60" y="28" width="36" height="58" rx="8" fill="#fff" />
      <rect x="70" y="94" width="16" height="5" rx="2.5" fill={g3} />
      <circle cx="78" cy="50" r="10" fill={g2} />
      <rect x="66" y="66" width="24" height="6" rx="3" fill={g2} />
      <path
        d="M118 44c8 8 8 24 0 32M130 34c14 14 14 38 0 52M142 24c20 20 20 52 0 72"
        stroke={g2}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="anim-pulse"
        d="M118 44c8 8 8 24 0 32"
        stroke={orange}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function DialIllo() {
  return (
    <svg viewBox="0 0 200 120" style={frame} aria-hidden>
      <rect x="24" y="46" width="152" height="28" rx="14" fill={g1} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={52 + i * 32} cy="60" r="7" fill={g3} />
      ))}
      <circle cx="116" cy="60" r="14" fill={orange} />
      <text
        x="116"
        y="65"
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill="#fff"
        fontFamily="inherit"
      >
        2
      </text>
      <rect x="40" y="88" width="34" height="8" rx="4" fill={g2} />
      <rect x="146" y="24" width="30" height="8" rx="4" fill={orangeSoft} />
    </svg>
  );
}

export function FlagIllo() {
  return (
    <svg viewBox="0 0 200 120" style={frame} aria-hidden>
      <path d="M70 100c0-24 12-38 30-46" stroke={g2} strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="66" cy="102" r="8" fill={g2} />
      <rect x="96" y="20" width="6" height="72" rx="3" fill={g3} />
      <path d="M102 24h52l-12 14 12 14h-52z" fill={orange} />
      <circle cx="150" cy="88" r="14" fill={g1} />
      <circle cx="150" cy="88" r="7" fill={orangeSoft} />
    </svg>
  );
}

export function InboxIllo() {
  return (
    <svg viewBox="0 0 200 120" style={frame} aria-hidden>
      <path
        d="M48 42h104l14 34v24a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8V76l14-34z"
        fill={g1}
      />
      <path
        d="M34 76h38a28 28 0 0 0 56 0h38"
        stroke={g3}
        strokeWidth="7"
        fill="none"
      />
      <rect x="66" y="18" width="68" height="9" rx="4.5" fill={g2} />
      <rect x="78" y="2" width="44" height="9" rx="4.5" fill={g2} opacity="0.55" />
      <circle cx="156" cy="40" r="14" fill={orange} />
      <text
        x="156"
        y="45"
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fill="#fff"
        fontFamily="inherit"
      >
        1
      </text>
    </svg>
  );
}

export function LockIllo() {
  return (
    <svg viewBox="0 0 200 120" style={frame} aria-hidden>
      <rect x="64" y="52" width="72" height="54" rx="14" fill={g1} />
      <path
        d="M78 52V40a22 22 0 0 1 44 0v12"
        stroke={g2}
        strokeWidth="10"
        fill="none"
      />
      <circle cx="100" cy="74" r="9" fill={orange} />
      <rect x="96.5" y="78" width="7" height="14" rx="3.5" fill={orange} />
    </svg>
  );
}

export function MoonIllo() {
  return (
    <svg viewBox="0 0 200 120" style={frame} aria-hidden>
      <path
        d="M124 96a40 40 0 0 1-28-68 40 40 0 1 0 46 62 40 40 0 0 1-18 6z"
        fill={orange}
      />
      <circle cx="138" cy="34" r="6" fill={orangeSoft} />
      <circle cx="158" cy="52" r="4" fill={g2} />
      <circle cx="52" cy="44" r="5" fill={g2} />
      <path d="M40 78h26M53 65v26" stroke={g1} strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
