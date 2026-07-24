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
  formatMinutes,
  missionRules,
  nudges,
  simApps,
  simClockAt,
  simSession,
  type MissionRule,
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

/* What a mission rule's crossing measured, derived from the line itself
   rather than from the live counter. Two reasons: the record has to
   freeze at the moment it crossed (the counter keeps climbing while you
   sit there), and "Next beat" can force a rule without the signal
   actually being there. */
function crossing(rule: MissionRule) {
  const c = rule.when;
  if (c.kind === "dwell") {
    const minutes = Math.round(c.seconds * FICTION_MINUTES_PER_SECOND);
    return {
      observed: `${formatMinutes(minutes)} unbroken · 0 notifications`,
      at: simClockAt(minutes),
    };
  }
  return {
    observed:
      c.kind === "switches"
        ? `${c.count} app switches in one session`
        : `${c.screens} screens with nothing stopped on`,
    at: simSession.clock,
  };
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
  /** Mission rules whose line you've crossed this session. */
  firedRuleIds: string[];
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
  const {
    pushNudge,
    completeMission,
    acceptMission,
    createMission,
    setAfkOn,
    setDuration,
  } = useAfk();
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

  const firedRuleIds = missionRules
    .filter((r) => met(r.when, signals) || forcedIds.includes(r.id))
    .map((r) => r.id);

  /* A crossed rule doesn't warn you — it writes a mission. Derived the
     same way nudges are, off the signals rather than a stored flag. */
  const liveRule =
    (simActive &&
      missionRules.find(
        (r) => met(r.when, signals) || forcedIds.includes(r.id),
      )) ||
    null;

  const ruleNotice: Nudge | null =
    liveRule && !answeredIds.includes(liveRule.id)
      ? { ...liveRule.notice, evidence: crossing(liveRule).observed }
      : null;

  /* Warnings still outrank the crossing. The hard stop is a modal that
     waits for an answer — letting the mission notice supersede it would
     make it vanish undecided, and the Briefing would have nothing to
     report. So: answer the ladder, *then* get handed the mission.
     Among nudges, later in the array wins, so a higher tier supersedes. */
  const activeNudge: Nudge | null = simActive
    ? (nudges.filter((n) => isLive(n) && !answeredIds.includes(n.id)).pop() ??
      ruleNotice ??
      null)
    : null;

  /* The one write the engine makes on its own. Keyed on the rule id, so
     it runs once per crossing and never on a tick — the mission exists
     because the line was crossed, whether or not you answer the banner. */
  const liveRuleId = liveRule?.id;
  useEffect(() => {
    const rule = missionRules.find((r) => r.id === liveRuleId);
    if (!rule) return;
    const c = crossing(rule);
    createMission({
      missionId: rule.missionId,
      ruleId: rule.id,
      observed: c.observed,
      at: c.at,
    });
  }, [liveRuleId, createMission]);

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

  /* Release the next beat by hand instead of waiting for its condition.
     One press, one beat — the four nudges in order, then the mission
     rule they were all leading up to. */
  const step = useCallback(() => {
    const next = nudges.find((n) => !firedIds.includes(n.id));
    if (next) {
      setForcedIds((p) => [...p, next.id]);
      return;
    }
    const rule = missionRules.find((r) => !forcedIds.includes(r.id));
    if (rule) setForcedIds((p) => [...p, rule.id]);
  }, [firedIds, forcedIds]);

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

      /* A mission notice isn't a nudge you heeded or ignored — the
         mission exists either way. Logging it would put a fake
         "you ignored this" row in tomorrow's Briefing. */
      if (n.kind !== "missionCreated") {
        pushNudge({
          nudgeId: n.id,
          tier: n.tier,
          at: n.evidence,
          outcome,
          missionId: n.missionId,
        });
      }

      if (action.kind === "acceptMission" && n.missionId) {
        acceptMission(n.missionId);
      }

      if (action.kind === "mission" && n.missionId) {
        completeMission(n.missionId);
        setSimActive(false);
      }

      /* Actually leave the feed — you closed the app, so land back on the
         home screen rather than staying in it with a stale banner gone. */
      if (action.kind === "close") {
        setOpenApp(null);
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
    [
      activeNudge,
      pushNudge,
      completeMission,
      acceptMission,
      setAfkOn,
      setDuration,
    ],
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
      firedRuleIds,
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
      firedRuleIds,
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
