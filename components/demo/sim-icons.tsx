/* App marks for the simulated home screen.

   The thing that makes a fake springboard read as iOS: **most real iOS
   icons are a white or near-white tile with a coloured mark on it** —
   Calendar, Photos, Notes, Safari, Maps, Health, Reminders. Only a
   handful (Mail, Messages, Phone, Music) are a saturated tile with a
   white glyph. An earlier pass made every icon a coloured tile with a
   white glyph, which is the inverse of reality and read as a generic
   dashboard rather than a phone.

   So these marks carry their own colours rather than inheriting
   `currentColor`, and each app's background is set alongside it in
   `simApps`. */

type MarkProps = { size?: number };

const box = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
});

/* ---- Dark tiles, white glyph ---- */

export const MarkPlay = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <path
      d="M8.6 5.4a.9.9 0 0 1 1.37-.77l8 5.1a1.1 1.1 0 0 1 0 1.86l-8 5.1a.9.9 0 0 1-1.37-.77V5.4Z"
      fill="#fff"
    />
  </svg>
);

export const MarkMail = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden fill="#fff">
    <path d="M3 7.8A2.3 2.3 0 0 1 5.3 5.5h13.4A2.3 2.3 0 0 1 21 7.8v.2l-9 5.1-9-5.1v-.2Z" />
    <path d="M3 10.3v5.9a2.3 2.3 0 0 0 2.3 2.3h13.4a2.3 2.3 0 0 0 2.3-2.3v-5.9l-8.5 4.8a1 1 0 0 1-1 0L3 10.3Z" />
  </svg>
);

export const MarkMessage = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <path
      d="M12 3.4c-4.9 0-8.8 3.3-8.8 7.4 0 2.4 1.3 4.5 3.3 5.8-.2 1.1-.8 2.3-1.7 3.2-.3.3-.1.8.3.7 2.1-.3 3.9-1.2 5-2.1.6.1 1.2.14 1.9.14 4.9 0 8.8-3.3 8.8-7.4S16.9 3.4 12 3.4Z"
      fill="#fff"
    />
  </svg>
);

export const MarkPhone = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <path
      d="M7.7 3.6a1.7 1.7 0 0 0-2.3.3L4.1 5.2c-.8.9-1 2.1-.5 3.2a23 23 0 0 0 11.6 11.6c1.1.5 2.3.3 3.2-.5l1.3-1.2a1.7 1.7 0 0 0 .3-2.3l-1.9-2.6a1.7 1.7 0 0 0-2.2-.5l-1.8 1a16 16 0 0 1-5.4-5.4l1-1.8a1.7 1.7 0 0 0-.5-2.2l-2.6-1.9Z"
      fill="#fff"
    />
  </svg>
);

export const MarkMusic = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <path
      d="M19 3.5a.9.9 0 0 0-1.1-.9l-7.7 1.6a.9.9 0 0 0-.7.9v8.7a3.2 3.2 0 1 0 1.9 2.9V8.7l5.7-1.2v4.8a3.2 3.2 0 1 0 1.9 2.9V3.5Z"
      fill="#fff"
    />
  </svg>
);

export const MarkGear = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <path
      d="M12 2.8c-.5 0-1 .06-1.5.16l-.3 1.9a7.6 7.6 0 0 0-1.6.94L6.5 5.1a9.3 9.3 0 0 0-2.1 2.1l1.7 1.1a7.6 7.6 0 0 0-.6 1.8l-1.9.3a9.4 9.4 0 0 0 0 3l1.9.3c.14.63.35 1.23.62 1.8l-1.7 1.1a9.3 9.3 0 0 0 2.1 2.1l1.1-1.7c.57.4 1.2.72 1.86.94l.3 1.9a9.4 9.4 0 0 0 3 0l.3-1.9c.66-.22 1.29-.54 1.86-.94l1.1 1.7a9.3 9.3 0 0 0 2.1-2.1l-1.7-1.1c.27-.57.48-1.17.62-1.8l1.9-.3a9.4 9.4 0 0 0 0-3l-1.9-.3a7.6 7.6 0 0 0-.6-1.8l1.7-1.1a9.3 9.3 0 0 0-2.1-2.1l-1.1 1.7a7.6 7.6 0 0 0-1.86-.94l-.3-1.9c-.5-.1-1-.16-1.5-.16Zm0 5.6a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z"
      fill="#f2f2f5"
    />
  </svg>
);

