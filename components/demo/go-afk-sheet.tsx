"use client";

/* The autonomy ladder used to sit on Home as a permanent card.
   It's configuration, and configuration belongs behind the action it
   configures — so it lives here, in the sheet you get from "Go AFK…".

   The point of this screen is the preview: move the dial and watch the
   same six messages get handled differently, *before* you commit. The
   ladder used to be four anonymous segments that changed nothing. */

import { useAfk } from "@/lib/afk-context";
import {
  autonomyLadder,
  breakthroughContacts,
  durations,
  levelChrome,
  asLevelId,
} from "@/lib/data";
import { Doorkeeper, type DoorkeeperState } from "@/components/afk/doorkeeper";
import { SpeechBubble } from "@/components/afk/speech-bubble";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dial } from "@/components/ui/dial";
import { List, Row, RowIcon } from "@/components/ui/list";
import { Toggle } from "@/components/ui/toggle";
import { IconCheck, IconMoon, IconUser } from "@/components/icons";

/* The mascot leans in as you hand it more. */
const mood: Record<number, DoorkeeperState> = {
  0: "dozing",
  1: "watching",
  2: "thinking",
  3: "pleased",
};

export function GoAfkSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    level,
    setLevel,
    setAfkOn,
    duration,
    setDuration,
    breakthrough,
    toggleBreakthrough,
  } = useAfk();

  const l = asLevelId(level);
  const active = autonomyLadder[l];
  const chrome = levelChrome[l];

  const start = () => {
    setAfkOn(true);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      detents={[0.92]}
      title="Go AFK"
    >
      <div className="space-y-1 pb-4">
        {/* The assistant explains each rung in its own voice, rather than
            the app describing it in the third person. */}
        <section className="flex flex-col items-center gap-2.5 pt-1 pb-2">
          <SpeechBubble key={`voice-${l}`} className="animate-rise">
            {chrome.assistantLine}
          </SpeechBubble>
          <Doorkeeper state={mood[l]} size={92} />
        </section>

        <section>
          <div key={`name-${l}`} className="animate-rise text-center">
            <h3 className="text-title-2">{active.name}</h3>
            <p className="text-subhead mt-0.5 text-label-2">{active.tagline}</p>
          </div>

          <Dial
            className="mt-3"
            label="How much can AFK do on your behalf?"
            value={l}
            onChange={setLevel}
            stops={autonomyLadder.map((a) => ({
              value: a.level,
              label: a.name,
            }))}
          />

          <p className="text-footnote mt-2 rounded-group bg-accent-dim px-4 py-3 text-label-2">
            {active.detail}
          </p>
        </section>

        <List header="Duration">
          {durations.map((d) => (
            <Row
              key={d.id}
              title={d.label}
              value={d.detail}
              onPress={() => setDuration(d.id)}
              accessory={
                duration === d.id ? (
                  <IconCheck
                    size={17}
                    strokeWidth={3}
                    className="text-accent-text"
                  />
                ) : (
                  "none"
                )
              }
            />
          ))}
        </List>

        <List
          header="Always break through"
          footer="These reach you at any level, even Observe. Everything else waits for your return briefing."
        >
          {breakthroughContacts.map((c) => (
            <Row
              key={c.id}
              leading={
                <RowIcon tint={breakthrough[c.id] ? "coral" : "gray"}>
                  <IconUser size={16} />
                </RowIcon>
              }
              title={c.name}
              subtitle={c.detail}
              accessory={
                <Toggle
                  checked={Boolean(breakthrough[c.id])}
                  onChange={() => toggleBreakthrough(c.id)}
                  label={`${c.name} can always break through`}
                />
              }
            />
          ))}
        </List>

        <div className="pt-5">
          <Button size="large" full icon={<IconMoon size={18} />} onPress={start}>
            Go AFK
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
