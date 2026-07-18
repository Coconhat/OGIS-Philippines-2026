"use client";

import { useState } from "react";
import Link from "next/link";
import { useAfk } from "@/lib/afk-context";
import { autonomyLadder, missions } from "@/lib/data";
import {
  IconArrowRight,
  IconBellOff,
  IconCheck,
  IconFlame,
  IconMoon,
  IconTarget,
  IconZap,
} from "@/components/icons";

export default function DemoHome() {
  const { afkOn, setAfkOn, level, setLevel, handled } = useAfk();
  const [guardianApproved, setGuardianApproved] = useState(false);
  const activeLevel = autonomyLadder[level];
  const activeMission = missions[0];

  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm font-bold text-ink-soft">Friday, 4:21pm</p>
        <h1 className="text-2xl font-black tracking-tight">
          {afkOn ? "Enjoy being away." : "Ready to step away?"}
        </h1>
      </header>

      {/* AFK toggle card */}
      <section
        className={`rounded-card p-6 text-center transition-all duration-500 ${
          afkOn ? "wallpaper shadow-pop" : "bg-surface border border-line shadow-card"
        }`}
      >
        <div
          className={`mx-auto mb-4 grid size-20 place-items-center rounded-full transition-colors duration-500 ${
            afkOn ? "glass text-accent-deep animate-breathe" : "wallpaper text-white shadow-card"
          }`}
        >
          <IconMoon size={34} strokeWidth={2.2} />
        </div>
        {afkOn ? (
          <>
            <p className="text-lg font-black text-white drop-shadow-sm">
              AFK is holding your place
            </p>
            <p className="mt-1 text-sm font-bold text-white/85">
              Level {level} · {activeLevel.name} · until 7:00pm
            </p>
            <div className="mt-4 flex items-center justify-center gap-2.5 text-xs font-extrabold text-ink">
              <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
                <IconBellOff size={13} className="text-accent-deep" />
                {5 + handled.length} handled
              </span>
              <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
                <IconZap size={13} className="text-accent-deep" />
                0 interruptions
              </span>
            </div>
            <button
              onClick={() => setAfkOn(false)}
              className="mt-5 w-full cursor-pointer rounded-full bg-white py-3.5 font-extrabold text-accent-deep shadow-card transition-transform duration-200 active:scale-[0.98]"
            >
              I'm back
            </button>
          </>
        ) : (
          <>
            <p className="text-lg font-black">You're online</p>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              Hand your notifications to AFK and step away. Real emergencies
              still break through.
            </p>
            <button
              onClick={() => setAfkOn(true)}
              className="mt-5 w-full cursor-pointer rounded-full bg-ink py-3.5 font-extrabold text-white shadow-pop transition-colors duration-200 hover:bg-night-2"
            >
              Go AFK until 7:00pm
            </button>
          </>
        )}
      </section>

      {/* Autonomy ladder */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 className="font-extrabold">Autonomy ladder</h2>
        <p className="mt-0.5 text-xs font-semibold text-ink-soft">
          How much can AFK do on your behalf?
        </p>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {autonomyLadder.map((l) => (
            <button
              key={l.level}
              onClick={() => setLevel(l.level)}
              aria-pressed={level === l.level}
              className={`cursor-pointer rounded-bubble py-2.5 text-center transition-all duration-200 ${
                level === l.level
                  ? "wallpaper text-white shadow-card"
                  : "bg-canvas text-ink-soft hover:bg-line/60"
              }`}
            >
              <span className={`block text-sm font-black ${level === l.level ? "text-white" : ""}`}>
                L{l.level}
              </span>
              <span className="block text-[10px] font-bold leading-tight">
                {l.name}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-bubble bg-canvas px-3.5 py-3 text-[13px] leading-relaxed font-semibold text-ink-soft">
          {activeLevel.detail}
        </p>
      </section>

      {/* Burnout Guardian */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-coral-soft text-coral">
            <IconFlame size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold">Burnout Guardian</h2>
            {guardianApproved ? (
              <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-bold text-mint">
                <IconCheck size={15} strokeWidth={3} />
                Scheduled. AFK Level 2 tonight, 8pm–7am.
              </p>
            ) : (
              <>
                <p className="mt-1 text-[13px] leading-relaxed font-semibold text-ink-soft">
                  You've answered work messages 11 nights straight and averaged
                  5.8h of sleep. I've scheduled AFK Level 2 tonight from 8pm —
                  approve?
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setGuardianApproved(true)}
                    className="cursor-pointer rounded-full bg-ink px-5 py-2 text-sm font-extrabold text-white transition-colors duration-200 hover:bg-night-2"
                  >
                    Approve
                  </button>
                  <button className="cursor-pointer rounded-full border border-line px-5 py-2 text-sm font-extrabold text-ink-soft transition-colors duration-200 hover:border-ink-faint">
                    Not tonight
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Active mission */}
      <Link
        href="/demo/missions"
        className="block rounded-card border border-line bg-surface p-5 shadow-card transition-shadow duration-200 hover:shadow-pop"
      >
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-deep">
            <IconTarget size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold tracking-wide text-accent-deep uppercase">
              Active mission
            </p>
            <p className="truncate font-extrabold">{activeMission.title}</p>
            <p className="text-xs font-semibold text-ink-soft">
              {activeMission.goal} · triage holds the line while it's active
            </p>
          </div>
          <IconArrowRight size={18} className="shrink-0 text-ink-faint" />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${activeMission.progress * 100}%` }}
          />
        </div>
      </Link>

      {/* This week */}
      <section className="grid grid-cols-3 gap-2.5">
        {[
          ["37", "interruptions avoided"],
          ["11.2h", "reclaimed this week"],
          ["4", "day streak"],
        ].map(([num, label]) => (
          <div
            key={label}
            className="rounded-card border border-line bg-surface px-2 py-4 text-center shadow-card"
          >
            <p className="text-xl font-black text-ink">{num}</p>
            <p className="mt-0.5 text-[10px] leading-tight font-bold text-ink-soft">
              {label}
            </p>
          </div>
        ))}
      </section>

      <p className="pt-1 text-center text-[11px] font-bold text-ink-faint">
        Simulated demo · everything stays on this device
      </p>
    </div>
  );
}
