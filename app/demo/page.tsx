"use client";

import { useState } from "react";
import { useAfk } from "@/lib/afk-context";
import { useDemoShell } from "@/lib/demo-shell";
import {
  autonomyLadder,
  guardianNights,
  missions,
  GUARDIAN_LATE_NIGHTS,
  GUARDIAN_TARGET_HOURS,
} from "@/lib/data";
import { DoorkeeperStage } from "@/components/afk/doorkeeper-stage";
import { SpeechBubble } from "@/components/afk/speech-bubble";
import { GoAfkSheet } from "@/components/demo/go-afk-sheet";
import { NavBar } from "@/components/ui/nav-bar";
import { Button } from "@/components/ui/button";
import { Tile } from "@/components/ui/tile";
import { SummaryBoard } from "@/components/ui/summary-board";
import { LevelMeter } from "@/components/ui/dial";
import { MissionRow } from "@/components/demo/mission-row";
import { MoonIllo } from "@/components/illustrations";
import {
  IconBellOff,
  IconCheck,
  IconChevronRight,
  IconFlame,
  IconMoon,
  IconShield,
  IconX,
  IconZap,
} from "@/components/icons";

export default function DemoHome() {
  const { scrollRef } = useDemoShell();
  const {
    afkOn,
    setAfkOn,
    level,
    handled,
    guardian,
    setGuardian,
    completedMissions,
    completeMission,
    afkUntil,
    breakthrough,
  } = useAfk();
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeLevel = autonomyLadder[level] ?? autonomyLadder[2];

  /* Derived from the actual run rather than padded with a constant —
     at Observe nothing is sent, and the counter should say so. An
     escalation only counts as an interruption if that contact is still
     on the always-list, matching how Triage gates the alert. */
  const rangThrough = handled.filter(
    (e) => e.verdict === "escalate" && breakthrough["c-mom"],
  ).length;
  const handledQuietly = handled.length - rangThrough;
  const mission = missions[0];
  const missionDone = completedMissions.includes(mission.id);

  return (
    <>
      <NavBar
        title="AFK"
        subtitle="Friday, 4:21pm"
        scrollRef={scrollRef}
        leading={
          <Button
            variant="plain"
            size="small"
            tint="ink"
            href="/"
            icon={<IconX size={13} />}
            aria-label="Exit demo, back to the landing page"
          >
            Exit demo
          </Button>
        }
      />

      <div className="space-y-5 px-4 pt-1 pb-6">
        {/* The one raised element on this screen.
            Two zones: a lit scene the Doorkeeper actually inhabits, then
            the white content shelf. The split is what gives the speech
            bubble a surface to read against — white-on-white had no
            container at all — and it breaks the single centred column
            into a rhythm. */}
        <Tile raised padding="none">
          <div className="flex flex-col items-center px-5 pt-5">
            <SpeechBubble tail="bottom" className="relative z-10">
              {afkOn
                ? "I've got the door. Go be somewhere else."
                : "Ready when you are. I'll hold the line."}
            </SpeechBubble>

            {/* Sparks and a soft halo instead of a tinted panel — the
                decoration carries the personality, the card stays white. */}
            <DoorkeeperStage
              state={afkOn ? "watching" : "dozing"}
              size={142}
              className="-mt-2"
            />
          </div>

          <div className="px-5 pt-1 pb-5 text-center">
            {afkOn ? (
              <>
                <p className="text-title-2">Holding your place</p>
                <p className="text-subhead mt-1 text-label-2">
                  {activeLevel.name} · until {afkUntil}
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-footnote inline-flex items-center gap-1.5 rounded-pill bg-fill-2 px-3 py-1.5 font-semibold">
                    <IconBellOff size={13} className="text-accent-text" />
                    {handledQuietly} handled
                  </span>
                  <span className="text-footnote inline-flex items-center gap-1.5 rounded-pill bg-fill-2 px-3 py-1.5 font-semibold">
                    <IconZap size={13} className="text-accent-text" />
                    {rangThrough} interruption{rangThrough === 1 ? "" : "s"}
                  </span>
                </div>

                <Button
                  size="large"
                  full
                  tint="ink"
                  className="mt-4"
                  href="/demo/briefing"
                  onPress={() => setAfkOn(false)}
                >
                  I&apos;m back
                </Button>
              </>
            ) : (
              <>
                <p className="text-title-2">You&apos;re online</p>
                <p className="text-subhead mx-auto mt-1 max-w-[32ch] text-label-2 text-balance">
                  Hand the door to AFK and step away. Real emergencies still
                  ring through.
                </p>
                <Button
                  size="large"
                  full
                  className="mt-4"
                  icon={<IconMoon size={18} />}
                  onPress={() => setSheetOpen(true)}
                >
                  Go AFK&hellip;
                </Button>
              </>
            )}
          </div>
        </Tile>

        {/* Session — one card that *shows* the setting, rather than two
            rows that merely name it. The meter echoes the dial in the
            sheet, so the two read as the same control. */}
        <section>
          <h2 className="text-footnote px-4 pt-1 pb-1.5 font-medium text-label-2">
            Session
          </h2>
          <Tile padding="none" onPress={() => setSheetOpen(true)}>
            <div className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-caption font-semibold tracking-wide text-accent-text uppercase">
                  Autonomy
                </p>
                <p className="text-title-3 mt-0.5">{activeLevel.name}</p>
                <p className="text-footnote mt-0.5 text-label-2">
                  {activeLevel.tagline} · until {afkUntil}
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
        </section>

        {/* Burnout Guardian — the app's most human moment, so it gets
            actual weight: an illustration, the evidence as chips, and a
            real decision. Dismissible, and it remembers. */}
        {guardian !== "dismissed" && (
          <section>
            <h2 className="text-footnote px-4 pt-1 pb-1.5 font-medium text-label-2">
              Looking out for you
            </h2>

            {guardian === "approved" ? (
              <Tile tone="act" padding="md">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-white/70 text-mint-text">
                    <IconCheck size={20} strokeWidth={3} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-headline">Tonight is protected</p>
                    <p className="text-footnote mt-0.5 text-label-2">
                      AFK runs Handle it from 8pm to 7am. Sleep well.
                    </p>
                  </div>
                </div>
              </Tile>
            ) : (
              <Tile padding="none" className="overflow-hidden">
                <div className="relative bg-coral-dim px-4 pt-4 pb-4">
                  {/* The moon does the emotional work the copy can't. */}
                  <div className="dk-drift pointer-events-none absolute -top-2 -right-3 w-[150px] opacity-90">
                    <MoonIllo />
                  </div>

                  <p className="text-caption inline-flex items-center gap-1.5 rounded-pill bg-white/70 px-2.5 py-1 font-bold tracking-wide text-coral-text uppercase">
                    <IconFlame size={12} />
                    Burnout Guardian
                  </p>
                  <p className="text-title-3 mt-2.5 max-w-[16ch] text-balance">
                    You&apos;re running hot.
                  </p>

                  {/* Seven short bars under a target line — the claim,
                      drawn. Same visual language as the Lens heat strip. */}
                  <div className="relative mt-4">
                    <div
                      role="img"
                      aria-label={`Sleep over the last seven nights, all below the ${GUARDIAN_TARGET_HOURS} hour target. Average 5.8 hours.`}
                      className="flex items-end gap-1.5"
                    >
                      {guardianNights.map((n, i) => (
                        <span
                          key={i}
                          className="flex flex-1 flex-col items-center gap-1"
                        >
                          <span
                            className="w-full rounded-t-[3px] bg-coral/70"
                            style={{
                              height: `${(n.hours / GUARDIAN_TARGET_HOURS) * 44}px`,
                            }}
                          />
                          <span className="text-[10px] leading-none font-bold text-label-3">
                            {n.day}
                          </span>
                        </span>
                      ))}
                    </div>

                    {/* Target line, sitting where 8h would reach. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 flex items-center gap-1.5"
                      style={{ bottom: 44 + 12 }}
                    >
                      <span className="h-px flex-1 border-t border-dashed border-label-3" />
                      <span className="text-[10px] leading-none font-bold text-label-2">
                        {GUARDIAN_TARGET_HOURS}h
                      </span>
                    </span>
                  </div>

                  <table className="sr-only">
                    <caption>Sleep, last seven nights</caption>
                    <tbody>
                      {guardianNights.map((n, i) => (
                        <tr key={i}>
                          <th scope="row">Night {i + 1}</th>
                          <td>{n.hours} hours</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-caption inline-flex items-center gap-1.5 rounded-pill bg-white/70 px-2.5 py-1 font-semibold">
                      <IconFlame size={12} className="text-coral-text" />
                      {GUARDIAN_LATE_NIGHTS} nights straight
                    </span>
                    <span className="text-caption rounded-pill bg-white/70 px-2.5 py-1 font-semibold">
                      5.8h average
                    </span>
                  </div>
                </div>

                <div className="px-4 py-3.5">
                  <p className="text-subhead text-label-2">
                    I&apos;ve booked you an AFK window tonight, 8pm to 7am, so
                    the phone stops asking. Approve?
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="filled"
                      size="small"
                      onPress={() => setGuardian("approved")}
                    >
                      Approve tonight
                    </Button>
                    <Button
                      variant="plain"
                      size="small"
                      tint="ink"
                      onPress={() => setGuardian("dismissed")}
                    >
                      Not tonight
                    </Button>
                  </div>
                </div>
              </Tile>
            )}
          </section>
        )}

        {/* Active mission — the same checkable row the Missions tab
            uses, so it's recognisably the same object in both places. */}
        <section>
          <h2 className="text-footnote px-4 pt-1 pb-1.5 font-medium text-label-2">
            Today
          </h2>
          <MissionRow
            mission={mission}
            done={missionDone}
            href="/demo/missions"
            onComplete={() => completeMission(mission.id)}
          />
          <p className="text-caption mt-2 flex items-center gap-2 px-4 text-label-3">
            <IconShield size={13} className="shrink-0 text-accent-text" />
            Triage holds the line while this is active
          </p>
        </section>

        <section>
          <h2 className="text-footnote px-4 pt-1 pb-1.5 font-medium text-label-2">
            This week
          </h2>
          <SummaryBoard
            items={[
              {
                value: "37",
                label: "interruptions avoided",
                readAs: "37 interruptions avoided",
                icon: <IconBellOff size={14} />,
                tint: "sky",
              },
              {
                value: "11.2h",
                label: "reclaimed this week",
                readAs: "11.2 hours reclaimed this week",
                icon: <IconZap size={14} />,
                tint: "accent",
                prominent: true,
              },
              {
                value: `${4 + completedMissions.length}`,
                label: "day streak",
                readAs: `${4 + completedMissions.length} day streak`,
                icon: <IconFlame size={14} />,
                tint: "coral",
              },
            ]}
          />
        </section>

        <p className="text-footnote px-4 text-center text-label-3">
          Simulated demo · everything stays on this device
        </p>
      </div>

      <GoAfkSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
