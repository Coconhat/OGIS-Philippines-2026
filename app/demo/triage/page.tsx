"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAfk } from "@/lib/afk-context";
import { useDemoShell } from "@/lib/demo-shell";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import {
  asLevelId,
  levelChrome,
  resolveScript,
  verdictTheme,
  type ResolvedEvent,
} from "@/lib/data";
import { Doorkeeper, type DoorkeeperState } from "@/components/afk/doorkeeper";
import { SpeechBubble } from "@/components/afk/speech-bubble";
import { TriageDetailSheet } from "@/components/demo/triage-detail-sheet";
import { NavBar } from "@/components/ui/nav-bar";
import { Button } from "@/components/ui/button";
import { Tile } from "@/components/ui/tile";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { BubblesIllo, MoonIllo } from "@/components/illustrations";
import {
  IconChevronRight,
  IconLock,
  IconMail,
  IconMessage,
  IconMoon,
  IconPause,
  IconPhone,
  IconPlay,
  IconSparkle,
  IconUndo,
} from "@/components/icons";

const channelIcon = {
  iMessage: IconMessage,
  Slack: IconMessage,
  Telegram: IconMessage,
  Email: IconMail,
  Call: IconPhone,
};

type Stage = "arrived" | "thinking" | "verdict";

/* Cards land neutral and wash into their verdict colour as the
   decision resolves. Colour arriving at the moment of judgement is
   the whole show — it's what makes six events read at a glance. */
