"use client";

/* Grouped inset list — for genuinely list-shaped content (settings,
   key-value detail). Tiles carry the main surfaces; this is the
   supporting cast. Separators inset to align with the row's text,
   which is the detail that makes a list read as iOS. */

import type { ReactNode } from "react";
import { IconChevronDown } from "@/components/icons";
import { Pressable } from "./pressable";

type ListProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  tint?: "none" | "accent" | "coral" | "mint";
  className?: string;
};

const tints = {
  none: "bg-app-surface",
  accent: "bg-accent-dim",
  coral: "bg-coral-dim",
  mint: "bg-mint-dim",
};

export function List({
  children,
  header,
  footer,
  tint = "none",
  className = "",
}: ListProps) {
  return (
    <section className={className}>
      {header && (
        <h2 className="text-footnote px-4 pt-5 pb-1.5 font-medium text-label-2">
          {header}
        </h2>
      )}
      <div className={`list-rows rounded-group overflow-hidden ${tints[tint]}`}>
        {children}
      </div>
      {footer && (
        <p className="text-footnote px-4 pt-2 font-medium text-label-2">
          {footer}
        </p>
      )}
    </section>
  );
}

type RowProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned secondary value. */
  value?: ReactNode;
  leading?: ReactNode;
  accessory?: "chevron" | "none" | ReactNode;
  href?: string;
  onPress?: () => void;
  destructive?: boolean;
  size?: "regular" | "tall";
  /** Let the title wrap instead of truncating — for prose, not labels. */
  wrap?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Row({
  title,
  subtitle,
  value,
  leading,
  accessory = "none",
  href,
  onPress,
  destructive = false,
  size = "regular",
  wrap = false,
  className = "",
  ...aria
}: RowProps) {
  // Separator starts after the leading icon when there is one.
  const inset = leading ? "60px" : "16px";

  const body = (
    <div
      className="row-body relative flex w-full items-center gap-3 px-4"
      style={
        {
          "--sep-inset": inset,
          minHeight: size === "tall" ? 60 : 44,
          paddingTop: 11,
          paddingBottom: 11,
        } as React.CSSProperties
      }
    >
      {leading}
      <div className="min-w-0 flex-1">
        <p
          className={`text-body ${wrap ? "text-balance" : "truncate"} ${
            destructive ? "text-coral-text" : "text-label"
          }`}
        >
          {title}
        </p>
        {subtitle && (
          <div className="text-footnote mt-0.5 text-label-2">{subtitle}</div>
        )}
      </div>
      {value && (
        <span className="text-body shrink-0 text-label-2">{value}</span>
      )}
      {accessory === "chevron" ? (
        <IconChevronDown
          size={15}
          strokeWidth={2.6}
          className="shrink-0 -rotate-90 text-label-3"
        />
      ) : accessory !== "none" ? (
        <span className="shrink-0">{accessory}</span>
      ) : null}
    </div>
  );

  if (href || onPress) {
    return (
      <Pressable
        href={href}
        onPress={onPress}
        highlight="fill"
        /* text-left is load-bearing: a <button> centres its text by
           default, which silently centred every tappable row. */
        className={`block w-full text-left ${className}`}
        {...aria}
      >
        {body}
      </Pressable>
    );
  }

  return <div className={className}>{body}</div>;
}

type RowIconProps = {
  children: ReactNode;
  tint?: "accent" | "coral" | "mint" | "sky" | "gray";
};

const iconTints = {
  accent: "bg-accent-dim text-accent-text",
  coral: "bg-coral-dim text-coral-text",
  mint: "bg-mint-dim text-mint-text",
  sky: "bg-sky-dim text-sky-text",
  gray: "bg-fill-2 text-label-2",
};

export function RowIcon({ children, tint = "accent" }: RowIconProps) {
  return (
    <span
      className={`grid size-[29px] shrink-0 place-items-center rounded-[8px] ${iconTints[tint]}`}
    >
      {children}
    </span>
  );
}
