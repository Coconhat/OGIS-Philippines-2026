"use client";

import { useState } from "react";
import { useAfk } from "@/lib/afk-context";
import {
  briefingDecisions,
  briefingHandled,
  emailClusters,
  verdictMeta,
} from "@/lib/data";
import {
  IconBellOff,
  IconCheck,
  IconChevronDown,
  IconInbox,
  IconLock,
  IconUndo,
} from "@/components/icons";

export default function BriefingPage() {
  const { handled, minutesAfk } = useAfk();
  const [undone, setUndone] = useState<string[]>([]);
  const [decided, setDecided] = useState<Record<string, string>>({});
  const [mailOpen, setMailOpen] = useState(false);

  // Live triage results (minus the escalation, which reached the user) merged
  // ahead of the pre-seeded log so the digest is rich on first visit.
  const liveHandled = handled
    .filter((ev) => ev.verdict !== "escalate")
    .map((ev) => ({
      id: `live-${ev.id}`,
      who: `${ev.sender} · ${ev.channel}`,
      what: ev.aiAction,
      verdict: ev.verdict,
    }));
  const seeded = briefingHandled.filter(
    (b) => !liveHandled.some((l) => l.who.startsWith(b.who.split(" ·")[0])),
  );
  const rows = [...liveHandled, ...seeded];
  const suppressedTotal = emailClusters.reduce((n, c) => n + c.count, 0);

  const awayLabel =
    minutesAfk > 0
      ? `${Math.floor(minutesAfk / 60)}h ${minutesAfk % 60}m`
      : "3h 12m";

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-black tracking-tight">Welcome back.</h1>
        <p className="text-sm font-semibold text-ink-soft">
          You were AFK for {awayLabel}. Here's your 20-second digest.
        </p>
      </header>

      {/* Summary strip */}
      <section className="grid grid-cols-3 gap-2.5">
        {[
          [String(rows.length), "handled for you"],
          [String(suppressedTotal), "held back quietly"],
          [String(briefingDecisions.length), "need a decision"],
        ].map(([num, label], i) => (
          <div
            key={label}
            className={`rounded-card px-2 py-4 text-center shadow-card ${
              i === 2 ? "bg-accent text-white" : "border border-line bg-surface"
            }`}
          >
            <p className="text-xl font-black">{num}</p>
            <p
              className={`mt-0.5 text-[10px] leading-tight font-bold ${
                i === 2 ? "text-white/85" : "text-ink-soft"
              }`}
            >
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* Needs you */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 className="font-extrabold">Genuinely needs you</h2>
        <div className="mt-3 space-y-3">
          {briefingDecisions.map((d) => (
            <div key={d.id} className="rounded-bubble bg-canvas p-3.5">
              <p className="text-sm font-extrabold">{d.who}</p>
              <p className="mt-0.5 text-[13px] font-semibold text-ink-soft">
                {d.what}
              </p>
              {decided[d.id] ? (
                <p className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-mint">
                  <IconCheck size={15} strokeWidth={3} />
                  {decided[d.id]}
                </p>
              ) : (
                <div className="mt-2.5 flex gap-2">
                  <button
                    onClick={() =>
                      setDecided((p) => ({
                        ...p,
                        [d.id]: "Accepted — reply sent",
                      }))
                    }
                    className="cursor-pointer rounded-full bg-ink px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-night-2"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      setDecided((p) => ({
                        ...p,
                        [d.id]: "Snoozed until tomorrow",
                      }))
                    }
                    className="cursor-pointer rounded-full border border-line bg-surface px-4 py-2 text-xs font-extrabold text-ink-soft transition-colors hover:border-ink-faint"
                  >
                    Snooze
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Handled */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 className="flex items-center justify-between font-extrabold">
          Handled while you were away
          <span className="text-[11px] font-bold text-ink-faint">
            tap undo to reverse
          </span>
        </h2>
        <div className="mt-3 space-y-2.5">
          {rows.map((row) => {
            const meta = verdictMeta[row.verdict];
            const isUndone = undone.includes(row.id);
            return (
              <div
                key={row.id}
                className={`rounded-bubble bg-canvas p-3.5 transition-opacity duration-300 ${
                  isUndone ? "opacity-45" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-extrabold">{row.who}</p>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold"
                    style={{
                      color: meta.color,
                      background: "var(--color-surface)",
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed font-semibold text-ink-soft">
                  {row.what}
                </p>
                <button
                  onClick={() =>
                    setUndone((p) =>
                      isUndone ? p.filter((x) => x !== row.id) : [...p, row.id],
                    )
                  }
                  className="mt-2 inline-flex cursor-pointer items-center gap-1 text-[11px] font-extrabold text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink"
                >
                  <IconUndo size={12} />
                  {isUndone ? "Undone — restore?" : "Undo this action"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Suppressed / email digest */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <button
          onClick={() => setMailOpen((o) => !o)}
          aria-expanded={mailOpen}
          className="flex w-full cursor-pointer items-center justify-between"
        >
          <span className="inline-flex items-center gap-2 font-extrabold">
            <IconInbox size={18} className="text-accent-deep" />
            {suppressedTotal} emails, folded into one digest
          </span>
          <IconChevronDown
            size={18}
            className={`text-ink-faint transition-transform duration-200 ${
              mailOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {mailOpen && (
          <div className="mt-3 space-y-2">
            {emailClusters.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between rounded-bubble bg-canvas px-3.5 py-3"
              >
                <div>
                  <p className="text-sm font-extrabold">{c.name}</p>
                  <p className="text-xs font-semibold text-ink-soft">
                    {c.summary}
                  </p>
                </div>
                <span className="ml-3 grid size-8 shrink-0 place-items-center rounded-full bg-surface text-xs font-black text-ink-soft">
                  {c.count}
                </span>
              </div>
            ))}
            <p className="pt-1 text-[11px] font-semibold text-ink-faint">
              An afternoon offline never costs an evening of catch-up.
            </p>
          </div>
        )}
      </section>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] font-bold text-ink-faint">
        <IconLock size={12} />
        Full audit log in the Persona &amp; Audit store — local SQLite, never
        synced.
      </p>
      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] font-bold text-ink-faint">
        <IconBellOff size={12} />
        37 interruptions avoided this week. That's the metric.
      </p>
    </div>
  );
}
