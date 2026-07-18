"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AfkProvider, useAfk } from "@/lib/afk-context";
import {
  IconChart,
  IconHome,
  IconInbox,
  IconMoon,
  IconShield,
  IconTarget,
  IconX,
} from "@/components/icons";

const tabs = [
  { href: "/demo", label: "Home", icon: IconHome },
  { href: "/demo/triage", label: "Triage", icon: IconShield },
  { href: "/demo/lens", label: "Lens", icon: IconChart },
  { href: "/demo/missions", label: "Missions", icon: IconTarget },
  { href: "/demo/briefing", label: "Briefing", icon: IconInbox },
];

function StatusBar() {
  const { afkOn } = useAfk();
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-canvas/90 px-5 pt-[calc(env(safe-area-inset-top)+10px)] pb-2.5 backdrop-blur">
      <Link
        href="/"
        aria-label="Exit demo, back to landing page"
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink-soft transition-colors hover:text-ink"
      >
        <IconX size={13} />
        Exit demo
      </Link>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold transition-colors duration-300 ${
          afkOn ? "wallpaper text-white shadow-card" : "bg-surface border border-line text-ink-faint"
        }`}
      >
        <IconMoon size={12} />
        {afkOn ? "AFK · holding your place" : "Online"}
      </span>
    </div>
  );
}

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-line bg-surface/95 pb-[calc(env(safe-area-inset-bottom)+6px)] backdrop-blur">
      <div className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold transition-colors duration-200 ${
                active ? "text-accent-deep" : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              <t.icon size={21} strokeWidth={active ? 2.4 : 2} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <AfkProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-canvas shadow-[0_0_0_1px_var(--color-line)]">
        <StatusBar />
        <main className="flex-1 px-5 pt-5 pb-28">{children}</main>
        <BottomNav />
      </div>
    </AfkProvider>
  );
}
