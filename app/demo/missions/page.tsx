"use client";

import { useState } from "react";
import { useAfk } from "@/lib/afk-context";
import { useDemoShell } from "@/lib/demo-shell";
import {
  feed,
  missions,
  nudges,
  type CreatedMission,
  type Mission,
} from "@/lib/data";
import { NavBar } from "@/components/ui/nav-bar";
import { Button } from "@/components/ui/button";
import { Tile } from "@/components/ui/tile";
import { List, Row, RowIcon } from "@/components/ui/list";
import { Sheet } from "@/components/ui/sheet";
import { MissionRow, chipTint, dotTint } from "@/components/demo/mission-row";
import {
  behaviourById,
  behaviourGlyphs,
} from "@/components/demo/behaviour-sheet";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/empty-state";
import { FlagIllo } from "@/components/illustrations";
import {
  IconAlertTriangle,
  IconCamera,
  IconChart,
  IconCheck,
  IconFlame,
  IconHeart,
  IconTarget,
  IconZap,
} from "@/components/icons";

const sceneStyle: Record<string, string> = {
  hike: "linear-gradient(135deg, #7fb069 0%, #4a7c59 55%, #2c5530 100%)",
  meal: "linear-gradient(135deg, #ffb45c 0%, #ff8c17 60%, #d95f02 100%)",
  book: "linear-gradient(135deg, #8ea6c8 0%, #5b729b 60%, #3b4a6b 100%)",
  run: "linear-gradient(135deg, #ff9a8b 0%, #ff6154 60%, #c73e33 100%)",
};

const sceneLabel: Record<string, string> = {
  hike: "🌲 out on the trail",
  meal: "🍜 dinner, phones away",
  book: "📖 paper pages",
  run: "🏃 morning air",
};

/* A mission that exists but isn't yours yet — the rule crossed, AFK
   wrote it, and it's waiting for an answer. Used for both the ones
   written in front of you tonight and the ones the weekly read wrote,
   because they are the same object arriving by different clocks. */
function WrittenMission({
  mission: m,
  created,
  onAccept,
  onDetails,
}: {
  mission: Mission;
  created?: CreatedMission;
  onAccept: () => void;
  onDetails: () => void;
}) {
  const b = behaviourById(m.behaviourId);
  const Glyph = b ? behaviourGlyphs[b.icon] : IconChart;

  return (
    <div className="rounded-tile bg-app-surface p-3.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <p
          className={`text-caption inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-bold tracking-wide uppercase ${chipTint[m.tint]}`}
        >
          <Glyph size={11} />
          {b?.name ?? "Habit"}
        </p>
        <span className="text-caption text-label-3">
          Written {created?.at ?? m.origin.createdAt}
        </span>
      </div>

      <p className="text-headline mt-2 text-balance">{m.title}</p>
      <p className="text-footnote mt-1 text-balance text-label-2">
        {m.prescription}
      </p>

      {/* The line, then what crossed it. Without this a mission is just
          advice with a checkbox. */}
      <div className="mt-2.5 rounded-[10px] bg-fill-2 px-3 py-2.5">
        <p className="text-caption flex items-center gap-1.5 font-bold tracking-wide text-label-2 uppercase">
          <IconTarget size={11} />
          The rule that wrote it
        </p>
        <p className="text-footnote mt-1 text-balance">{m.origin.threshold}</p>
        <p className="text-caption mt-1 flex items-center gap-1.5 tabular-nums text-label-3">
          <IconChart size={11} className="shrink-0" />
          {created?.observed ?? m.origin.observed}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button variant="tinted" size="small" onPress={onAccept}>
          Take this on
        </Button>
        <Button variant="plain" size="small" tint="ink" onPress={onDetails}>
          Details
        </Button>
      </div>
    </div>
  );
}

