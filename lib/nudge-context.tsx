"use client";

/* The behavioural engine — scripted, like everything else in the demo.

   Deliberately NOT part of AfkProvider. This ticks once a second, and
   AfkProvider serializes its whole state to sessionStorage on every
   change (afk-context.tsx) — so a live counter in there would mean a
   JSON.stringify + storage write every second, plus a re-render of every
   consumer on all five tabs. Only the outcomes cross over, via
   `pushNudge`, at the cadence of an actual decision. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAfk } from "./afk-context";
import { useReducedMotion } from "./use-reduced-motion";
import {
  nudges,
  simApps,
  type Nudge,
  type NudgeAction,
  type NudgeCondition,
} from "./data";

const TICK_MS = 1000;
// The fiction clock runs faster than the demo clock, so "26 minutes"
// arrives in a demo-sized amount of real time.
const FICTION_MINUTES_PER_SECOND = 8 / 12;

const feedAppId = simApps.find((a) => a.feed)?.id ?? "shortreel";

type Signals = { dwell: number; switches: number; scroll: number };

/* Nudges fire off what you actually did, not off a stopwatch. Firing on
   elapsed time alone was the bug: nothing you did in the sim caused
   anything, so the only way to see a nudge was to press "next beat" —
   which proves nothing about behavioural tracking. */
function met(c: NudgeCondition, s: Signals) {
  switch (c.kind) {
    case "dwell":
      return s.dwell >= c.seconds;
    case "switches":
      return s.switches >= c.count;
    case "scroll":
      return s.scroll >= c.screens;
  }
}

type NudgeState = {
  simActive: boolean;
  paused: boolean;
  /** Seconds spent inside the feed app. */
  dwell: number;
  /** Fiction minutes inside the app, for display. */
  minutesInApp: number;
  switches: number;
  /** Screenfuls scrolled in the feed. */
  scroll: number;
  activeNudge: Nudge | null;
  firedIds: string[];
  reduced: boolean;
  /** Which app is in the foreground; null means the home screen. */
  openApp: string | null;
  startSim: () => void;
  endSim: () => void;
  openAppById: (id: string) => void;
  goHome: () => void;
  /** Called by the feed on scroll, in screenfuls. */
  registerScroll: (screens: number) => void;
  togglePause: () => void;
  /** Advance to the next scripted beat by hand. The only advance
      mechanism under reduced motion; also a WCAG 2.2.2 control. */
  step: () => void;
  resolveNudge: (action: NudgeAction) => void;
  dismissNudge: () => void;
};

const NudgeContext = createContext<NudgeState | null>(null);

