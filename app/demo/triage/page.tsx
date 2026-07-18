"use client";

import { useEffect, useRef, useState } from "react";
import { useAfk } from "@/lib/afk-context";
import {
  triageScript,
  verdictMeta,
  type TriageEvent,
} from "@/lib/data";
import {
  IconAlarm,
  IconMail,
  IconMessage,
  IconMoon,
  IconPhone,
  IconShield,
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

function VerdictChips({ ev }: { ev: TriageEvent }) {
  const urgencyColor =
    ev.urgency === "high"
      ? "text-coral"
      : ev.urgency === "medium"
        ? "text-accent-deep"
        : "text-ink-soft";
  return (
    <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
      <span className="rounded-full bg-canvas px-2.5 py-1 text-ink-soft">
        intent: {ev.intent}
      </span>
      <span className={`rounded-full bg-canvas px-2.5 py-1 ${urgencyColor}`}>
        urgency: {ev.urgency}
      </span>
      <span className="rounded-full bg-canvas px-2.5 py-1 text-ink-soft">
        trust: {ev.trust}
      </span>
    </div>
  );
}

function EventCard({
  ev,
  onVerdict,
}: {
  ev: TriageEvent;
  onVerdict: (ev: TriageEvent) => void;
}) {
  const [stage, setStage] = useState<"arrived" | "thinking" | "verdict">(
    "arrived",
  );
  const [showReply, setShowReply] = useState(false);
  const notified = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage("thinking"), 500);
    const t2 = setTimeout(() => setStage("verdict"), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (stage === "verdict" && !notified.current) {
      notified.current = true;
      onVerdict(ev);
    }
  }, [stage, ev, onVerdict]);

  const meta = verdictMeta[ev.verdict];
  const Channel = channelIcon[ev.channel];
  const escalated = ev.verdict === "escalate" && stage === "verdict";

  return (
    <article
      className={`animate-rise rounded-card border bg-surface p-4 shadow-card transition-all duration-300 ${
        escalated ? "border-coral ring-2 ring-coral/25" : "border-line"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-black ${
            ev.trust === "trusted"
              ? "bg-accent-soft text-accent-deep"
              : "bg-canvas text-ink-soft"
          }`}
        >
          {ev.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-extrabold">
            <Channel size={13} className="shrink-0 text-ink-faint" />
            <span className="truncate">{ev.sender}</span>
          </p>
          <p className="text-[11px] font-semibold text-ink-faint">
            {ev.senderRole} · {ev.channel}
          </p>
        </div>
        {stage === "verdict" && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold"
            style={{ color: meta.color, background: meta.bg }}
          >
            {meta.label}
          </span>
        )}
      </div>

      <p className="mt-2.5 rounded-bubble bg-canvas px-3.5 py-2.5 text-[13px] font-semibold text-ink">
        {ev.preview}
      </p>

      {stage === "thinking" && (
        <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-accent-deep">
          <IconSparkle size={13} className="animate-pulse-dot" />
          AFK AI reading — locally, on your device…
        </p>
      )}

      {stage === "verdict" && (
        <div className="mt-2.5 space-y-2">
          <VerdictChips ev={ev} />
          <p className="text-[11px] font-semibold text-ink-faint">
            baseline: {ev.deviation}
          </p>
          <p
            className="text-[13px] font-bold"
            style={{ color: ev.verdict === "suppress" ? "var(--color-ink-soft)" : meta.color }}
          >
            {ev.aiAction}
          </p>
          {ev.aiReply && (
            <div>
              <button
                onClick={() => setShowReply((s) => !s)}
                className="cursor-pointer text-xs font-extrabold text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink"
              >
                {showReply ? "Hide AI reply" : "See what AFK sent"}
              </button>
              {showReply && (
                <p className="mt-2 rounded-bubble rounded-br-sm bg-sky-soft px-3.5 py-2.5 text-[13px] leading-relaxed font-semibold text-ink">
                  {ev.aiReply}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function TriagePage() {
  const { afkOn, setAfkOn, pushHandled } = useAfk();
  const [run, setRun] = useState(0);
  const [count, setCount] = useState(0);
  const [breakthrough, setBreakthrough] = useState<TriageEvent | null>(null);

  useEffect(() => {
    if (!afkOn || count >= triageScript.length) return;
    const t = setTimeout(
      () => setCount((c) => c + 1),
      count === 0 ? 700 : 4200,
    );
    return () => clearTimeout(t);
  }, [afkOn, count, run]);

  const handleVerdict = (ev: TriageEvent) => {
    pushHandled(ev);
    if (ev.verdict === "escalate") setBreakthrough(ev);
  };

  const active = triageScript.slice(0, count);
  const done = count >= triageScript.length;

  return (
    <div className="space-y-3">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Triage</h1>
          <p className="text-sm font-semibold text-ink-soft">
            {afkOn
              ? "Live — AFK AI is on the door."
              : "AFK is off. Nothing to triage."}
          </p>
        </div>
        {afkOn && done && (
          <button
            onClick={() => {
              setRun((r) => r + 1);
              setCount(0);
            }}
            className="cursor-pointer rounded-full border border-line bg-surface px-4 py-2 text-xs font-extrabold text-ink transition-colors hover:border-ink-faint"
          >
            Replay
          </button>
        )}
      </header>

      {!afkOn && (
        <div className="rounded-card border border-line bg-surface p-8 text-center shadow-card">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-accent-soft text-accent-deep">
            <IconShield size={28} />
          </div>
          <p className="font-extrabold">The door is open</p>
          <p className="mx-auto mt-1 max-w-[30ch] text-sm font-semibold text-ink-soft">
            Go AFK and watch every incoming message get read, judged, and
            handled — live.
          </p>
          <button
            onClick={() => setAfkOn(true)}
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-6 py-3 font-extrabold text-white shadow-pop transition-colors hover:bg-accent-deep"
          >
            <IconMoon size={17} />
            Go AFK now
          </button>
        </div>
      )}

      {afkOn && (
        <div key={run} className="space-y-3">
          {active.length === 0 && (
            <p className="py-8 text-center text-sm font-bold text-ink-faint">
              Listening for incoming events…
            </p>
          )}
          {[...active].reverse().map((ev) => (
            <EventCard key={ev.id} ev={ev} onVerdict={handleVerdict} />
          ))}
          {done && (
            <p className="pt-2 text-center text-xs font-bold text-ink-faint">
              6 events · 5 handled quietly · 1 reached you
            </p>
          )}
        </div>
      )}

      {/* Breakthrough overlay */}
      {breakthrough && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm"
          role="alertdialog"
          aria-label="Emergency breakthrough"
        >
          <div className="animate-rise mx-auto mb-24 w-[calc(100%-40px)] max-w-[390px] rounded-card bg-coral p-6 text-center text-white shadow-pop">
            <IconAlarm size={30} className="mx-auto mb-2 animate-pulse-dot" />
            <p className="text-xs font-extrabold tracking-widest uppercase text-white/80">
              Breakthrough — this one is real
            </p>
            <p className="mt-2 text-xl font-black">
              {breakthrough.sender}: “{breakthrough.preview}”
            </p>
            <p className="mt-1 text-sm font-bold text-white/85">
              Far outside this sender's baseline. AFK bypassed Do Not Disturb.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setBreakthrough(null)}
                className="cursor-pointer rounded-full bg-white py-3 font-extrabold text-coral transition-transform duration-150 active:scale-95"
              >
                Call now
              </button>
              <button
                onClick={() => setBreakthrough(null)}
                className="cursor-pointer rounded-full bg-white/20 py-3 font-extrabold text-white transition-colors hover:bg-white/30"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {afkOn && (
        <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] font-bold text-ink-faint">
          <IconUndo size={12} />
          Every action is reviewable and undoable in your Return Briefing
        </p>
      )}
    </div>
  );
}
