"use client";

/* Floating pill tab bar. Five items is iOS's iPhone maximum, so no
   "More" tab is needed. Orange replaces systemBlue throughout — a
   correctly-built iOS app in a non-blue tint immediately reads as
   somebody's app rather than a stock template. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { haptic } from "@/lib/haptics";

export type Tab = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  badge?: number;
};

export function TabBar({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-[calc(env(safe-area-inset-bottom)+10px)]"
    >
      <div className="material-bar pointer-events-auto flex items-center gap-0.5 rounded-pill p-1.5 shadow-float ring-1 ring-separator">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              onClick={() => haptic("light")}
              className={`relative flex min-h-[46px] min-w-[58px] flex-col items-center justify-center gap-0.5 rounded-pill px-2 transition-colors duration-200 ${
                active
                  ? "bg-accent-dim text-accent-text"
                  : "text-label-3 hover:text-label-2"
              }`}
            >
              <t.icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] leading-none font-semibold">
                {t.label}
              </span>
              {t.badge ? (
                <span
                  aria-hidden
                  className="absolute top-1 right-1.5 grid min-w-[16px] place-items-center rounded-pill bg-coral-text px-1 text-[10px] leading-[16px] font-bold text-white"
                >
                  {t.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
