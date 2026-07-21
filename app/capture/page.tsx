"use client";

/* Asset capture harness — not part of the product.
   Renders each composed UI block in isolation so scripts/capture.ts can
   shoot it at 3x with an alpha channel for video editing. Every block is
   wrapped in [data-cap], which is the selector the script iterates.

   Delete this route and scripts/capture.ts together when the video is cut. */

import type { ReactNode } from "react";
import {
  autonomyLadder,
  missions,
  resolveScript,
  verdictTheme,
  type ResolvedEvent,
} from "@/lib/data";
import { Doorkeeper, type DoorkeeperState } from "@/components/afk/doorkeeper";
import { DoorkeeperStage } from "@/components/afk/doorkeeper-stage";
import { SpeechBubble } from "@/components/afk/speech-bubble";
import { MissionRow } from "@/components/demo/mission-row";
import { Button } from "@/components/ui/button";
import { LevelMeter } from "@/components/ui/dial";
import { SummaryBoard } from "@/components/ui/summary-board";
import { Tile } from "@/components/ui/tile";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import {
  IconBellOff,
  IconChevronRight,
  IconFlame,
  IconMail,
  IconMessage,
  IconMoon,
  IconPhone,
  IconSparkle,
  IconZap,
} from "@/components/icons";

/* The demo frame is 430 wide with 16px gutters, so screen-width blocks
   are 398. Capturing at the real width keeps type and radii honest. */
const SCREEN = 398;

type Bg = "transparent" | "canvas" | "surface";

function Cap({
  id,
  width = SCREEN,
  bg = "transparent",
  children,
}: {
  id: string;
  width?: number;
  bg?: Bg;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[11px] text-ink-soft">{id}</p>
      <div
        data-cap={id}
        data-cap-bg={bg}
        style={{ width }}
        className={
          bg === "canvas"
            ? "canvas-base"
            : bg === "surface"
              ? "bg-app-surface"
              : ""
        }
      >
        {children}
      </div>
    </div>
  );
}

const channelIcon = {
  iMessage: IconMessage,
  Slack: IconMessage,
  Telegram: IconMessage,
  Email: IconMail,
  Call: IconPhone,
};

/* The settled EventCard, lifted out of app/demo/triage/page.tsx where
   it's a private component. Kept class-for-class identical. */
function EventCard({
  ev,
  thinking = false,
}: {
  ev: ResolvedEvent;
  thinking?: boolean;
}) {
  const theme = verdictTheme[ev.verdict];
  const Channel = channelIcon[ev.channel];
  const escalated = !thinking && ev.verdict === "escalate";

  return (
    <Tile
      tone={thinking ? "plain" : theme.tone}
      padding="sm"
      className={escalated ? "ring-2 ring-coral" : ""}
    >
      <div className="flex items-center gap-3">
        <span
          className={`text-footnote grid size-10 shrink-0 place-items-center rounded-pill font-bold ${
            escalated ? "bg-black/12 text-label" : "bg-fill-2 text-label-2"
          }`}
          aria-hidden
        >
          {ev.avatar}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-subhead flex items-center gap-1.5 font-semibold">
            <Channel
              size={12}
              className={escalated ? "text-label/55" : "text-label-3"}
            />
            <span className="truncate">{ev.sender}</span>
          </p>

          {thinking ? (
            <p className="text-caption mt-0.5 inline-flex items-center gap-1.5 text-accent-text">
              <IconSparkle size={12} />
              reading on-device&hellip;
            </p>
          ) : (
            <p
              className={`text-caption mt-0.5 truncate ${
                escalated ? "text-label/55" : "text-label-2"
              }`}
            >
              {ev.preview}
            </p>
          )}
        </div>

        {!thinking && (
          <div className="flex shrink-0 items-center gap-1">
            <VerdictBadge verdict={ev.verdict} />
            <IconChevronRight
              size={14}
              className={escalated ? "text-label/55" : "text-label-3"}
            />
          </div>
        )}
      </div>
    </Tile>
  );
}

/* Alert's critical panel, inlined. The real component portals to a
   fixed-position scrim, which can't be captured as a flow element. */