export const MarkCamera = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden fill="#fff">
    <path d="M9.4 4.2a1.4 1.4 0 0 0-1.2.75l-.8 1.45H5A2.4 2.4 0 0 0 2.6 8.8v7.6A2.4 2.4 0 0 0 5 18.8h14a2.4 2.4 0 0 0 2.4-2.4V8.8A2.4 2.4 0 0 0 19 6.4h-2.4l-.8-1.45a1.4 1.4 0 0 0-1.2-.75H9.4Zm2.6 4.6a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Z" />
    <circle cx="18.4" cy="9.2" r="0.8" fill="#ffd166" />
  </svg>
);

export const MarkClock = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <rect width="24" height="24" fill="#0e0f12" />
    <circle cx="12" cy="12" r="10.2" fill="#fff" />
    {Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => (
      <rect
        key={deg}
        x="11.75"
        y="2.6"
        width="0.5"
        height={deg % 90 === 0 ? "1.8" : "1.1"}
        fill="#c7c7cc"
        transform={`rotate(${deg} 12 12)`}
      />
    ))}
    <path d="M12 5.4v6.6l4.3 2.6" stroke="#111" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M12 12 8.4 8.4" stroke="#ff9500" strokeWidth="1" strokeLinecap="round" />
    <circle cx="12" cy="12" r="0.95" fill="#111" />
  </svg>
);

export const MarkWeather = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <rect width="24" height="24" fill="url(#wx)" />
    <defs>
      <linearGradient id="wx" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4aa8f0" />
        <stop offset="1" stopColor="#1f6fd0" />
      </linearGradient>
    </defs>
    <circle cx="15.8" cy="7.6" r="4.1" fill="#ffd75e" />
    <path
      d="M7.3 20a5 5 0 0 1-.55-9.96 6.3 6.3 0 0 1 11.95 1.9A4.45 4.45 0 0 1 17.2 20H7.3Z"
      fill="#fff"
    />
  </svg>
);

export const MarkAfk = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <circle cx="12" cy="12" r="8.4" fill="#fff" fillOpacity="0.95" />
    <path
      d="M9.2 11c.5-.5 1.2-.5 1.7 0M13.1 11c.5-.5 1.2-.5 1.7 0M9.6 14.8c1.4 1 3.4 1 4.8 0"
      stroke="#f07800"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ---- Light tiles, coloured mark — the majority, as on a real phone ---- */

export const MarkCalendar = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <text
      x="12"
      y="8.2"
      textAnchor="middle"
      fontSize="4.4"
      fontWeight="600"
      fill="#ff3b30"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="0.4"
    >
      TUE
    </text>
    <text
      x="12"
      y="19.6"
      textAnchor="middle"
      fontSize="11.6"
      fontWeight="300"
      fill="#1c1c1e"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      21
    </text>
  </svg>
);

const petalColors = [
  "#f7c948",
  "#f2833b",
  "#e5484d",
  "#a855c9",
  "#4f7fe8",
  "#2fb673",
];

export const MarkPhotos = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <rect width="24" height="24" fill="#fff" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
      <ellipse
        key={deg}
        cx="12"
        cy="6.9"
        rx="2.5"
        ry="5.1"
        fill={petalColors[i % petalColors.length]}
        fillOpacity="0.72"
        transform={`rotate(${deg} 12 12)`}
      />
    ))}
  </svg>
);

/* Full-bleed: the paper is the tile, so the yellow band runs flush to
   the top edge rather than floating as a bar in the middle. */
export const MarkNotes = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <rect width="24" height="24" fill="#fffdf5" />
    <rect width="24" height="6.6" fill="#ffcc00" />
    {[11, 14.4, 17.8].map((y, i) => (
      <rect
        key={y}
        x="4.4"
        y={y}
        width={i === 2 ? 8 : 15.2}
        height="1.5"
        rx="0.75"
        fill="#d6d6db"
      />
    ))}
  </svg>
);

export const MarkCompass = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <rect width="24" height="24" fill="#fff" />
    <circle cx="12" cy="12" r="10.4" fill="#1f8ff5" />
    <circle cx="12" cy="12" r="8.6" fill="#fff" />
    {Array.from({ length: 24 }, (_, i) => i * 15).map((deg) => (
      <rect
        key={deg}
        x="11.85"
        y="2.1"
        width="0.3"
        height={deg % 90 === 0 ? "1.6" : "0.9"}
        fill="#8e8e93"
        transform={`rotate(${deg} 12 12)`}
      />
    ))}
    <path d="M17.1 6.9 13.3 13.3 6.9 17.1l3.8-6.4 6.4-3.8Z" fill="#ff3b30" />
    <path d="M13.3 13.3 6.9 17.1l3.8-6.4 2.6 2.6Z" fill="#f2f2f5" />
  </svg>
);

