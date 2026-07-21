"use client";

/* Renders whatever nudge is currently live, wherever you happen to be.
   Mounted once by the demo shell so a nudge fired during the sim
   survives you tabbing away — which is the point: the behaviour follows
   you out of the app it started in. */

import { useNudge } from "@/lib/nudge-context";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Alert } from "@/components/ui/alert";

export function NudgeHost() {
  const { activeNudge, resolveNudge, dismissNudge, reduced } = useNudge();
  if (!activeNudge) return null;

  /* The hard stop is the one that takes over — and it uses the plain
     iOS alert, not `variant="critical"`. Critical is the breakthrough:
     a real person got through. Reusing it here would blunt that. */
  if (activeNudge.present === "alert") {
    return (
      <Alert
        open
        title={activeNudge.headline}
        message={activeNudge.body}
        actions={activeNudge.actions.map((a) => ({
          label: a.label,
          style: a.kind === "dismiss" ? ("cancel" as const) : ("default" as const),
          onPress: () => resolveNudge(a),
        }))}
        onDismiss={dismissNudge}
      />
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[55]">
      <div className="pointer-events-auto">
        <NotificationBanner
          key={activeNudge.id}
          nudge={activeNudge}
          autoDismiss={!reduced}
          onAction={resolveNudge}
          onDismiss={dismissNudge}
        />
      </div>
    </div>
  );
}
