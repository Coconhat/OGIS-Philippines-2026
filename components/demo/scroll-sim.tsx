"use client";

/* A phone inside the phone.

   The point is that the nudges have to be *caused*. A button labelled
   "simulate scrolling" proves nothing; tapping ShortReel from a home
   screen, scrolling it, swiping home, opening Mail, and landing back on
   ShortReel is the actual behaviour — and the engine watches dwell time,
   scroll depth and app switches, so by the time the churn nudge fires
   you're the one who caused it.

   A full-frame overlay rather than a route: when you're doomscrolling
   you are not in AFK, and leaving the tab bar visible under a fake
   social feed breaks the fiction instantly.

   Nothing here uses the AFK design system's expressive surfaces on
   purpose. This is supposed to feel like somewhere else. */

import { useNudge } from "@/lib/nudge-context";
import { simApps, simSession, type SimApp } from "@/lib/data";
import { simMarks, type SimMark } from "./sim-icons";
import { Pressable } from "@/components/ui/pressable";
import { IconPause, IconPlay, IconArrowRight, IconX } from "@/components/icons";

const grid = simApps.filter((a) => !a.dock);
const dock = simApps.filter((a) => a.dock);

function AppIcon({
  app,
  onOpen,
  label = true,
}: {
  app: SimApp;
  onOpen: () => void;
  label?: boolean;
}) {
  const Mark = simMarks[app.icon as SimMark];
  return (
    <Pressable
      onPress={onOpen}
      highlight="scale"
      aria-label={`Open ${app.name}${app.badge ? `, ${app.badge} notifications` : ""}`}
      className="flex flex-col items-center gap-[5px]"
    >
      <span className="relative">
        {/* Flat. Real iOS home screen icons carry no drop shadow — the
            shadow here was a persistent "web mockup" tell. */}
        <span
          aria-hidden
          style={{ background: app.color }}
          className="icon-squircle grid size-[60px] place-items-center text-white"
        >
          {/* Full-bleed where the artwork *is* the icon (Calendar's page,
              the map, Safari's dial); inset where it's a glyph sitting
              on a coloured field (Mail, Music, Phone). */}
          <Mark size={app.bleed ? 60 : 31} />
        </span>
        {/* iOS badges carry no ring — the ring was making them read as
            stickers pasted on rather than part of the icon. */}
        {app.badge ? (
          <span
            aria-hidden
            className="absolute -top-1.5 -right-1.5 grid h-[19px] min-w-[19px] place-items-center rounded-pill bg-[#ff3b30] px-1.5 text-[11px] leading-none font-semibold text-white"
          >
            {app.badge}
          </span>
        ) : null}
      </span>
      {label && (
        /* Explicit 400 — the app's type ramp bumps every weight a notch
           for Nunito, which computed these labels at 600. iOS home
           screen labels are regular. */
        <span
          style={{ fontWeight: 400 }}
          className="max-w-[74px] truncate text-[11px] leading-[13px] text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.35)]"
        >
          {app.name}
        </span>
      )}
    </Pressable>
  );
}

/* iOS status bar glyphs. Unicode block characters (▮▮▯ ᯤ ▉) render
   differently on every platform and read as garbage. */
function StatusIcons() {
  return (
    <span aria-hidden className="flex items-center gap-1.5 text-white">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={i * 4.4}
            y={8 - i * 2.4}
            width="3"
            height={3 + i * 2.4}
            rx="1"
            opacity={i === 3 ? 0.4 : 1}
          />
        ))}
      </svg>
      <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
        <path d="M7.5 9.6 5.9 8a2.3 2.3 0 0 1 3.2 0L7.5 9.6ZM3.6 5.7a5.8 5.8 0 0 1 7.8 0l-1.2 1.2a4.1 4.1 0 0 0-5.4 0L3.6 5.7ZM1.3 3.4a9.1 9.1 0 0 1 12.4 0l-1.2 1.2a7.4 7.4 0 0 0-10 0L1.3 3.4Z" />
      </svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
        <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" stroke="currentColor" opacity="0.45" />
        <rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" />
        <path d="M23 4.2v3.6c.9-.3 1.4-.9 1.4-1.8S23.9 4.5 23 4.2Z" fill="currentColor" opacity="0.45" />
      </svg>
    </span>
  );
}