export function NudgeProvider({ children }: { children: ReactNode }) {
  const { pushNudge, completeMission, setAfkOn, setDuration } = useAfk();
  const reduced = useReducedMotion();

  const [simActive, setSimActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dwell, setDwell] = useState(0);
  const [scroll, setScroll] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  /* Nudges the "Next beat" control released by hand, for reduced motion
     and for demoing without waiting out the real thresholds. */
  const [forcedIds, setForcedIds] = useState<string[]>([]);
  const [openApp, setOpenApp] = useState<string | null>(null);
  /* Every app opened this session, in order. Switches are derived from
     it, so the churn count can never drift from what you actually did. */
  const [opened, setOpened] = useState<string[]>([]);

  const inFeed = openApp === feedAppId;

  useEffect(() => {
    /* Dwell only accrues inside the feed. Standing on the home screen,
       or sitting in Maps, is not the behaviour being measured.
       Reduced motion: no timer at all — "Next beat" is the only advance. */
    if (!simActive || !inFeed || paused || reduced) return;
    const id = setInterval(() => setDwell((p) => p + TICK_MS / 1000), TICK_MS);
    return () => clearInterval(id);
  }, [simActive, inFeed, paused, reduced]);

  const switches = Math.max(0, opened.length - 1);
  const signals: Signals = { dwell, switches, scroll };

  /* Which nudge is showing is *derived* from the signals, not stored and
     synced. Storing it meant an effect that setState'd on every tick — a
     cascading render, and the lint rule that caught it was right. */
  const isLive = (n: Nudge) => met(n.when, signals) || forcedIds.includes(n.id);

  const firedIds = nudges.filter(isLive).map((n) => n.id);

  // Later in the array wins, so a higher tier supersedes a lower one.
  const activeNudge: Nudge | null = simActive
    ? (nudges.filter((n) => isLive(n) && !answeredIds.includes(n.id)).pop() ??
      null)
    : null;

  // You always start on the home screen, the way you actually do.
  const startSim = useCallback(() => {
    setSimActive(true);
    setPaused(false);
    setDwell(0);
    setScroll(0);
    setAnsweredIds([]);
    setForcedIds([]);
    setOpenApp(null);
    setOpened([]);
  }, []);

  const endSim = useCallback(() => {
    setSimActive(false);
    setPaused(false);
    setOpenApp(null);
  }, []);

  const openAppById = useCallback((id: string) => {
    setOpenApp(id);
    setOpened((p) => [...p, id]);
  }, []);

  const goHome = useCallback(() => setOpenApp(null), []);

  /* Scroll depth is monotonic — scrolling back up doesn't buy back the
     screenfuls you already went through. */
  const registerScroll = useCallback(
    (screens: number) => setScroll((p) => Math.max(p, screens)),
    [],
  );

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  /* Release the next nudge by hand instead of waiting for its condition.
     One press, one nudge. */
  const step = useCallback(() => {
    const next = nudges.find((n) => !firedIds.includes(n.id));
    if (next) setForcedIds((p) => [...p, next.id]);
  }, [firedIds]);

  /* Dismissing without choosing still takes it off screen — it just
     doesn't reach the briefing, because you didn't decide anything. */
  const dismissNudge = useCallback(() => {
    if (activeNudge) setAnsweredIds((p) => [...p, activeNudge.id]);
  }, [activeNudge]);

  const resolveNudge = useCallback(
    (action: NudgeAction) => {
      const n = activeNudge;
      if (!n) return;

      const outcome =
        action.kind === "snooze"
          ? "snoozed"
          : action.kind === "dismiss"
            ? "ignored"
            : "heeded";

      pushNudge({
        nudgeId: n.id,
        tier: n.tier,
        at: n.evidence,
        outcome,
        missionId: n.missionId,
      });

      if (action.kind === "mission" && n.missionId) {
        completeMission(n.missionId);
        setSimActive(false);
      }

      /* The payoff CTA wires into the product's existing front door
         rather than inventing a parallel one. */
      if (action.kind === "goAfk") {
        setDuration("tomorrow");
        setAfkOn(true);
        setSimActive(false);
      }

      setAnsweredIds((p) => [...p, n.id]);
    },
    [activeNudge, pushNudge, completeMission, setAfkOn, setDuration],
  );

  const value = useMemo<NudgeState>(
    () => ({
      simActive,
      paused,
      dwell,
      minutesInApp: Math.round(dwell * FICTION_MINUTES_PER_SECOND),
      switches,
      scroll,
      activeNudge,
      firedIds,
      reduced,
      openApp,
      startSim,
      endSim,
      openAppById,
      goHome,
      registerScroll,
      togglePause,
      step,
      resolveNudge,
      dismissNudge,
    }),
    [
      simActive,
      paused,
      dwell,
      switches,
      scroll,
      activeNudge,
      firedIds,
      reduced,
      openApp,
      startSim,
      endSim,
      openAppById,
      goHome,
      registerScroll,
      togglePause,
      step,
      resolveNudge,
      dismissNudge,
    ],
  );

  return (
    <NudgeContext.Provider value={value}>{children}</NudgeContext.Provider>
  );
}

export function useNudge() {
  const ctx = useContext(NudgeContext);
  if (!ctx) throw new Error("useNudge must be used inside NudgeProvider");
  return ctx;
}
