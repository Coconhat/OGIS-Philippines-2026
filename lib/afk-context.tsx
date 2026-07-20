"use client";

/* Demo state, lifted out of the page components.
   Everything here used to live in useState inside individual pages,
   which meant the App Router unmounted it on every tab change —
   approving the Burnout Guardian and navigating away silently
   reverted it. Persisted to sessionStorage so a reload mid-demo
   doesn't wipe the run. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMounted } from "./use-mounted";
import {
  asLevelId,
  breakthroughContacts,
  durations,
  type LevelId,
  type ResolvedEvent,
} from "./data";

export type GuardianState = "pending" | "approved" | "dismissed";

type Persisted = {
  afkOn: boolean;
  level: LevelId;
  /** The rung the current (or most recent) session actually ran at. */
  sessionLevel: LevelId | null;
  duration: string;
  breakthrough: Record<string, boolean>;
  startedAt: number | null;
  handled: ResolvedEvent[];
  completedMissions: string[];
  guardian: GuardianState;
  decisions: Record<string, string>;
  undone: string[];
  liked: string[];
  everWentAfk: boolean;
};

const initial: Persisted = {
  afkOn: false,
  level: 2,
  sessionLevel: null,
  duration: "until7",
  breakthrough: Object.fromEntries(
    breakthroughContacts.map((c) => [c.id, c.on]),
  ),
  startedAt: null,
  handled: [],
  completedMissions: [],
  guardian: "pending",
  decisions: {},
  undone: [],
  liked: [],
  everWentAfk: false,
};

/* v2: `handled` changed shape (flat TriageEvent → ResolvedEvent). A stale
   v1 blob would hydrate rows with no `level` and no resolved outcome, so
   the key bump discards them rather than half-migrating. */
const KEY = "afk-demo-v2";

function readSession(): Persisted | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return { ...initial, ...(JSON.parse(raw) as Partial<Persisted>) };
  } catch {
    return null;
  }
}

type AfkState = Persisted & {
  minutesAfk: number;
  /** Derived from `duration` — e.g. "7:00pm". */
  afkUntil: string;
  setAfkOn: (on: boolean) => void;
  setLevel: (level: number) => void;
  setDuration: (id: string) => void;
  toggleBreakthrough: (id: string) => void;
  pushHandled: (ev: ResolvedEvent) => void;
  completeMission: (id: string) => void;
  setGuardian: (state: GuardianState) => void;
  setDecision: (id: string, outcome: string) => void;
  toggleUndone: (id: string) => void;
  toggleLiked: (id: string) => void;
  resetDemo: () => void;
};

const AfkContext = createContext<AfkState | null>(null);

export function AfkProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(initial);
  const [minutesAfk, setMinutesAfk] = useState(0);

  // Hydrate from sessionStorage on the first client render. Adjusting
  // state during render (rather than in an effect) keeps the server
  // markup and the first client render identical, so there's no
  // hydration mismatch and no cascading re-render.
  const mounted = useMounted();
  const [hydrated, setHydrated] = useState(false);
  if (mounted && !hydrated) {
    setHydrated(true);
    const saved = readSession();
    if (saved) setState(saved);
  }

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Private mode / quota — the demo still works, it just won't persist.
    }
  }, [state, hydrated]);

  const patch = useCallback(
    (next: Partial<Persisted> | ((p: Persisted) => Partial<Persisted>)) =>
      setState((p) => ({ ...p, ...(typeof next === "function" ? next(p) : next) })),
    [],
  );

  const setAfkOn = useCallback(
    (on: boolean) => {
      patch((p) => ({
        afkOn: on,
        startedAt: on ? Date.now() : null,
        // Sticky once set — the briefing uses it to decide between the
        // real digest and its "nothing to report yet" empty state.
        everWentAfk: p.everWentAfk || on,
        // Freeze the rung this run happens at. Moving the dial later must
        // not retroactively rewrite what AFK already did.
        sessionLevel: on ? p.level : p.sessionLevel,
        // A fresh run starts empty, so a session at Act can't inherit
        // rows from an earlier one at Observe.
        ...(on ? { handled: [] } : {}),
      }));
      if (on) setMinutesAfk(0);
    },
    [patch],
  );

  const setLevel = useCallback(
    (level: number) => patch({ level: asLevelId(level) }),
    [patch],
  );

  const setDuration = useCallback(
    (duration: string) => patch({ duration }),
    [patch],
  );

  const toggleBreakthrough = useCallback(
    (id: string) =>
      patch((p) => ({
        breakthrough: { ...p.breakthrough, [id]: !p.breakthrough[id] },
      })),
    [patch],
  );

  const pushHandled = useCallback(
    (ev: ResolvedEvent) =>
      patch((p) =>
        p.handled.some((e) => e.id === ev.id)
          ? {}
          : { handled: [ev, ...p.handled] },
      ),
    [patch],
  );

  const completeMission = useCallback(
    (id: string) =>
      patch((p) =>
        p.completedMissions.includes(id)
          ? {}
          : { completedMissions: [...p.completedMissions, id] },
      ),
    [patch],
  );

  const setGuardian = useCallback(
    (guardian: GuardianState) => patch({ guardian }),
    [patch],
  );

  const setDecision = useCallback(
    (id: string, outcome: string) =>
      patch((p) => ({ decisions: { ...p.decisions, [id]: outcome } })),
    [patch],
  );

  const toggleUndone = useCallback(
    (id: string) =>
      patch((p) => ({
        undone: p.undone.includes(id)
          ? p.undone.filter((x) => x !== id)
          : [...p.undone, id],
      })),
    [patch],
  );

  // Was irreversible: the old page-local version kept the button lit
  // forever because it tested `id in kudos` rather than a real flag.
  const toggleLiked = useCallback(
    (id: string) =>
      patch((p) => ({
        liked: p.liked.includes(id)
          ? p.liked.filter((x) => x !== id)
          : [...p.liked, id],
      })),
    [patch],
  );

  const resetDemo = useCallback(() => {
    setState(initial);
    setMinutesAfk(0);
  }, []);

  const { startedAt } = state;
  useEffect(() => {
    if (startedAt === null) return;
    const id = setInterval(
      () => setMinutesAfk(Math.floor((Date.now() - startedAt) / 60000)),
      30_000,
    );
    return () => clearInterval(id);
  }, [startedAt]);

  const value = useMemo<AfkState>(
    () => ({
      ...state,
      minutesAfk,
      afkUntil:
        durations.find((d) => d.id === state.duration)?.until ?? "7:00pm",
      setAfkOn,
      setLevel,
      setDuration,
      toggleBreakthrough,
      pushHandled,
      completeMission,
      setGuardian,
      setDecision,
      toggleUndone,
      toggleLiked,
      resetDemo,
    }),
    [
      state,
      minutesAfk,
      setAfkOn,
      setLevel,
      setDuration,
      toggleBreakthrough,
      pushHandled,
      completeMission,
      setGuardian,
      setDecision,
      toggleUndone,
      toggleLiked,
      resetDemo,
    ],
  );

  return <AfkContext.Provider value={value}>{children}</AfkContext.Provider>;
}

export function useAfk() {
  const ctx = useContext(AfkContext);
  if (!ctx) throw new Error("useAfk must be used inside AfkProvider");
  return ctx;
}