export function ScrollSim() {
  const {
    simActive,
    paused,
    minutesInApp,
    switches,
    scroll,
    reduced,
    openApp,
    togglePause,
    step,
    openAppById,
    goHome,
    registerScroll,
    endSim,
  } = useNudge();

  if (!simActive) return null;

  const app = simApps.find((a) => a.id === openApp) ?? null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{
        /* The app is set in Nunito — a rounded display face. Nothing on
           this screen can read as iOS while the type is wrong, and on
           macOS `-apple-system` resolves to genuine SF Pro rather than an
           approximation of it. Scoped here so the AFK app keeps Nunito,
           which is correct for AFK. */
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
        background: app
          ? "#0b0b0f"
          : /* One broad bloom over a deep blue field. Four stacked
               radials banded and blobbed; fewer stops read cleaner than
               a bad imitation of the iOS bubble wallpaper. */
            `radial-gradient(75% 48% at 50% 38%, #58b6d6 0%, #2d7bb5 38%, transparent 78%),
             linear-gradient(168deg, #1d5a90 0%, #143f74 46%, #0a1f47 100%)`,
      }}
      role="region"
      aria-label="Simulated phone"
    >
      {/* iOS status bar. Nothing renders above this — an instrumentation
          strip sitting over the status bar broke the illusion in the
          first 40px, so the AFK readout floats above the home indicator
          instead. */}
      {/* Fixed height so the Dynamic Island can't overlap whatever
          renders beneath it — the feed's title was colliding with it. */}
      <div className="relative flex h-[54px] shrink-0 items-center justify-between px-8">
        <p className="text-[15px] leading-none font-semibold tabular-nums text-white">
          {simSession.clock}
        </p>

        {/* Dynamic Island */}
        <span
          aria-hidden
          className="absolute left-1/2 top-2 h-[34px] w-[124px] -translate-x-1/2 rounded-pill bg-black"
        />

        <StatusIcons />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {app === null ? (
          /* ---- Home screen ----
             The demo frame is max-w-[430px] — exactly iPhone 14 Pro Max
             width, so iOS points map 1:1 to px. These are the real
             springboard metrics: 60pt icons, ~30pt side margins, wide
             gutters. The old 8px gutter was why it read cramped. */
          <div className="flex h-full flex-col px-[30px] pt-3">
            <div className="grid grid-cols-4 gap-x-[26px] gap-y-[26px]">
              {grid.map((a) => (
                <AppIcon key={a.id} app={a} onOpen={() => openAppById(a.id)} />
              ))}
            </div>

            <div className="mt-auto flex flex-col items-center gap-3 pb-2">
              <div aria-hidden className="flex justify-center gap-1.5">
                <span className="size-[6px] rounded-pill bg-white/90" />
                <span className="size-[6px] rounded-pill bg-white/35" />
              </div>
              {/* The Search pill. Small detail, but its absence is one of
                  the things that makes a fake springboard look fake. */}
              <span
                aria-hidden
                className="flex items-center gap-1.5 rounded-pill bg-black/22 px-3 py-1 text-[13px] leading-none font-medium text-white backdrop-blur-md"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="10.5"
                    cy="10.5"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  />
                  <path
                    d="m15.5 15.5 4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
                Search
              </span>
            </div>
          </div>
        ) : app.feed ? (
          /* ---- The doomscroll app ---- */
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center justify-between px-4 pb-2">
              <p className="text-headline text-white">{app.name}</p>
              <p className="text-caption text-white/40">For You</p>
            </div>
            <ul
              onScroll={(e) => {
                const el = e.currentTarget;
                registerScroll(Math.floor(el.scrollTop / el.clientHeight) + 1);
              }}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 pb-3"
            >
              {/* Repeated so there's genuinely something to scroll — the
                  scroll-depth signal needs real distance to measure. */}
              {[0, 1, 2].flatMap((pass) =>
                simSession.posts.map((p) => (
                  <li
                    key={`${pass}-${p.id}`}
                    className="rounded-tile bg-white/[0.07] p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="size-7 shrink-0 rounded-pill bg-white/15"
                      />
                      <p className="text-footnote text-white/55">{p.handle}</p>
                    </div>
                    <p className="text-body mt-2 text-balance text-white">
                      {p.caption}
                    </p>
                    {/* Stand-in for the video. Deliberately inert — the
                        point is the time, not the content. */}
                    <div
                      aria-hidden
                      className="mt-3 h-32 rounded-group bg-gradient-to-br from-white/15 to-white/5"
                    />
                    <p className="text-caption mt-2 tabular-nums text-white/35">
                      {p.meta}
                    </p>
                  </li>
                )),
              )}
              <li className="text-footnote py-8 text-center text-white/35">
                It keeps going. That&apos;s the design.
              </li>
            </ul>
          </div>
        ) : (
          /* ---- Every other app: somewhere you bounce off ---- */
          <div className="flex h-full flex-col items-center justify-center px-10 text-center">
            <span
              aria-hidden
              style={{ background: app.color }}
              className="icon-squircle grid size-[68px] place-items-center text-white"
            >
              {(() => {
                const Mark = simMarks[app.icon as SimMark];
                return <Mark size={36} />;
              })()}
            </span>
            <p className="text-title-3 mt-4 text-white">{app.name}</p>
            <p className="text-subhead mt-2 text-balance text-white/55">
              {app.stub}
            </p>
          </div>
        )}
      </div>

      {/* AFK watching from outside the OS.

          Third placement, and the reasoning matters: above the status bar
          was wrong (no phone has chrome up there), and between Search and
          the dock was wrong too (that's load-bearing iOS furniture, and a
          foreign pill wedged into it read as a bug). Directly under the
          status bar is where iOS itself puts system indicators — the
          screen-recording and location pills — so it belongs here. */}
      {/* Home screen: park it in the empty wallpaper above the page dots.
          In an app: there's no dock or Search to avoid, so it drops to
          the bottom rather than floating over the content it's
          measuring. */}
      <div
        className={`pointer-events-none absolute inset-x-0 z-10 flex justify-center px-3 ${
          app === null ? "bottom-[236px]" : "bottom-[52px]"
        }`}
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-pill bg-black/40 py-0.5 pr-0.5 pl-2.5 backdrop-blur-xl">
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-pill bg-coral animate-pulse-dot"
          />
          <p
            aria-live="polite"
            className="text-[11px] leading-none tabular-nums text-white/75"
          >
            AFK · {minutesInApp}m · {switches} switches · {scroll} screens
          </p>

          {!reduced && (
            <Pressable
              onPress={togglePause}
              aria-label={paused ? "Resume" : "Pause"}
              highlight="opacity"
              className="grid size-9 place-items-center text-white/70"
            >
              {paused ? <IconPlay size={12} /> : <IconPause size={12} />}
            </Pressable>
          )}
          <Pressable
            onPress={step}
            aria-label="Force the next nudge"
            highlight="opacity"
            className="grid size-9 place-items-center text-white/70"
          >
            <IconArrowRight size={12} />
          </Pressable>
          <Pressable
            onPress={endSim}
            aria-label="Exit simulation, back to AFK"
            highlight="opacity"
            className="grid size-9 place-items-center text-white/70"
          >
            <IconX size={12} strokeWidth={2.6} />
          </Pressable>
        </div>
      </div>

      <div className="shrink-0 pb-[max(6px,env(safe-area-inset-bottom))]">
        {/* Dock: frosted tray, no labels — the iOS tell. */}
        {app === null && (
          <div className="mx-2.5 mb-1.5 flex justify-around rounded-[32px] bg-white/18 px-2 py-2.5 backdrop-blur-2xl">
            {dock.map((a) => (
              <AppIcon
                key={a.id}
                app={a}
                label={false}
                /* AFK is on this phone like anything else — tapping it
                   returns you to the real app rather than opening a
                   stub about itself. */
                onOpen={() => (a.id === "afk" ? endSim() : openAppById(a.id))}
              />
            ))}
          </div>
        )}

        {/* On a real phone you'd swipe this. In a mockup on a desktop
            it's a 5px bar with no affordance, so it gets a label while
            an app is open — discoverability beats fidelity here. */}
        <Pressable
          onPress={goHome}
          disabled={app === null}
          aria-label="Home"
          highlight="opacity"
          className="flex h-10 w-full flex-col items-center justify-center gap-1"
        >
          {app !== null && (
            <span className="text-caption font-semibold text-white/45">
              Home
            </span>
          )}
          <span
            aria-hidden
            className={`h-[5px] w-[134px] rounded-pill ${
              app === null ? "bg-white/30" : "bg-white/80"
            }`}
          />
        </Pressable>
      </div>
    </div>
  );
}
