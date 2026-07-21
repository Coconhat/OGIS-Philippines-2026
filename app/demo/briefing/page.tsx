"use client";

import { useState } from "react";
import { useAfk } from "@/lib/afk-context";
import { useDemoShell } from "@/lib/demo-shell";
import {
  briefingDecisions,
  briefingHandled,
  emailClusters,
  missions,
  nudges,
  verdictTheme,
  type Verdict,
} from "@/lib/data";
import { Doorkeeper } from "@/components/afk/doorkeeper";
import { SpeechBubble } from "@/components/afk/speech-bubble";
import { NavBar } from "@/components/ui/nav-bar";
import { Button } from "@/components/ui/button";
import { Tile } from "@/components/ui/tile";
import { List, Row, RowIcon } from "@/components/ui/list";
import { Sheet } from "@/components/ui/sheet";
import { Alert } from "@/components/ui/alert";
import { SwipeRow } from "@/components/ui/swipe-row";
import { SummaryBoard } from "@/components/ui/summary-board";
import { EmptyState } from "@/components/ui/empty-state";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { InboxIllo } from "@/components/illustrations";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconInbox,
  IconLock,
  IconUndo,
} from "@/components/icons";

/* Triage guards what came in; this guards what you reached for. The
   outcome is the point — the nudge you waved away at 11:26pm is still
   here in the morning, next to the mission it cost. */
const nudgeOutcome = {
  heeded: { tint: "mint" as const, icon: IconCheck, label: "You stopped" },
  snoozed: { tint: "gray" as const, icon: IconClock, label: "You snoozed it" },
  ignored: {
    tint: "coral" as const,
    icon: IconAlertTriangle,
    label: "You kept going",
  },
};

type HandledRow = {
  id: string;
  who: string;
  what: string;
  verdict: Verdict;
};