export default function MissionsPage() {
  const { scrollRef } = useDemoShell();
  const {
    completedMissions,
    completeMission,
    acceptedMissions,
    acceptMission,
    createdMissions,
    liked,
    toggleLiked,
    nudgeLog,
  } = useAfk();

  // Only the nudges that actually defended a mission belong here.
  const missionNudges = nudgeLog.filter((r) => r.missionId);
  const [tab, setTab] = useState<"challenges" | "feed">("challenges");
  const [detail, setDetail] = useState<Mission | null>(null);

  /* A mission is on your list once you take it on. Everything else was
     written by a rule and is waiting for an answer — either a rule that
     crossed in front of you tonight, or one that crossed on the weekly
     read. A `created` mission that hasn't fired yet doesn't exist at
     all, which is the point: your usage has to write it first. */
  const isMine = (m: Mission) =>
    m.status === "active" || acceptedMissions.includes(m.id);
  const createdFor = (id: string) =>
    createdMissions.find((c) => c.missionId === id);

  const active = missions.filter(isMine);
  const writtenTonight = missions.filter((m) => !isMine(m) && createdFor(m.id));
  const suggested = missions.filter(
    (m) => !isMine(m) && !createdFor(m.id) && m.status === "suggested",
  );

  const allDone = active.every((m) => completedMissions.includes(m.id));

  const myPosts = missions
    .filter((m) => completedMissions.includes(m.id))
    .map((m) => ({
      id: `me-${m.id}`,
      author: "You",
      avatar: "Y",
      time: "just now",
      mission: m.title,
      caption: "Proof of life away from the screen.",
      offline: "mission protected by triage",
      kudos: 0,
      scene: "run" as const,
    }));

  const posts = [...myPosts, ...feed];

  return (
    <>
      <NavBar
        title="Missions"
        subtitle="Written by your usage, not chosen from a list."
        scrollRef={scrollRef}
        trailing={
          <span className="text-footnote inline-flex items-center gap-1.5 rounded-pill bg-accent-dim px-3 py-1.5 font-bold text-accent-text">
            <IconFlame size={14} />
            {4 + completedMissions.length}-day streak
          </span>
        }
        pinned={
          <SegmentedControl
            label="Missions view"
            value={tab}
            onChange={setTab}
            options={[
              { value: "challenges", label: "Challenges" },
              { value: "feed", label: "Feed" },
            ]}
          />
        }
      />

      <div className="space-y-5 px-4 pb-6">
        {tab === "challenges" ? (
          <>
            {/* Second and last appearance of the wallpaper gradient. */}
           {/*  <Tile tone="brand" padding="none" className="rounded-[16px]">
              <div className="flex items-center gap-3 p-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-white/70">
                  <IconShield size={17} />
                </span>
                <p className="text-footnote font-semibold text-balance">
                  Triage holds the line while a mission is active — the
                  challenge is protected, not just promised.
                </p>
              </div>
            </Tile> */}

            {/* The README claims triage holds the line while a mission is
                active. This is the first screen that shows it happening
                rather than asserting it. */}
            {missionNudges.length > 0 && (
              <List tint="coral" header="Held the line tonight">
                {missionNudges.map((r) => {
                  const n = nudges.find((x) => x.id === r.nudgeId);
                  return (
                    <Row
                      key={r.nudgeId}
                      size="tall"
                      wrap
                      leading={
                        <RowIcon tint={r.outcome === "heeded" ? "mint" : "coral"}>
                          {r.outcome === "heeded" ? (
                            <IconCheck size={16} />
                          ) : (
                            <IconAlertTriangle size={16} />
                          )}
                        </RowIcon>
                      }
                      title={n?.headline ?? "Nudge"}
                      subtitle={
                        r.outcome === "heeded"
                          ? "You closed the app. Streak intact."
                          : r.outcome === "snoozed"
                            ? "You asked for five more minutes."
                            : "You stayed. The streak takes the hit."
                      }
                    />
                  );
                })}
              </List>
            )}

            {/* Written while you were still in the app. This is the
                whole mechanism in one card: you crossed a line, and a
                mission existed before you put the phone down. */}
            {writtenTonight.length > 0 && (
              <section>
                <h2 className="text-footnote px-4 pt-1 pb-1.5 font-medium text-label-2">
                  Written tonight, from what you just did
                </h2>
                <ul className="space-y-2.5">
                  {writtenTonight.map((m) => (
                    <li key={m.id}>
                      <WrittenMission
                        mission={m}
                        created={createdFor(m.id)}
                        onAccept={() => acceptMission(m.id)}
                        onDetails={() => setDetail(m)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {allDone ? (
              <EmptyState
                illustration={<FlagIllo />}
                title="All missions complete"
                message="The next one gets written the next time your usage crosses a line."
              />
            ) : (
              <ul className="space-y-2.5">
                {active.map((m) => (
                  <li key={m.id}>
                    <MissionRow
                      mission={m}
                      done={completedMissions.includes(m.id)}
                      created={createdFor(m.id)}
                      onOpen={() => setDetail(m)}
                      onComplete={() => completeMission(m.id)}
                    />
                  </li>
                ))}
              </ul>
            )}

            {/* The same mechanism on a slower clock: these rules crossed
                on the weekly read rather than in front of you. */}
            {suggested.length > 0 && (
              <section>
                <h2 className="text-footnote px-4 pt-1 pb-1.5 font-medium text-label-2">
                  Written when your usage crossed a line this week
                </h2>
                <ul className="space-y-2.5">
                  {suggested.map((m) => (
                    <li key={m.id}>
                      <WrittenMission
                        mission={m}
                        onAccept={() => acceptMission(m.id)}
                        onDetails={() => setDetail(m)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="text-footnote px-1 text-center text-label-3 text-balance">
              Nobody picks these off a list. Every one was written by a rule
              your own usage crossed, measured on this device.
            </p>
          </>
        ) : (
          <>
            <p className="text-footnote px-1 pt-1 text-label-2">
              The only content allowed: proof of life away from the screen.
            </p>

            <ul className="space-y-3">
              {posts.map((post) => {
                const isLiked = liked.includes(post.id);
                const count = post.kudos + (isLiked ? 1 : 0);
                return (
                  <li key={post.id}>
                    <Tile padding="none" className="animate-rise">
                      <div
                        aria-hidden
                        className="flex aspect-[4/3] items-end p-4"
                        style={{ background: sceneStyle[post.scene] }}
                      >
                        <span className="text-footnote rounded-pill bg-ink/45 px-3 py-1.5 font-semibold text-white backdrop-blur-sm">
                          {sceneLabel[post.scene]}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden
                            className={`text-caption grid size-8 shrink-0 place-items-center rounded-pill font-bold ${
                              post.author === "You"
                                ? "bg-accent-deep text-white"
                                : "bg-fill-2 text-label-2"
                            }`}
                          >
                            {post.avatar}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-subhead font-semibold">
                              {post.author}
                              <span className="text-caption ml-2 text-label-3">
                                {post.time}
                              </span>
                            </p>
                            <p className="text-caption truncate font-semibold text-accent-text">
                              {post.mission}
                            </p>
                          </div>
                        </div>

                        <p className="text-subhead mt-2.5">{post.caption}</p>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-caption text-label-3">
                            {post.offline}
                          </span>
                          <Button
                            variant={isLiked ? "tinted" : "gray"}
                            tint="coral"
                            size="small"
                            aria-pressed={isLiked}
                            aria-label={`Give kudos to ${post.author}, ${count} so far`}
                            onPress={() => toggleLiked(post.id)}
                            icon={
                              <IconHeart
                                size={14}
                                fill={isLiked ? "currentColor" : "none"}
                                className={
                                  isLiked ? "scale-110 transition-transform" : ""
                                }
                              />
                            }
                          >
                            {count}
                          </Button>
                        </div>
                      </div>
                    </Tile>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {/* Completing a mission is a commitment — it lives one level in,
          not as a third identical black pill down the screen. */}
      <Sheet
        open={detail !== null}
        onOpenChange={(o) => !o && setDetail(null)}
        detents={[0.72, 0.94]}
        title={detail?.title}
      >
        {detail &&
          (() => {
            const done = completedMissions.includes(detail.id);
            const dotsDone = done ? detail.steps.total : detail.steps.done;

            return (
              <div className="pb-4">
                {/* Carries the row's identity into the sheet — same
                    emoji, same colour — so it reads as the same object
                    opening rather than a generic settings page. */}
                <div className="flex flex-col items-center pt-1 text-center">
                  <span
                    className={`grid size-[72px] place-items-center rounded-[26px] text-[38px] leading-none ${chipTint[detail.tint]}`}
                    aria-hidden
                  >
                    {detail.emoji}
                  </span>
                  <h3 className="text-title-2 mt-3 text-balance">
                    {detail.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                    <span
                      className={`text-caption rounded-pill px-2.5 py-1 font-bold tracking-wide uppercase ${chipTint[detail.tint]}`}
                    >
                      {detail.schedule}
                    </span>
                    <span className="text-caption inline-flex items-center gap-0.5 rounded-pill bg-accent-dim px-2.5 py-1 font-bold text-accent-text">
                      {detail.points}
                      <IconZap size={12} />
                    </span>
                  </div>
                </div>

                {/* What to actually do. It comes before the reasoning
                    because a prescription you can't act on is a slogan. */}
                <div className="mt-5 rounded-tile bg-fill-2 p-4">
                  <p className="text-caption flex items-center gap-1.5 font-bold tracking-wide text-label-2 uppercase">
                    <IconTarget size={13} />
                    What this does
                  </p>
                  <p className="text-subhead mt-1.5 text-balance">
                    {detail.prescription}
                  </p>
                </div>

                {/* The line, what crossed it, and when it was written —
                    the three facts that make this a record rather than
                    a suggestion. Full text; this used to truncate. */}
                <div className="mt-3 rounded-tile bg-fill-2 p-4">
                  <p className="text-caption flex items-center gap-1.5 font-bold tracking-wide text-label-2 uppercase">
                    <IconChart size={13} />
                    Why it exists
                  </p>
                  <p className="text-subhead mt-1.5 text-balance">
                    {detail.why}
                  </p>
                  <dl className="mt-3 space-y-1.5 border-t border-separator pt-3">
                    {[
                      ["Rule", detail.origin.threshold],
                      [
                        "Measured",
                        createdFor(detail.id)?.observed ??
                          detail.origin.observed,
                      ],
                      [
                        "Written",
                        createdFor(detail.id)?.at ?? detail.origin.createdAt,
                      ],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-3">
                        <dt className="text-caption w-[68px] shrink-0 font-bold tracking-wide text-label-3 uppercase">
                          {k}
                        </dt>
                        <dd className="text-caption flex-1 text-balance text-label-2">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {detail.steps.total > 1 && (
                  <div className="mt-3 flex items-center justify-between rounded-tile bg-fill-2 px-4 py-3.5">
                    <span className="text-subhead font-semibold">Progress</span>
                    <span className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5" aria-hidden>
                        {Array.from({ length: detail.steps.total }, (_, i) => (
                          <span
                            key={i}
                            className={`size-3 rounded-pill ${
                              i < dotsDone ? dotTint[detail.tint] : "bg-fill-1"
                            }`}
                          />
                        ))}
                      </span>
                      <span className="text-footnote text-label-2">
                        {dotsDone} of {detail.steps.total}
                      </span>
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3 rounded-tile bg-fill-2 px-4 py-3.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-accent-dim text-accent-text">
                    <IconFlame size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-caption font-bold tracking-wide text-label-2 uppercase">
                      Reward
                    </p>
                    <p className="text-subhead">{detail.reward}</p>
                  </div>
                </div>

                {done ? (
                  <div className="mt-5 rounded-tile bg-card-act px-4 py-5 text-center">
                    <span className="mx-auto grid size-11 place-items-center rounded-pill bg-white/70 text-mint-text">
                      <IconCheck size={24} strokeWidth={3} />
                    </span>
                    <p className="text-headline mt-2.5">Mission complete</p>
                    <p className="text-footnote mt-0.5 text-label-2">
                      Shared to the feed · {detail.points} reclaimed
                    </p>
                  </div>
                ) : (
                  <div className="pt-5">
                    <Button
                      size="large"
                      full
                      icon={<IconCamera size={17} />}
                      onPress={() => {
                        completeMission(detail.id);
                        setDetail(null);
                        setTab("feed");
                      }}
                    >
                      Complete + snap proof
                    </Button>
                    <p className="text-caption mt-2.5 text-center text-label-3">
                      Proof stays on your device unless you share it.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
      </Sheet>
    </>
  );
}
