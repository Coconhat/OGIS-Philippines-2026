"use client";

/* Gives pages a handle on the shell's scroll container, so NavBar can
   observe it for large-title collapse. The document itself no longer
   scrolls — the frame does. */

import { createContext, useContext, type RefObject } from "react";

type DemoShell = {
  scrollRef: RefObject<HTMLElement | null>;
};

export const DemoShellContext = createContext<DemoShell | null>(null);

export function useDemoShell() {
  const ctx = useContext(DemoShellContext);
  if (!ctx) throw new Error("useDemoShell must be used inside the demo layout");
  return ctx;
}
