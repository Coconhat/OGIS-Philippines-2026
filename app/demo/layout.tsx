"use client";

import { usePathname } from "next/navigation";
import { useMemo, useRef, type ReactNode } from "react";
import { AfkProvider, useAfk } from "@/lib/afk-context";
import { NudgeProvider } from "@/lib/nudge-context";
import { DemoShellContext } from "@/lib/demo-shell";
import { briefingDecisions } from "@/lib/data";
import { NudgeHost } from "@/components/demo/nudge-host";
import { PillarSwitch } from "@/components/demo/pillar-switch";
import { ScrollSim } from "@/components/demo/scroll-sim";
import { TabBar, type Tab } from "@/components/ui/tab-bar";
import {
  IconChart,
  IconHome,
  IconInbox,
  IconShield,
  IconTarget,
} from "@/components/icons";

const tabs: Tab[] = [
  { href: "/demo", label: "Home", icon: IconHome },
  { href: "/demo/triage", label: "Triage", icon: IconShield },
  { href: "/demo/lens", label: "Lens", icon: IconChart },
  { href: "/demo/missions", label: "Missions", icon: IconTarget },
  { href: "/demo/briefing", label: "Briefing", icon: IconInbox },
];

/* The iOS in-call/recording treatment: a slim strip above the nav bar
   that only exists while a session is running. An active AFK session
   is exactly that kind of ambient state. */
function SessionStrip() {
  const { afkOn, afkUntil } = useAfk();

  return (
    <div
      className={`material-bar z-40 shrink-0 overflow-hidden transition-[height,opacity] duration-300 ease-ios ${
        afkOn ? "h-7 opacity-100" : "h-0 opacity-0"
      }`}
    >
      <p
        aria-live="polite"
        className="text-caption flex h-7 items-center justify-center gap-1.5 text-accent-text"
      >
        <span className="size-1.5 rounded-pill bg-accent animate-pulse-dot" />
        {afkOn ? `AFK · holding your place until ${afkUntil}` : ""}
      </p>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLElement | null>(null);
  const { decisions } = useAfk();

  const shell = useMemo(() => ({ scrollRef }), []);

  const undecided = briefingDecisions.filter((d) => !decisions[d.id]).length;
  const withBadge = tabs.map((t) =>
    t.href === "/demo/briefing" ? { ...t, badge: undecided } : t,
  );

  return (
    <DemoShellContext.Provider value={shell}>
      <div className="canvas-base relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden pt-[env(safe-area-inset-top)] ring-1 ring-separator">
        <a
          href="#main"
          className="text-footnote sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-app-surface focus:px-3 focus:py-2"
        >
          Skip to content
        </a>

        {/* Sunshine sits on the frame so content scrolls beneath it. */}
        <div
          aria-hidden
          className="sunshine pointer-events-none absolute inset-x-0 top-0 z-0 h-[46%]"
        />

        <SessionStrip />

        <main
          id="main"
          ref={scrollRef}
          className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[104px]"
          style={{ scrollPaddingBottom: 104 }}
        >
          {/* Tab switches cross-dissolve in iOS; they don't slide. */}
          <div key={pathname} className="animate-[fade-in_.18s_ease-out]">
            {children}
          </div>
        </main>

        <TabBar tabs={withBadge} />

        {/* Both sit on the frame, above the tab bar. The banner needs no
            portal — the frame is already relative + overflow-hidden, so
            it slides in from under the notch and clips for free. */}
        <NudgeHost />
        <ScrollSim />
      </div>
    </DemoShellContext.Provider>
  );
}

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <AfkProvider>
      <NudgeProvider>
        {/* The phone, centred, with the Guardian/Companion switch living
            in the margin beside it rather than on top of the screen. */}
        <div className="relative flex h-dvh w-full justify-center">
          <Shell>{children}</Shell>
          <PillarSwitch />
        </div>
      </NudgeProvider>
    </AfkProvider>
  );
}
