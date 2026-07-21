"use client";

/* One mission, as a checkable row.

   Shared by the Missions list and Home's "Today" card so the two can't
   drift apart — they're the same object, so they should look identical.

   The body and the checkbox are siblings, not nested: a check button
   inside a tappable card would be invalid HTML and would break keyboard
   order. */

import { behaviourById, type Mission } from "@/lib/data";
import { Pressable } from "@/components/ui/pressable";
import { IconCheck, IconZap } from "@/components/icons";

export type MissionTint = "sky" | "coral" | "accent" | "mint";

export const chipTint: Record<MissionTint, string> = {
  sky: "bg-sky-dim text-sky-text",
  coral: "bg-coral-dim text-coral-text",
  accent: "bg-accent-dim text-accent-text",
  mint: "bg-mint-dim text-mint-text",
};

export const dotTint: Record<MissionTint, string> = {
  sky: "bg-sky",
  coral: "bg-coral",
  accent: "bg-accent",
  mint: "bg-mint",
};

export const labelTint: Record<MissionTint, string> = {
  sky: "text-sky-text",
  coral: "text-coral-text",
  accent: "text-accent-text",
  mint: "text-mint-text",
};

type MissionRowProps = {
  mission: Mission;
  done: boolean;
  /** Optional so display-only renders (the capture harness) can omit it. */
  onComplete?: () => void;
  /** Either open a sheet in place, or navigate to the Missions tab. */
  onOpen?: () => void;
  href?: string;
};

export function MissionRow({
  mission: m,
  done,
  onComplete,
  onOpen,
  href,
}: MissionRowProps) {
  const dotsDone = done ? m.steps.total : m.steps.done;

  return (
    <div
      className={`flex items-center gap-3 rounded-tile bg-app-surface pr-3 transition-opacity duration-300 ${
        done ? "opacity-70" : ""
      }`}
    >
      <Pressable
        href={href}
        onPress={onOpen}
        highlight="fill"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-tile py-3 pl-3 text-left"
        aria-label={`${m.title}. ${m.schedule}. Open details.`}
      >
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-pill text-[26px] leading-none ${chipTint[m.tint]}`}
          aria-hidden
        >
          {m.emoji}
        </span>

        <span className="min-w-0 flex-1">
          {/* Schedule *and* the habit this treats — a mission with no
              visible cause reads as a generic self-help tip, which is
              exactly what these are not. */}
          <span
            className={`text-caption block font-bold tracking-wide uppercase ${labelTint[m.tint]}`}
          >
            {m.schedule}
            {behaviourById(m.behaviourId) && (
              <span className="font-semibold normal-case opacity-70">
                {" · "}
                {behaviourById(m.behaviourId)?.name}
              </span>
            )}
          </span>
          <span
            className={`text-headline block text-balance ${
              done ? "line-through" : ""
            }`}
          >
            {m.title}
          </span>

          <span className="mt-1 flex items-center gap-2">
            {m.steps.total > 1 && (
              <span className="flex items-center gap-1" aria-hidden>
                {Array.from({ length: m.steps.total }, (_, i) => (
                  <span
                    key={i}
                    className={`size-2 rounded-pill ${
                      i < dotsDone ? dotTint[m.tint] : "bg-fill-1"
                    }`}
                  />
                ))}
              </span>
            )}
            <span className="text-footnote text-label-2">
              {done
                ? "Done · shared to feed"
                : m.steps.total > 1
                  ? `${m.steps.done} of ${m.steps.total}`
                  : m.goal}
            </span>
            <span className="text-footnote inline-flex items-center gap-0.5 font-bold text-accent-text">
              {m.points}
              <IconZap size={12} />
            </span>
          </span>
        </span>
      </Pressable>

      {/* The satisfying bit. */}
      <Pressable
        onPress={() => !done && onComplete?.()}
        highlight="scale"
        haptics="medium"
        disabled={done}
        role="checkbox"
        aria-checked={done}
        aria-label={`Mark "${m.title}" complete`}
        className={`grid size-11 shrink-0 place-items-center rounded-[14px] transition-colors duration-200 ${
          done
            ? "bg-mint text-white"
            : "bg-fill-2 text-label-3 hover:bg-fill-1"
        }`}
      >
        <IconCheck size={22} strokeWidth={3} />
      </Pressable>
    </div>
  );
}
