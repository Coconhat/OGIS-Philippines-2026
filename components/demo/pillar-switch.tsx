"use client";

/* The switch between AFK's two halves.

     Guardian   the AFK app itself — what comes in
     Companion  the simulated phone — what you reach for

   Companion isn't a screen inside AFK; it's AFK watching you use a
   *different* app, so entering it means leaving the app entirely (the
   ScrollSim overlay). That's why it's a control on the side rather than
   a sixth tab.

   It lives in the margin *beside* the phone, not on top of the screen —
   so it never covers the UI it's switching between. On screens too
   narrow to have a margin (phones) it falls back to floating over the
   bottom-right, above the sim (z over the overlay) so you can still get
   back. A segmented control, iOS-style: one track, a white thumb on the
   active side. */

import { useNudge } from "@/lib/nudge-context";
import { Pressable } from "@/components/ui/pressable";
import { IconEye, IconShield } from "@/components/icons";

function Segment({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      highlight="opacity"
      haptics="light"
      aria-pressed={active}
      className={`flex min-h-[36px] items-center gap-1.5 rounded-pill px-3 text-left transition-colors duration-200 ${
        active
          ? "bg-app-surface text-label shadow-[0_1px_3px_rgb(0_0_0/0.14)]"
          : "text-label-2"
      }`}
    >
      <span className={active ? "text-accent-text" : "text-label-3"}>
        {icon}
      </span>
      <span className="text-footnote font-bold">{label}</span>
    </Pressable>
  );
}

export function PillarSwitch() {
  const { simActive, startSim, endSim } = useNudge();

  return (
    <div
      role="group"
      aria-label="Which half of AFK to show"
      /* lg+: parked in the right-hand margin beside the 430px phone
         column (215px half-width + a 16px gap), aligned to the bottom.
         Below lg there's no margin, so it floats bottom-right over the
         phone — z above the sim (z-50) so Companion → Guardian works. */
      className="absolute right-3 bottom-[calc(env(safe-area-inset-bottom)+134px)] z-[60] flex items-center gap-0.5 rounded-pill bg-app-surface p-1 shadow-[0_6px_20px_rgb(23_23_23/0.14)] ring-1 ring-black/[0.06] lg:right-auto lg:bottom-6 lg:left-[calc(50%+231px)]"
    >
      <Segment
        active={!simActive}
        label="Guardian"
        icon={<IconShield size={15} />}
        onPress={endSim}
      />
      <Segment
        active={simActive}
        label="Companion"
        icon={<IconEye size={15} />}
        onPress={startSim}
      />
    </div>
  );
}
