"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TriageEvent } from "./data";

type AfkState = {
  afkOn: boolean;
  level: number;
  minutesAfk: number;
  handled: TriageEvent[];
  completedMissions: string[];
  setAfkOn: (on: boolean) => void;
  setLevel: (level: number) => void;
  pushHandled: (ev: TriageEvent) => void;
  completeMission: (id: string) => void;
};

const AfkContext = createContext<AfkState | null>(null);

export function AfkProvider({ children }: { children: ReactNode }) {
  const [afkOn, setAfkOnRaw] = useState(false);
  const [level, setLevel] = useState(2);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [minutesAfk, setMinutesAfk] = useState(0);
  const [handled, setHandled] = useState<TriageEvent[]>([]);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  const setAfkOn = useCallback((on: boolean) => {
    setAfkOnRaw(on);
    setStartedAt(on ? Date.now() : null);
    if (on) setMinutesAfk(0);
  }, []);

  const pushHandled = useCallback((ev: TriageEvent) => {
    setHandled((prev) =>
      prev.some((e) => e.id === ev.id) ? prev : [ev, ...prev],
    );
  }, []);

  const completeMission = useCallback((id: string) => {
    setCompletedMissions((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  }, []);

  useEffect(() => {
    if (startedAt === null) return;
    const id = setInterval(
      () => setMinutesAfk(Math.floor((Date.now() - startedAt) / 60000)),
      30_000,
    );
    return () => clearInterval(id);
  }, [startedAt]);

  const value = useMemo(
    () => ({
      afkOn,
      level,
      minutesAfk,
      handled,
      completedMissions,
      setAfkOn,
      setLevel,
      pushHandled,
      completeMission,
    }),
    [afkOn, level, minutesAfk, handled, completedMissions, setAfkOn, pushHandled, completeMission],
  );

  return <AfkContext.Provider value={value}>{children}</AfkContext.Provider>;
}

export function useAfk() {
  const ctx = useContext(AfkContext);
  if (!ctx) throw new Error("useAfk must be used inside AfkProvider");
  return ctx;
}