function EventCard({
  ev,
  instant,
  onVerdict,
  onOpen,
}: {
  ev: ResolvedEvent;
  instant: boolean;
  onVerdict: (ev: ResolvedEvent) => void;
  onOpen: (ev: ResolvedEvent) => void;
}) {
  const [stage, setStage] = useState<Stage>(instant ? "verdict" : "arrived");
  const notified = useRef(false);

  useEffect(() => {
    if (instant) return;
    const a = setTimeout(() => setStage("thinking"), 450);
    const b = setTimeout(() => setStage("verdict"), 1800);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [instant]);

  useEffect(() => {
    if (stage === "verdict" && !notified.current) {
      notified.current = true;
      onVerdict(ev);
    }
  }, [stage, ev, onVerdict]);

  const settled = stage === "verdict";
  const theme = verdictTheme[ev.verdict];
  const Channel = channelIcon[ev.channel];
  const escalated = settled && ev.verdict === "escalate";

  return (
    <li className="animate-rise">
      <Tile
        tone={settled ? theme.tone : "plain"}
        padding="sm"
        onPress={() => settled && onOpen(ev)}
        className={`transition-colors duration-500 ease-ios ${
          escalated ? "ring-2 ring-coral" : ""
        }`}
        aria-label={`${ev.sender} via ${ev.channel}. ${
          settled ? theme.label : "Being read"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-pill text-footnote font-bold ${
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

            {stage === "thinking" ? (
              <p className="text-caption mt-0.5 inline-flex items-center gap-1.5 text-accent-text">
                <IconSparkle size={12} className="animate-pulse-dot" />
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

          {settled && (
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
    </li>
  );
}

export default function TriagePage() {
  const { scrollRef } = useDemoShell();
  const { afkOn, setAfkOn, pushHandled, level, sessionLevel, breakthrough: allowed } =
    useAfk();
  const reduced = useReducedMotion();

  const [run, setRun] = useState(0);
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [breakthrough, setBreakthrough] = useState<ResolvedEvent | null>(null);
  const [detail, setDetail] = useState<ResolvedEvent | null>(null);

  /* Play the rung the session actually started at, so changing the dial
     mid-run doesn't rewrite cards already on screen. Falls back to the
     current level when the user lands here without a session. */
  const playAt = asLevelId(sessionLevel ?? level);
  const script = useMemo(() => resolveScript(playAt), [playAt]);
  const chrome = levelChrome[playAt];

  const total = script.length;
  const done = count >= total;

  // Reduced motion: no auto-advance, everything already resolved.
  const shown = reduced && afkOn ? total : count;

  useEffect(() => {
    if (!afkOn || reduced || paused || count >= total) return;
    const t = setTimeout(() => setCount((c) => c + 1), count === 0 ? 600 : 3600);
    return () => clearTimeout(t);
  }, [afkOn, reduced, paused, count, total, run]);

  /* A rung change restarts the sequence rather than leaving a mix of
     levels on screen. Adjusting state during render is the sanctioned
     way to respond to a changed value — an effect would cascade. */
  const [prevLevel, setPrevLevel] = useState(playAt);
  if (playAt !== prevLevel) {
    setPrevLevel(playAt);
    setCount(0);
    setBreakthrough(null);
    setRun((r) => r + 1);
  }

  const handleVerdict = useCallback(
    (ev: ResolvedEvent) => {
      pushHandled(ev);
      // Mom only rings if she's still on the always-list. Switch her off
      // in the sheet and the run genuinely has zero interruptions.
      if (ev.verdict === "escalate" && allowed["c-mom"]) setBreakthrough(ev);
    },
    [pushHandled, allowed],
  );

  const replay = () => {
    setRun((r) => r + 1);
    setCount(0);
    setPaused(false);
  };

  const active = script.slice(0, shown);
  const doorkeeper: DoorkeeperState = !afkOn
    ? "dozing"
    : breakthrough
      ? "alarmed"
      : active.length && !done
        ? "thinking"
        : "watching";

  return (
    <>
      <NavBar
        title="Triage"
        subtitle={afkOn ? "The Doorkeeper is on the door." : "AFK is off."}
        scrollRef={scrollRef}
        trailing={
          afkOn && !reduced ? (
            <div className="flex items-center gap-1">
              <Button
                variant="plain"
                size="small"
                tint="ink"
                onPress={() => setPaused((p) => !p)}
                aria-label={paused ? "Resume triage" : "Pause triage"}
                icon={
                  paused ? <IconPlay size={14} /> : <IconPause size={14} />
                }
              >
                {paused ? "Play" : "Pause"}
              </Button>
              <Button
                variant="plain"
                size="small"
                onPress={replay}
                icon={<IconUndo size={14} />}
                aria-label="Replay the triage sequence"
              >
                Replay
              </Button>
            </div>
          ) : null
        }
      />

      <div className="px-4 pb-6">
        {!afkOn ? (
          <EmptyState
            illustration={<MoonIllo />}
            title="The door is open"
            message="Go AFK and watch every incoming message get read, judged and handled — live."
            action={
              <Button
                icon={<IconMoon size={17} />}
                onPress={() => setAfkOn(true)}
              >
                Go AFK now
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 pb-2">
              <SpeechBubble key={`voice-${playAt}`} className="animate-rise">
                {chrome.assistantLine}
              </SpeechBubble>
              <Doorkeeper state={doorkeeper} size={72} />
            </div>

            {active.length === 0 ? (
              <EmptyState
                illustration={<BubblesIllo />}
                title="Listening"
                message="Waiting for the first thing to come through…"
              />
            ) : (
              <ul
                key={run}
                className="space-y-2.5"
                aria-live="polite"
                aria-relevant="additions"
              >
                {[...active].reverse().map((ev) => (
                  <EventCard
                    key={ev.id}
                    ev={ev}
                    instant={reduced}
                    onVerdict={handleVerdict}
                    onOpen={setDetail}
                  />
                ))}
              </ul>
            )}

            {/* The ceiling beat: five cards have just gone green and you
                expect a sixth — instead you get one that stopped. */}
            {(done || reduced) && chrome.ceiling && (
              <div className="animate-rise mt-2.5 rounded-tile border border-dashed border-separator px-4 py-3">
                <p className="text-subhead flex items-center gap-2 font-semibold text-label-2">
                  <IconLock size={14} className="shrink-0" />
                  {chrome.ceiling.who}
                </p>
                <p className="text-caption mt-1 text-label-2">
                  {chrome.ceiling.what}
                </p>
                <p className="text-caption mt-1.5 text-label-3">
                  Held at the ceiling — no money, no legal, no new commitments.
                </p>
              </div>
            )}

            {(done || reduced) && active.length > 0 && (
              <p className="text-footnote mt-4 text-center text-balance text-label-2">
                {chrome.tally}
              </p>
            )}

            <p className="text-caption mt-3 flex items-center justify-center gap-1.5 text-center text-label-3">
              <IconUndo size={12} />
              Every action is reviewable and undoable in your briefing
            </p>
          </>
        )}
      </div>

      <TriageDetailSheet event={detail} onClose={() => setDetail(null)} />

      <Alert
        open={breakthrough !== null}
        variant="critical"
        media={<Doorkeeper state="alarmed" size={84} />}
        title={`${breakthrough?.sender ?? ""}: “${breakthrough?.preview ?? ""}”`}
        message="Far outside this sender's baseline. AFK bypassed Do Not Disturb."
        onDismiss={() => setBreakthrough(null)}
        actions={[
          { label: "Call now", onPress: () => setBreakthrough(null) },
          {
            label: "Dismiss",
            style: "cancel",
            onPress: () => setBreakthrough(null),
          },
        ]}
      />
    </>
  );
}
