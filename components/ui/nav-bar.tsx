"use client";

/* Large-title nav bar with collapse-on-scroll.
   Rendered at the top of a page's scroll content: the compact bar
   sticks, the large title scrolls up underneath it, and a sentinel
   just below the large title flips the collapsed state.
   iOS does not scale the large title — it just scrolls away, and only
   the inline title animates. */

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

type NavBarProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** The scroll container this bar lives in. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Extra content pinned under the bar (e.g. a segmented control). */
  pinned?: ReactNode;
};

export function NavBar({
  title,
  subtitle,
  leading,
  trailing,
  scrollRef,
  pinned,
}: NavBarProps) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      { root: scrollRef?.current ?? null, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRef]);

  return (
    <>
      <div
        className={`sticky top-0 z-30 transition-shadow duration-200 ${
          collapsed ? "material-bar hairline-b" : ""
        }`}
      >
        <div className="flex min-h-[44px] items-center gap-2 px-4">
          <div className="flex min-w-0 flex-1 justify-start">{leading}</div>
          <h1
            aria-hidden={!collapsed}
            className={`text-headline truncate text-center transition-all duration-200 ${
              collapsed
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            {title}
          </h1>
          <div className="flex min-w-0 flex-1 justify-end">{trailing}</div>
        </div>
        {pinned && <div className="px-4 pb-2">{pinned}</div>}
      </div>

      <div className="px-4 pt-1.5 pb-2">
        <h1 className="text-large-title text-balance">{title}</h1>
        {subtitle && (
          <p className="text-subhead mt-0.5 text-label-2">{subtitle}</p>
        )}
      </div>
      <div ref={sentinel} aria-hidden className="h-px" />
    </>
  );
}
