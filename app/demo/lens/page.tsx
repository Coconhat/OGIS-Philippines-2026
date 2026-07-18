"use client";

import { lensApps, lensDay, lensDayLabels } from "@/lib/data";
import { IconEye, IconLock, IconSparkle } from "@/components/icons";

const maxHours = Math.max(...lensApps.map((a) => a.hours));
const maxOpens = Math.max(...lensDay);

export default function LensPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-black tracking-tight">Screen Time Lens</h1>
        <p className="text-sm font-semibold text-ink-soft">
          Your week, read back to you.
        </p>
      </header>

      {/* Weekly narrative */}
      <section className="rounded-card border border-line bg-surface p-6 shadow-card">
        <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-extrabold tracking-widest uppercase text-accent-deep">
          <IconSparkle size={13} />
          This week's story
        </p>
        <p className="mt-4 text-[17px] leading-relaxed font-extrabold text-ink">
          Short-video apps took{" "}
          <span className="text-accent-deep">9.5 hours</span> this week, mostly
          between 11pm and 1am. That's your most compulsive app —{" "}
          <span className="text-coral">70% of opens</span> had no notification
          behind them.
        </p>
        <p className="mt-3 text-sm font-semibold text-ink-soft">
          Your phone didn't call you. You went anyway. That's the habit AFK
          Missions are built from.
        </p>
      </section>

      {/* App breakdown */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 className="font-extrabold">Where the hours went</h2>
        <div className="mt-4 space-y-3.5">
          {lensApps.map((app) => (
            <div key={app.name}>
              <div className="mb-1 flex items-baseline justify-between text-[13px] font-bold">
                <span>{app.name}</span>
                <span className="text-ink-soft">
                  {app.hours}h
                  <span
                    className={`ml-2 text-[11px] font-extrabold ${
                      app.compulsive >= 50 ? "text-coral" : "text-ink-faint"
                    }`}
                  >
                    {app.compulsive}% compulsive
                  </span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(app.hours / maxHours) * 100}%`,
                    background: app.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] font-semibold text-ink-faint">
          “Compulsive” = short, frequent opens with no notification trigger.
        </p>
      </section>

      {/* Day heat strip */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 className="font-extrabold">When you reach for it</h2>
        <p className="mt-0.5 text-xs font-semibold text-ink-soft">
          Pickups per two-hour block, this week's average
        </p>
        <div className="mt-4 flex items-end justify-between gap-1.5">
          {lensDay.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`w-full rounded-t-md transition-all duration-700 ${
                  v === maxOpens ? "bg-coral" : v > 12 ? "bg-accent" : "bg-line"
                }`}
                style={{ height: `${(v / maxOpens) * 72 + 6}px` }}
                title={`${v} pickups`}
              />
              <span className="text-[9px] font-bold text-ink-faint">
                {lensDayLabels[i]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-bubble bg-coral-soft px-3.5 py-2.5 text-[13px] font-bold text-coral">
          Your midnight cluster is your biggest leak — 23 pickups after 10pm.
        </p>
      </section>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] font-bold text-ink-faint">
        <IconLock size={12} />
        All analysis happens on this device. Behavioral data never leaves it.
      </p>
      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] font-bold text-ink-faint">
        <IconEye size={12} />
        AFK watches your usage so nobody else has to.
      </p>
    </div>
  );
}
