# AFK design system

Governs the demo app (`/demo`). **The landing page (`app/page.tsx`) is
deliberately outside this system** — it keeps the original Keeby-style palette
(`--color-canvas`, `--color-*-soft`, `rounded-card`, `shadow-card`). Don't
migrate it without a reason, and don't delete those tokens.

Direction: **iOS bones, expressive skin, and a character.** Native structure and
interaction; colour-blocked cards rather than gray lists; a mascot with a face.

---

## Colour

### Backgrounds

| Token | Value | Use |
|---|---|---|
| `--color-app-bg` | `#f2f2f7` | Apple systemGroupedBackground. Flat, never tinted. |
| `--color-app-surface` | `#ffffff` | Cards, sheets, bars |
| `--color-app-surface-2` | `#e5e5ea` | systemGray5, recessed wells |

The canvas is **flat**. Warmth comes from the `sunshine` utility — a fixed
gradient on the frame that content scrolls beneath — not from tinting the
background. A warm-gray canvas is what made an earlier pass read as generic
warm-paper; don't reintroduce one.

### Verdict cards — the signature surface

| Token | Value | Verdict |
|---|---|---|
| `--color-card-mute` | `#e8eaf0` | suppressed |
| `--color-card-reply` | `#cfe2ff` | replied |
| `--color-card-act` | `#c4eed3` | acted |
| `--color-card-alert` | `#ff6154` | escalated |

All four carry **ink text**, not white. Bright fills take dark text — white on
`#ff6154` is only 3.0:1.

### The nudge banner is opaque — deliberately

`components/ui/notification-banner.tsx` uses a solid `bg-app-surface`, not
`material-bar`. It was translucent once and the ShortReel feed was legible
straight through it: **`backdrop-filter` does not composite on an element running
a transform animation**, so the blur silently dropped and left only the 76% white.
A notification has to be legible over arbitrary content. Depth comes from
`shadow-float`. Don't "restore" the frosted look.

### Coral tint vs coral fill

**Coral *tint* (`coral-dim` / `coral-text`) is your own behaviour. Coral *fill*
(`bg-card-alert`) is someone else needing you.**

The breakthrough — a real person got past the door — owns `card-alert` and the
`Alert variant="critical"` treatment. Behavioural nudges are the opposite
vector: nobody called, you went anyway. They never use `card-alert`, and the
tier-4 hard stop uses `Alert variant="standard"`, not `critical`. Giving both
the same surface makes the app's most loaded beat indistinguishable from a
screen-time reminder.

### The fill-vs-text rule

`accent` `coral` `mint` `sky` are **fill and glyph colours only.** All four fail
as small text on white (`accent-deep` on white is ~3.1:1).

Any text under 17px/700 uses the `-text` variant:

| Fill | Text variant | Contrast on white |
|---|---|---|
| `--color-accent` | `--color-accent-text` `#a85400` | 4.6:1 |
| `--color-coral` | `--color-coral-text` `#b8362c` | 5.4:1 |
| `--color-mint` | `--color-mint-text` `#1c7a49` | 4.6:1 |
| `--color-sky` | `--color-sky-text` `#0062ad` | 5.1:1 |

`-dim` variants (`--color-accent-dim` etc.) are low-alpha tints for icon chips
and tinted buttons.

Filled buttons use the deeper end of the hue (`bg-accent-deep`, `bg-coral-text`)
so white labels clear 3:1.

### Labels

Apple's values: `--color-label` (black), `--color-label-2`
(`rgb(60 60 67 / 0.6)`), `--color-label-3` (`rgb(60 60 67 / 0.3)`).
`--color-label-inv` is white — for dark fills only.

---

## Type

iOS ramp at Dynamic Type Large, every weight bumped one notch because Nunito's
x-height reads lighter than SF.

`text-display` 40 · `text-large-title` 34 · `text-title-1` 28 · `text-title-2` 22
· `text-title-3` 20 · `text-headline` 17/700 · `text-body` 17/500 ·
`text-callout` 16 · `text-subhead` 15 · `text-footnote` 13 · `text-caption` 12 ·
`text-hand` 15 (Caveat only).

**Use the ramp. No `text-[13px]`.** Weight comes from the ramp too — don't stack
`font-extrabold` on a `text-headline`. The old screens were uniformly
`font-black`, which is why nothing had hierarchy.

