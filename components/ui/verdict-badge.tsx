/* Verdict as a pill with a glyph. The glyph is the point: verdict was
   previously signalled by colour alone, which fails for anyone who
   can't distinguish the four tints. */

import { verdictTheme, type Verdict } from "@/lib/data";
import {
  IconAlarm,
  IconBellOff,
  IconCheck,
  IconMessage,
} from "@/components/icons";

const glyphs = {
  bellOff: IconBellOff,
  message: IconMessage,
  check: IconCheck,
  alarm: IconAlarm,
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const theme = verdictTheme[verdict];
  const Glyph = glyphs[theme.icon];

  return (
    <span
      className={`text-caption inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 font-semibold ${theme.badge}`}
    >
      <Glyph size={12} strokeWidth={2.6} />
      {theme.label}
    </span>
  );
}