/* Full-bleed: parkland, a lake, two roads crossing, and the location
   puck. A map that doesn't reach the tile edge doesn't read as a map. */
export const MarkMap = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <rect width="24" height="24" fill="#eef3e8" />
    <path d="M0 15h24v9H0z" fill="#dbead0" />
    <path d="M0 0h24v6.5H0z" fill="#e4efdc" />
    <circle cx="19" cy="4.5" r="4.6" fill="#a9d8ef" />
    <path d="M8.6 0h3.1v24H8.6z" fill="#fff" />
    <path d="M0 9.6h24v2.9H0z" fill="#fff" />
    <path d="M0 19.4h24v1.6H0z" fill="#fff" opacity="0.75" />
    <circle cx="16.4" cy="15.6" r="4.4" fill="#2f7cf6" />
    <path d="m16.4 12.9 2.1 5.2-2.1-1.25-2.1 1.25 2.1-5.2Z" fill="#fff" />
  </svg>
);

export const MarkHash = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden strokeWidth="1.9" strokeLinecap="round">
    <rect width="24" height="24" fill="#fff" />
    <path d="M10.1 6.6 8.8 17.4" stroke="#e01e5a" />
    <path d="M15.2 6.6 13.9 17.4" stroke="#2eb67d" />
    <path d="M6.6 10.3h10.8" stroke="#ecb22e" />
    <path d="M6.6 14.1h10.8" stroke="#36c5f0" />
  </svg>
);

export const MarkHealth = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <rect width="24" height="24" fill="#fff" />
    <path
      d="M12 20.4S3.4 15.1 3.4 9.5a4.7 4.7 0 0 1 8.6-2.6 4.7 4.7 0 0 1 8.6 2.6c0 5.6-8.6 10.9-8.6 10.9Z"
      fill="#fc3d5a"
    />
  </svg>
);

export const MarkPodcasts = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden fill="#fff">
    <circle cx="12" cy="8.4" r="3.1" />
    <path d="M9 13.4a3 3 0 0 1 6 0c0 1.1-.4 4.9-.8 6.3a2.3 2.3 0 0 1-4.4 0c-.4-1.4-.8-5.2-.8-6.3Z" />
    <path
      d="M5.6 15.4a8.2 8.2 0 1 1 12.8 0"
      stroke="#fff"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      opacity="0.55"
    />
  </svg>
);

export const MarkAppStore = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden stroke="#fff" strokeWidth="1.7" strokeLinecap="round">
    <path d="M6.4 16.6 12.6 6" />
    <path d="M17.6 16.6 11.4 6" />
    <path d="M5 13.6h14" />
  </svg>
);

export const MarkReminders = ({ size = 26 }: MarkProps) => (
  <svg {...box(size)} aria-hidden>
    <rect width="24" height="24" fill="#fff" />
    {[
      { y: 7.2, c: "#2f7cf6" },
      { y: 12, c: "#fc3d5a" },
      { y: 16.8, c: "#ff9500" },
    ].map((r) => (
      <g key={r.y}>
        <circle cx="6.4" cy={r.y} r="1.9" fill={r.c} />
        <rect x="10.2" y={r.y - 0.7} width="8.4" height="1.4" rx="0.7" fill="#d6d6db" />
      </g>
    ))}
  </svg>
);

export const simMarks = {
  play: MarkPlay,
  mail: MarkMail,
  hash: MarkHash,
  photos: MarkPhotos,
  map: MarkMap,
  music: MarkMusic,
  notes: MarkNotes,
  gear: MarkGear,
  message: MarkMessage,
  phone: MarkPhone,
  compass: MarkCompass,
  afk: MarkAfk,
  calendar: MarkCalendar,
  camera: MarkCamera,
  clock: MarkClock,
  weather: MarkWeather,
  health: MarkHealth,
  podcasts: MarkPodcasts,
  appstore: MarkAppStore,
  reminders: MarkReminders,
};

export type SimMark = keyof typeof simMarks;