> `--text-*: initial` is **not** set, because the landing page still uses
> `text-xs`…`text-6xl`. The audit grep below is the guard instead.

---

## Elevation — three tiers

- `shadow-flat` — lists, most cards. **The default.**
- `shadow-raised` — **one element per screen, maximum.**
- `shadow-float` — sheets, tab bar, alerts, nudge banners only.

Colour separates surfaces, not shadow. Five identical shadowed cards is the
failure mode this replaced.

Current raised element per screen: Home → Doorkeeper hero. Lens (Week) → the
weekly story. Lens (Today) / Triage / Briefing / Missions → none.

The nudge banner is `shadow-float`, so it never competes with a screen's raised
element regardless of which tab it appears over.

---

## Character budget

The failure mode of an expressive direction is decoration creep. These are
review criteria, not suggestions.

1. **Doorkeeper appears on 3 screens:** Home (hero), Triage (header, reacting),
   Briefing (welcome). Not Lens, not Missions.
1b. **Illustrations** (`components/illustrations.tsx`) are for empty states —
   plus exactly one in-content use: `MoonIllo` behind the Burnout Guardian on
   Home, where the sleep story needs more than a flame icon. Adding a second
   in-content illustration means re-reading this rule first.
2. **Wallpaper gradient: 2 instances** — the Doorkeeper's body, and the Missions
   protection banner. The `sunshine` frame gradient is separate and is the only
   ambient warmth.
3. **Caveat has one job: the AI's voice.** The speech-bubble signature and the
   disclosed-reply attribution in the Triage sheet. Nowhere else.
4. **Orange replaces systemBlue everywhere** — tabs, switches, segmented
   selection, progress, focus rings.
5. **Colour always pairs with a glyph.** `VerdictBadge` carries an icon;
   urgency, compulsive-%, nudge tiers and behaviour severity all carry glyphs.
   No meaning by hue alone, ever.
6. **The simulated phone (`components/demo/scroll-sim.tsx`) is outside this
   system on purpose.** It has its own wallpaper, its own icon set
   (`sim-icons.tsx`) and its own type sizes, because it is meant to read as
   *somewhere else* — another OS you're being pulled into. Don't unify it with
   the AFK palette; the contrast is the point. Its app icons follow iOS
   convention, where most tiles are white with a coloured mark rather than a
   coloured tile with a white glyph.

---

## Interaction

- **44pt minimum** on everything interactive. `Button size="small"` looks 34px
  but pads to 44.
- `Pressable` is the substrate — it handles focus-visible, haptics, and
  cancel-on-scroll (dropping the highlight when a press turns into a scroll,
  which is what makes lists feel native).
- **Springs**: `--ease-spring` on toggle knob, segmented thumb, verdict badge.
  `--ease-ios` for sheets and nav.
- **Swipe actions always ship with a visible fallback** — swipe is neither
  discoverable nor accessible on its own.
- Sheets: focus trap, Esc, restore focus, scroll lock, drag-to-dismiss.

## Accessibility floor

Every screen: type ramp only · ≤1 raised element · all targets ≥44pt · no
colour-only signals · visible focus ring · reduced motion respected.

Reduced motion is **not** just the CSS guard — Triage's auto-advance is a JS
timer, so it checks `useReducedMotion()` and renders all six events resolved,
with no auto-play. There's also a manual pause control (WCAG 2.2.2).

The nudge engine (`lib/nudge-context.tsx`) is the **second** such timer, but only
partly. Nudges fire off behavioural conditions (`NudgeCondition`), and two of the
three signals are **event-driven**: `scroll` and `switches` need no timer, so
tiers 1 and 2 fire normally under reduced motion. Only `dwell` needs the
interval, so tiers 3 and 4 are reachable via **"Next beat"**, which forces the
next nudge regardless of condition. Banner auto-dismiss is disabled under reduced
motion (auto-dismissing text is a 2.2.1 timing issue independent of motion), and
Lens → Today renders all four nudges as a static list so the copy is reachable
without ever running the sim. Pause and Step ship regardless of preference.

---

## Audit

Should all return nothing inside `app/demo/` and `components/{ui,afk,demo}`:

```bash
grep -rn "text-\[" app/demo components/ui components/afk components/demo
grep -rn "style={{ color" app/demo components/ui components/afk components/demo
grep -rn "text-ink-soft\|border-line\|rounded-card\|shadow-card" app/demo components/ui
```