function CriticalAlert() {
  return (
    <div className="rounded-tile bg-card-alert shadow-float max-w-[360px] p-6 text-center text-label">
      <div className="mb-3 flex justify-center">
        <Doorkeeper state="alarmed" size={84} />
      </div>
      <p className="text-caption font-bold tracking-widest text-coral-text uppercase">
        Breakthrough
      </p>
      <p className="text-title-3 mt-2 text-balance">
        Mom: &ldquo;Call me when you see this. It&apos;s about grandpa.&rdquo;
      </p>
      <p className="text-subhead mt-2 text-label/70 text-balance">
        Far outside this sender&apos;s baseline. AFK bypassed Do Not Disturb.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <span className="text-headline grid min-h-[50px] place-items-center rounded-pill bg-white px-4 text-coral-text">
          Call now
        </span>
        <span className="text-headline grid min-h-[50px] place-items-center rounded-pill bg-black/12 px-4 text-label">
          Dismiss
        </span>
      </div>
    </div>
  );
}

const STATES: DoorkeeperState[] = [
  "dozing",
  "watching",
  "thinking",
  "alarmed",
  "pleased",
];

const BUBBLE_LINES: Record<DoorkeeperState, string> = {
  dozing: "Ready when you are. I'll hold the line.",
  watching: "I've got the door. Go be somewhere else.",
  thinking:
    "I'll answer what I can from your calendar, and sign every message as me.",
  alarmed: "This one is real. I'm ringing you.",
  pleased: "Welcome back. Two things need you.",
};