export default function BriefingPage() {
  const { scrollRef } = useDemoShell();
  const {
    handled,
    minutesAfk,
    everWentAfk,
    decisions,
    setDecision,
    undone,
    toggleUndone,
    sessionLevel,
    nudgeLog,
  } = useAfk();

  const [mailOpen, setMailOpen] = useState(false);
  const [deciding, setDeciding] = useState<(typeof briefingDecisions)[0] | null>(
    null,
  );

  /* Live triage results, minus the escalation (that one reached you),
     merged ahead of the seeded log. Joined on sourceId — the old
     version matched on name prefixes, which broke on senders whose
     name contained a middle dot. */
  const live: HandledRow[] = handled
    .filter((ev) => ev.verdict !== "escalate")
    .map((ev) => ({
      id: `live-${ev.id}`,
      who: `${ev.sender} · ${ev.channel}`,
      what: ev.aiAction,
      verdict: ev.verdict,
    }));

  const seenIds = new Set(handled.map((ev) => ev.id));
  const seeded: HandledRow[] = briefingHandled.filter(
    (b) => !seenIds.has(b.sourceId),
  );
  const rows = [...live, ...seeded];

  const suppressed = emailClusters.reduce((n, c) => n + c.count, 0);
  const undecided = briefingDecisions.filter((d) => !decisions[d.id]).length;

  const away =
    minutesAfk > 0
      ? `${Math.floor(minutesAfk / 60)}h ${minutesAfk % 60}m`
      : "3h 12m";

  // Before the first session there is genuinely nothing to report.
  if (!everWentAfk) {
    return (
      <>
        <NavBar title="Briefing" scrollRef={scrollRef} />
        <EmptyState
          illustration={<InboxIllo />}
          title="Nothing to report yet"
          message="Go AFK, and this is where your return digest lands — everything that was handled, and the few things that genuinely need you."
          action={<Button href="/demo">Go to Home</Button>}
        />
      </>
    );
  }

  return (
    <>
      <NavBar
        title="Welcome back"
        subtitle={`You were AFK for ${away}. Here's your 20-second digest.`}
        scrollRef={scrollRef}
      />

      <div className="space-y-5 px-4 pb-6">
        <div className="flex flex-col items-center gap-3 pt-1">
          <SpeechBubble signature="— your AFK assistant">
            I held {suppressed + rows.length} things while you were out.{" "}
            {undecided > 0
              ? `${undecided} need${undecided === 1 ? "s" : ""} you.`
              : "You're all caught up."}
          </SpeechBubble>
          <Doorkeeper state="pleased" size={104} />
        </div>

        <SummaryBoard
          items={[
            {
              value: String(rows.length),
              label: "handled for you",
              readAs: `${rows.length} handled for you`,
            },
            {
              value: String(suppressed),
              label: "held back quietly",
              readAs: `${suppressed} held back quietly`,
            },
            {
              value: String(undecided),
              label: "need a decision",
              readAs: `${undecided} need a decision`,
              prominent: true,
            },
          ]}
        />

        <List
          header="Genuinely needs you"
          footer={
            /* At full autonomy the ceiling is the point worth making —
               it held even when you'd handed over everything else. */
            sessionLevel === 3
              ? "You ran AFK at full autonomy today. It still didn't sign, spend, or promise anything — that ceiling doesn't move."
              : "AFK never decides these for you — no money, no legal, no new commitments."
          }
        >
          {briefingDecisions.map((d) => {
            const outcome = decisions[d.id];
            return outcome ? (
              <Row
                key={d.id}
                leading={
                  <RowIcon tint="mint">
                    <IconCheck size={16} strokeWidth={3} />
                  </RowIcon>
                }
                title={d.who}
                subtitle={outcome}
              />
            ) : (
              <Row
                key={d.id}
                size="tall"
                title={d.who}
                subtitle={d.what}
                accessory={
                  <Button
                    variant="tinted"
                    size="small"
                    onPress={() => setDeciding(d)}
                  >
                    Decide
                  </Button>
                }
              />
            );
          })}
        </List>

        {/* Verdict tones match Triage, so the two screens rhyme. */}
        <section>
          <h2 className="text-footnote px-4 pt-1 pb-1.5 font-medium text-label-2">
            Handled while you were away
          </h2>
          <ul className="space-y-2.5">
            {rows.map((row) => {
              const isUndone = undone.includes(row.id);
              return (
                <li key={row.id}>
                  <SwipeRow
                    actions={[
                      {
                        label: isUndone ? "Redo" : "Undo",
                        tone: "coral",
                        icon: <IconUndo size={15} />,
                        onPress: () => toggleUndone(row.id),
                      },
                    ]}
                  >
                    <Tile
                      tone={verdictTheme[row.verdict].tone}
                      padding="sm"
                      className={isUndone ? "opacity-45" : ""}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-subhead font-semibold">{row.who}</p>
                        <VerdictBadge verdict={row.verdict} />
                      </div>
                      <p
                        className={`text-footnote mt-1 text-label-2 ${
                          isUndone ? "line-through" : ""
                        }`}
                      >
                        {row.what}
                      </p>
                      {/* Swipe alone isn't discoverable or accessible. */}
                      <Button
                        variant="plain"
                        size="small"
                        tint="ink"
                        className="mt-1 -ml-1.5"
                        icon={<IconUndo size={12} />}
                        onPress={() => toggleUndone(row.id)}
                      >
                        {isUndone ? "Undone — restore" : "Undo this action"}
                      </Button>
                    </Tile>
                  </SwipeRow>
                </li>
              );
            })}
          </ul>
        </section>

        {nudgeLog.length > 0 && (
          <List
            header="Your own attention"
            footer="Nudges are on-device and unenforced. AFK can say something; only you can close the app."
          >
            {nudgeLog.map((r) => {
              const n = nudges.find((x) => x.id === r.nudgeId);
              const m = missions.find((x) => x.id === r.missionId);
              const c = nudgeOutcome[r.outcome];
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
                  subtitle={
                    <>
                      {c.label} · {r.at}
                      {m && (
                        <span className="mt-0.5 block">
                          Mission: {m.title}
                        </span>
                      )}
                    </>
                  }
                />
              );
            })}
          </List>
        )}

        <List>
          <Row
            leading={
              <RowIcon tint="accent">
                <IconInbox size={16} />
              </RowIcon>
            }
            title={`${suppressed} emails, folded into one digest`}
            accessory="chevron"
            onPress={() => setMailOpen(true)}
          />
        </List>

        <p className="text-footnote flex items-center justify-center gap-1.5 px-4 text-center text-label-3">
          <IconLock size={12} className="shrink-0" />
          Full audit log stays on this device · 37 interruptions avoided this
          week
        </p>
      </div>

      <Sheet
        open={mailOpen}
        onOpenChange={setMailOpen}
        detents={[0.5]}
        title="Email digest"
      >
        <List footer="An afternoon offline never costs an evening of catch-up.">
          {emailClusters.map((c) => (
            <Row
              key={c.name}
              size="tall"
              title={c.name}
              subtitle={c.summary}
              value={String(c.count)}
            />
          ))}
        </List>
      </Sheet>

      <Alert
        open={deciding !== null}
        title={deciding?.who ?? ""}
        message={deciding?.what}
        onDismiss={() => setDeciding(null)}
        actions={[
          {
            label: "Accept",
            onPress: () => {
              if (deciding) setDecision(deciding.id, "Accepted — reply sent");
              setDeciding(null);
            },
          },
          {
            label: "Snooze until tomorrow",
            onPress: () => {
              if (deciding)
                setDecision(deciding.id, "Snoozed until tomorrow");
              setDeciding(null);
            },
          },
          {
            label: "Cancel",
            style: "cancel",
            onPress: () => setDeciding(null),
          },
        ]}
      />
    </>
  );
}
