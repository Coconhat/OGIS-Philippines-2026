"use client";

/* Lens's "Today" surface: live tracking, and the door into the sim.

   Lens's Week tab is the story after the fact. This is the same
   observation while it's still happening — which is the only time a
   nudge can change anything. */

import { useAfk } from "@/lib/afk-context";
import { useNudge } from "@/lib/nudge-context";
import {
  behaviourById,
  nudges,
  nudgeTierTheme,
  simSession,
  type Nudge,
} from "@/lib/data";
import { Tile } from "@/components/ui/tile";
import { Button } from "@/components/ui/button";
import { List, Row, RowIcon } from "@/components/ui/list";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconEye,
  IconMoon,
} from "@/components/icons";

const glyphs = {
  eye: IconEye,
  clock: IconClock,
  alertTriangle: IconAlertTriangle,
  moon: IconMoon,
};

const outcomeChrome = {
  heeded: { tint: "mint" as const, icon: IconCheck, label: "Heeded" },
  snoozed: { tint: "gray" as const, icon: IconClock, label: "Snoozed" },
  ignored: { tint: "coral" as const, icon: IconAlertTriangle, label: "Ignored" },
};

function NudgeGlyph({ nudge }: { nudge: Nudge }) {
  const G = glyphs[nudge.icon];
  return <G size={16} />;
}

export function SessionTracker() {
  const { nudgeLog } = useAfk();
  const { startSim, firedIds, reduced } = useNudge();

  const fired = nudges.filter((n) => firedIds.includes(n.id));

  return (
    <div className="space-y-5">
      <Tile padding="lg">
        <p className="text-caption inline-flex w-fit items-center gap-1.5 rounded-pill bg-coral-dim px-3 py-1.5 font-bold tracking-widest text-coral-text uppercase">
          <IconEye size={12} />
          Watching today
        </p>
        <p className="text-title-3 mt-4 text-balance">
          AFK tracks how long you stay and how often you hop — and says
          something while it&apos;s still happening.
        </p>
        <p className="text-subhead mt-3 text-label-2">
          {simSession.app} is your most compulsive app. Open a phone, tap it,
          and see what a late-night scroll actually gets you.
        </p>
        <Button
          variant="tinted"
          full
          className="mt-4"
          onPress={startSim}
          icon={<IconClock size={15} />}
        >
          Open the simulated phone
        </Button>
        <p className="text-caption mt-2 text-center text-label-3">
          A home screen, real apps to hop between, and AFK watching. The clock
          only runs while you&apos;re inside an app.
        </p>
      </Tile>

      {/* Under reduced motion the sim never auto-advances, so the copy
          has to be reachable without running it at all. */}
      {(fired.length > 0 || reduced) && (
        <List
          header={fired.length > 0 ? "Nudges so far" : "What AFK would say"}
          footer={
            fired.length > 0
              ? undefined
              : "Every nudge cites the number behind it. No nudge asserts anything it can't point at."
          }
        >
          {(fired.length > 0 ? fired : nudges).map((n) => (
            <Row
              key={n.id}
              size="tall"
              wrap
              leading={
                <RowIcon tint={n.tier >= 3 ? "coral" : n.tier === 2 ? "accent" : "gray"}>
                  <NudgeGlyph nudge={n} />
                </RowIcon>
              }
              title={n.headline}
              subtitle={
                <>
                  {nudgeTierTheme[n.tier].label} · {n.evidence}
                  {behaviourById(n.trigger) && (
                    <span className="mt-0.5 block">
                      Habit: {behaviourById(n.trigger)?.name}
                    </span>
                  )}
                </>
              }
            />
          ))}
        </List>
      )}

      {nudgeLog.length > 0 && (
        <List header="What you did about them">
          {nudgeLog.map((r) => {
            const n = nudges.find((x) => x.id === r.nudgeId);
            const c = outcomeChrome[r.outcome];
            const Icon = c.icon;
            return (
              <Row
                key={r.nudgeId}
                size="tall"
                wrap
                leading={
                  <RowIcon tint={c.tint}>
                    <Icon size={16} />
                  </RowIcon>
                }
                title={n?.headline ?? "Nudge"}
                subtitle={`${c.label} · ${r.at}`}
              />
            );
          })}
        </List>
      )}
    </div>
  );
}
