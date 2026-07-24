"use client";

/* What AFK noticed, the line it crossed, and the mission that wrote.

   The chain this closes: Lens detects a behaviour → the behaviour
   crosses its rule → the crossing writes a mission → a live nudge fires
   when the behaviour recurs, naming the mission at stake → the Briefing
   reports what you did. This sheet is the hinge — the place where "we
   measured this" becomes "so this got written". */

import { missions, severityTheme, type Behaviour } from "@/lib/data";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { List, Row, RowIcon } from "@/components/ui/list";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconEye,
  IconFlame,
  IconHeart,
  IconMoon,
  IconSun,
  IconTarget,
  IconZap,
} from "@/components/icons";

export const behaviourGlyphs = {
  flame: IconFlame,
  eye: IconEye,
  clock: IconClock,
  moon: IconMoon,
  sun: IconSun,
  heart: IconHeart,
  zap: IconZap,
};

export { behaviourById } from "@/lib/data";

type Props = {
  behaviour: Behaviour | null;
  onOpenChange: (open: boolean) => void;
  /** Take on the mission this behaviour generated. */
  onAccept: (missionId: string) => void;
  accepted: string[];
};

export function BehaviourSheet({
  behaviour,
  onOpenChange,
  onAccept,
  accepted,
}: Props) {
  const b = behaviour;
  // The mission this behaviour produced. Every behaviour has one.
  const mission = b ? missions.find((m) => m.behaviourId === b.id) : undefined;
  const Glyph = b ? behaviourGlyphs[b.icon] : IconEye;
  const isAccepted =
    mission &&
    (mission.status === "active" || accepted.includes(mission.id));

  return (
    <Sheet
      open={b !== null}
      onOpenChange={onOpenChange}
      detents={[0.72]}
      title={b?.name ?? ""}
    >
      {b && (
        <div className="space-y-5 px-4 pb-6">
          <div className="flex items-start gap-3">
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-[14px] ${severityTheme[b.severity].chip}`}
            >
              <Glyph size={22} />
            </span>
            <div className="min-w-0">
              <p
                className={`text-caption inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-bold tracking-wide uppercase ${severityTheme[b.severity].chip}`}
              >
                <IconAlertTriangle size={11} />
                {severityTheme[b.severity].label}
              </p>
              <p className="text-body mt-2 text-balance text-label-2">
                {b.definition}
              </p>
            </div>
          </div>

          {/* The line first, then what crossed it. Reversed, this reads
              as a statistic in search of a lesson. */}
          <List
            header="The rule"
            footer={`Crossed ${b.rule.crossedAt}. Crossing is what writes the mission — nothing here is on a schedule.`}
          >
            <Row
              size="tall"
              wrap
              leading={
                <RowIcon tint="accent">
                  <IconTarget size={16} />
                </RowIcon>
              }
              title={b.rule.threshold}
              subtitle={`Measured over ${b.rule.window}`}
            />
            <Row
              size="tall"
              wrap
              leading={
                <RowIcon tint={b.severity === "high" ? "coral" : "accent"}>
                  <IconAlertTriangle size={16} />
                </RowIcon>
              }
              title={b.rule.observed}
              subtitle="What crossed it"
            />
            <Row
              size="tall"
              wrap
              leading={
                <RowIcon tint="gray">
                  <IconEye size={16} />
                </RowIcon>
              }
              title="How it's detected"
              subtitle={b.signal}
            />
          </List>

          {mission && (
            <section>
              <h2 className="text-footnote px-4 pt-1 pb-1.5 font-medium text-label-2">
                The mission this crossing wrote
              </h2>
              <div className="rounded-group bg-app-surface p-4">
                <p className="text-headline text-balance">{mission.title}</p>
                <p className="text-footnote mt-1.5 text-balance text-label-2">
                  {mission.prescription}
                </p>
                <p className="text-caption mt-2 text-balance text-label-3">
                  {mission.why}
                </p>
                <p className="text-caption mt-3 inline-flex items-center gap-1.5 rounded-pill bg-mint-dim px-2.5 py-1 font-bold text-mint-text">
                  <IconCheck size={11} />
                  {mission.reward}
                </p>

                {isAccepted ? (
                  <p className="text-footnote mt-4 flex items-center gap-1.5 text-mint-text">
                    <IconCheck size={14} />
                    Already on your missions
                  </p>
                ) : (
                  <Button
                    variant="tinted"
                    full
                    className="mt-4"
                    onPress={() => {
                      onAccept(mission.id);
                      onOpenChange(false);
                    }}
                  >
                    Take on this mission
                  </Button>
                )}
              </div>
            </section>
          )}

          <p className="text-footnote px-1 text-center text-label-3 text-balance">
            Detected on this device. AFK never uploads behavioural data.
          </p>
        </div>
      )}
    </Sheet>
  );
}