export default function CapturePage() {
  const script = resolveScript(2);
  const level = 2;
  const activeLevel = autonomyLadder[level];
  const mission = missions[0];

  const byVerdict = (v: ResolvedEvent["verdict"]) =>
    script.find((e) => e.verdict === v) ?? script[0];

  // A call reads as the most urgent thing to be mid-triage on.
  const pending = script.find((e) => e.channel === "Call") ?? script[0];
  const settled = script.filter((e) => e.id !== pending.id).slice(0, 4);

  return (
    <main className="bg-canvas min-h-dvh p-10">
      <h1 className="text-2xl font-black">Capture harness</h1>
      <p className="text-ink-soft mt-1 text-sm">
        Not a product route. Each bordered block is shot by scripts/capture.ts.
      </p>

      <div className="mt-10 flex flex-wrap items-start gap-10">
        {/* ---- Hero cards ---- */}
        <Cap id="hero-online">
          <Tile raised padding="none">
            <div className="flex flex-col items-center px-5 pt-5">
              <SpeechBubble tail="bottom" className="relative z-10">
                Ready when you are. I&apos;ll hold the line.
              </SpeechBubble>
              <DoorkeeperStage state="dozing" size={142} className="-mt-2" />
            </div>
            <div className="px-5 pt-1 pb-5 text-center">
              <p className="text-title-2">You&apos;re online</p>
              <p className="text-subhead mx-auto mt-1 max-w-[32ch] text-label-2 text-balance">
                Hand the door to AFK and step away. Real emergencies still ring
                through.
              </p>
              <Button
                size="large"
                full
                className="mt-4"
                icon={<IconMoon size={18} />}
              >
                Go AFK&hellip;
              </Button>
            </div>
          </Tile>
        </Cap>

        <Cap id="hero-afk">
          <Tile raised padding="none">
            <div className="flex flex-col items-center px-5 pt-5">
              <SpeechBubble tail="bottom" className="relative z-10">
                I&apos;ve got the door. Go be somewhere else.
              </SpeechBubble>
              <DoorkeeperStage state="watching" size={142} className="-mt-2" />
            </div>
            <div className="px-5 pt-1 pb-5 text-center">
              <p className="text-title-2">Holding your place</p>
              <p className="text-subhead mt-1 text-label-2">
                {activeLevel.name} · until 6:30pm
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-footnote inline-flex items-center gap-1.5 rounded-pill bg-fill-2 px-3 py-1.5 font-semibold">
                  <IconBellOff size={13} className="text-accent-text" />5 handled
                </span>
                <span className="text-footnote inline-flex items-center gap-1.5 rounded-pill bg-fill-2 px-3 py-1.5 font-semibold">
                  <IconZap size={13} className="text-accent-text" />1
                  interruption
                </span>
              </div>
              <Button size="large" full tint="ink" className="mt-4">
                I&apos;m back
              </Button>
            </div>
          </Tile>
        </Cap>

        {/* ---- Mascot alone, all five states ---- */}
        {STATES.map((s) => (
          <Cap key={s} id={`doorkeeper-${s}`} width={180}>
            <div className="grid place-items-center py-4">
              <Doorkeeper state={s} size={140} />
            </div>
          </Cap>
        ))}

        {/* ---- Bubble + mascot, all five states ---- */}
        {STATES.map((s) => (
          <Cap key={s} id={`bubble-${s}`} width={340}>
            <div className="flex flex-col items-center gap-2 pt-2 pb-2">
              <SpeechBubble tone={s === "alarmed" ? "alert" : "default"}>
                {BUBBLE_LINES[s]}
              </SpeechBubble>
              <Doorkeeper state={s} size={72} />
            </div>
          </Cap>
        ))}

        {/* ---- Triage ----
            The call is the card still being read, matching how the run
            actually plays: newest on top, mid-read, colour not yet
            arrived. Everything below it has already resolved. */}
        <Cap id="triage-stack">
          <div className="space-y-2.5">
            <EventCard ev={pending} thinking />
            {[...settled].reverse().map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </Cap>

        <Cap id="triage-card-thinking">
          <EventCard ev={pending} thinking />
        </Cap>
        {(["reply", "act", "suppress", "escalate"] as const).map((v) => (
          <Cap key={v} id={`triage-card-${v}`}>
            <EventCard ev={byVerdict(v)} />
          </Cap>
        ))}

        {/* ---- Alert ---- */}
        <Cap id="alert-breakthrough" width={360}>
          <CriticalAlert />
        </Cap>

        {/* ---- Verdict badges ---- */}
        {(["suppress", "reply", "act", "escalate"] as const).map((v) => (
          <Cap key={v} id={`verdict-${v}`} width={140}>
            <div className="p-2">
              <VerdictBadge verdict={v} />
            </div>
          </Cap>
        ))}

        {/* ---- Session tile ---- */}
        <Cap id="session-tile">
          <Tile padding="none">
            <div className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-caption font-semibold tracking-wide text-accent-text uppercase">
                  Autonomy
                </p>
                <p className="text-title-3 mt-0.5">{activeLevel.name}</p>
                <p className="text-footnote mt-0.5 text-label-2">
                  {activeLevel.tagline} · until 6:30pm
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <LevelMeter index={level} />
                <IconChevronRight size={16} className="text-label-3" />
              </div>
            </div>
            <p className="text-footnote border-t border-separator bg-fill-2 px-4 py-3 text-label-2">
              {activeLevel.detail}
            </p>
          </Tile>
        </Cap>

        {/* ---- Summary board ---- */}
        <Cap id="summary-board">
          <SummaryBoard
            items={[
              {
                value: "37",
                label: "interruptions avoided",
                icon: <IconBellOff size={14} />,
                tint: "sky",
              },
              {
                value: "11.2h",
                label: "reclaimed this week",
                icon: <IconZap size={14} />,
                tint: "accent",
                prominent: true,
              },
              {
                value: "4",
                label: "day streak",
                icon: <IconFlame size={14} />,
                tint: "coral",
              },
            ]}
          />
        </Cap>

        {/* ---- Mission row ---- */}
        <Cap id="mission-row">
          <MissionRow mission={mission} done={false} href="/demo/missions" />
        </Cap>
        <Cap id="mission-row-done">
          <MissionRow mission={mission} done href="/demo/missions" />
        </Cap>

        {/* ---- Buttons ---- */}
        <Cap id="button-filled" width={220}>
          <div className="p-2">
            <Button size="large" full icon={<IconMoon size={18} />}>
              Go AFK&hellip;
            </Button>
          </div>
        </Cap>
        <Cap id="button-ink" width={220}>
          <div className="p-2">
            <Button size="large" full tint="ink">
              I&apos;m back
            </Button>
          </div>
        </Cap>
      </div>
    </main>
  );
}
