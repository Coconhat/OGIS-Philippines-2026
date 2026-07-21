"use client";

import { useState } from "react";
import { useDemoShell } from "@/lib/demo-shell";
import { useAfk } from "@/lib/afk-context";
import {
  behaviours,
  lensApps,
  lensDay,
  lensDayLabels,
  type Behaviour,
} from "@/lib/data";
import {
  BehaviourSheet,
  behaviourGlyphs,
} from "@/components/demo/behaviour-sheet";
import { NavBar } from "@/components/ui/nav-bar";
import { Tile } from "@/components/ui/tile";
import { List, Row, RowIcon } from "@/components/ui/list";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SessionTracker } from "@/components/demo/session-tracker";
import {
  IconAlertTriangle,
  IconEye,
  IconLock,
  IconSparkle,
  IconTarget,
} from "@/components/icons";

const maxHours = Math.max(...lensApps.map((a) => a.hours));
const maxOpens = Math.max(...lensDay);

// Worst first — the point of the list is triage, not an inventory.
const severityRank = { high: 0, medium: 1, low: 2 };
const ranked = [...behaviours].sort(
  (a, b) => severityRank[a.severity] - severityRank[b.severity],
);

export default function LensPage() {
  const { scrollRef } = useDemoShell();
  const [range, setRange] = useState<"week" | "today">("week");
  const [picked, setPicked] = useState<number | null>(null);
  const [openBehaviour, setOpenBehaviour] = useState<Behaviour | null>(null);
  const { acceptedMissions, acceptMission } = useAfk();

  return (
    <>
      <NavBar
        title="Screen Time"
        subtitle="Your week, read back to you."
        scrollRef={scrollRef}
        pinned={
          <SegmentedControl
            label="Time range"
            value={range}
            onChange={setRange}
            options={[
              { value: "week", label: "Week" },
              { value: "today", label: "Today" },
            ]}
          />
        }
      />

      {range === "today" ? (
        <div className="space-y-5 px-4 pb-6">
          <SessionTracker />

          {/* A day-shaped chart, finally in the day view. */}
          <section>
            <h2 className="text-footnote px-4 pt-1 pb-1.5 font-medium text-label-2">
              When you reach for it
            </h2>
            <div className="rounded-group bg-app-surface p-4">
              <div
                role="img"
                aria-label="Pickups per two-hour block. Peaks at 23 pickups after 10pm, the highest of the day."
                className="flex items-end justify-between gap-1.5"
              >
                {lensDay.map((v, i) => (
                  <button
                    key={lensDayLabels[i]}
                    type="button"
                    onClick={() => setPicked(picked === i ? null : i)}
                    aria-label={`${lensDayLabels[i]}: ${v} pickups`}
                    className="flex flex-1 cursor-pointer flex-col items-center gap-1.5"
                  >
                    <span
                      className={`text-caption font-bold transition-opacity duration-200 ${
                        picked === i ? "text-label opacity-100" : "opacity-0"
                      }`}
                    >
                      {v}
                    </span>
                    <span
                      className={`w-full rounded-t-[3px] transition-all duration-700 ease-ios ${
                        v === maxOpens
                          ? "bg-coral"
                          : v > 12
                            ? "bg-accent"
                            : "bg-fill-1"
                      }`}
                      style={{ height: `${(v / maxOpens) * 74 + 6}px` }}
                    />
                    <span className="text-caption text-label-3">
                      {lensDayLabels[i]}
                    </span>
                  </button>
                ))}
              </div>

              {/* The accessible equivalent of the chart. */}
              <table className="sr-only">
                <caption>Pickups per two-hour block</caption>
                <tbody>
                  {lensDay.map((v, i) => (
                    <tr key={lensDayLabels[i]}>
                      <th scope="row">{lensDayLabels[i]}</th>
                      <td>{v} pickups</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-footnote flex items-center justify-center gap-1.5 px-4 text-center text-label-3">
            <IconLock size={12} className="shrink-0" />
            All analysis happens on this device. Behavioural data never leaves
            it.
          </p>
        </div>
      ) : (
        <div className="space-y-5 px-4 pb-6">
          {/* The one raised element on this screen. */}
          <Tile raised padding="lg">
            <p className="text-caption inline-flex w-fit items-center gap-1.5 rounded-pill bg-accent-dim px-3 py-1.5 font-bold tracking-widest text-accent-text uppercase">
              <IconSparkle size={12} />
              This week&apos;s story
            </p>
            <p className="text-title-2 mt-4 text-balance">
              Short-video apps took{" "}
              <span className="text-accent-text">9.5 hours</span> this week,
              mostly between 11pm and 1am. That&apos;s your most compulsive app
              — <span className="text-coral-text">70% of opens</span> had no
              notification behind them.
            </p>
            <p className="text-subhead mt-3 text-label-2">
              Your phone didn&apos;t call you. You went anyway. That&apos;s the
              habit AFK Missions are built from.
            </p>
          </Tile>

          <List
            header="Where the hours went"
            footer="“Compulsive” = short, frequent opens with no notification trigger."
          >
            {lensApps.map((app) => {
              const compulsive = app.compulsive >= 50;
              return (
                <Row
                  key={app.name}
                  size="tall"
                  leading={
                    <span
                      aria-hidden
                      className="size-[29px] shrink-0 rounded-[8px]"
                      style={{ background: app.color }}
                    />
                  }
                  title={app.name}
                  subtitle={
                    <div className="mt-1 space-y-1.5">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          compulsive ? "text-coral-text" : "text-label-2"
                        }`}
                      >
                        {compulsive && <IconAlertTriangle size={12} />}
                        {app.compulsive}% compulsive
                      </span>
                      <Progress
                        value={app.hours / maxHours}
                        tint={compulsive ? "coral" : "accent"}
                        label={`${app.name}: ${app.hours} hours`}
                      />
                    </div>
                  }
                  value={
                    <span className="tabular-nums">{app.hours}h</span>
                  }
                />
              );
            })}
          </List>

          {/* The habits themselves, not just the hours. This is what
              missions get generated from — tapping one shows the
              measurement and the mission it produced. */}
          <List
            header="What we're seeing"
            footer="Ranked by how much they're costing you. Tap one to see the mission it generated."
          >
            {ranked.map((b) => {
              const Glyph = behaviourGlyphs[b.icon];
              return (
                <Row
                  key={b.id}
                  size="tall"
                  wrap
                  leading={
                    <RowIcon tint={b.severity === "high" ? "coral" : "accent"}>
                      <Glyph size={16} />
                    </RowIcon>
                  }
                  title={b.name}
                  subtitle={
                    <span className="flex items-center gap-1.5">
                      {b.severity === "high" && (
                        <IconAlertTriangle
                          size={11}
                          className="shrink-0 text-coral-text"
                        />
                      )}
                      {b.evidence}
                    </span>
                  }
                  accessory="chevron"
                  onPress={() => setOpenBehaviour(b)}
                />
              );
            })}
          </List>

          <List>
            <Row
              leading={
                <RowIcon tint="accent">
                  <IconTarget size={16} />
                </RowIcon>
              }
              title="See all missions"
              subtitle="Every mission here was generated from a habit above."
              accessory="chevron"
              href="/demo/missions"
            />
            <Row
              leading={
                <RowIcon tint="accent">
                  <IconEye size={16} />
                </RowIcon>
              }
              title="Watch it happen tonight"
              subtitle="Today shows the same habits while you're still in them."
              accessory="chevron"
              onPress={() => setRange("today")}
            />
          </List>

          <p className="text-footnote flex items-center justify-center gap-1.5 px-4 text-center text-label-3">
            <IconLock size={12} className="shrink-0" />
            All analysis happens on this device. Behavioural data never leaves
            it.
          </p>
        </div>
      )}

      <BehaviourSheet
        behaviour={openBehaviour}
        onOpenChange={(open) => !open && setOpenBehaviour(null)}
        onAccept={acceptMission}
        accepted={acceptedMissions}
      />
    </>
  );
}
