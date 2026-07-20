"use client";

/* The old triage card stacked avatar, preview, three chips, a baseline
   line, the action and a disclosure toggle — all between 9 and 13px.
   That density moves here, into depth, so the feed can stay scannable. */

import { verdictTheme, type ResolvedEvent } from "@/lib/data";
import { Sheet } from "@/components/ui/sheet";
import { List, Row } from "@/components/ui/list";
import { Button } from "@/components/ui/button";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { IconAlertTriangle, IconUndo } from "@/components/icons";

const urgencyGlyph: Record<ResolvedEvent["urgency"], string> = {
  none: "○",
  low: "◔",
  medium: "◑",
  high: "●",
};

export function TriageDetailSheet({
  event,
  onClose,
}: {
  event: ResolvedEvent | null;
  onClose: () => void;
}) {
  return (
    <Sheet
      open={event !== null}
      onOpenChange={(o) => !o && onClose()}
      detents={[0.62, 0.94]}
      title={event?.sender}
    >
      {event && (
        <div className="space-y-1 pb-4">
          <div className="flex items-center justify-between gap-3 pb-1">
            <p className="text-footnote text-label-2">
              {event.senderRole} · {event.channel}
            </p>
            <VerdictBadge verdict={event.verdict} />
          </div>

          <p className="text-body rounded-tile bg-fill-2 px-4 py-3">
            {event.preview}
          </p>

          <List header="Why">
            <Row title="Intent" value={event.intent} />
            <Row
              title="Urgency"
              value={
                <span
                  className={
                    event.urgency === "high"
                      ? "text-coral-text"
                      : event.urgency === "medium"
                        ? "text-accent-text"
                        : "text-label-2"
                  }
                >
                  <span aria-hidden>{urgencyGlyph[event.urgency]}</span>{" "}
                  {event.urgency}
                </span>
              }
            />
            <Row title="Trust" value={event.trust} />
            <Row
              title="Against baseline"
              subtitle={event.deviation}
              value={
                event.verdict === "escalate" ? (
                  <IconAlertTriangle size={16} className="text-coral-text" />
                ) : undefined
              }
            />
          </List>

          <List header="What AFK did" footer={verdictTheme[event.verdict].label}>
            {/* wrap, not truncate — these run to two lines at L3. */}
            <Row wrap title={event.aiAction} />
          </List>

          {event.aiReply && (
            <section className="pt-4">
              <h3 className="text-footnote px-1 pb-2 font-medium text-label-2">
                Sent on your behalf
              </h3>
              <div className="rounded-tile rounded-br-md bg-card-reply px-4 py-3">
                <p className="text-subhead">{event.aiReply}</p>
                {/* One of exactly two places Caveat appears: the AI
                    signing its own message. */}
                <p className="hand text-hand mt-2 text-label-2">
                  — sent by AFK, on your behalf
                </p>
              </div>
            </section>
          )}

          <div className="pt-5">
            <Button
              variant="destructive"
              size="large"
              full
              icon={<IconUndo size={16} />}
              onPress={onClose}
            >
              Undo this {event.aiReply ? "reply" : "action"}
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
