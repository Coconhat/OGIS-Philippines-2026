# AFK

> Your phone, but quieter.

AFK is a concept product built by Team x-03 for **OGIS 2026**. This repo is the
pitch: a marketing landing page plus a clickable, fully simulated phone demo.
Nothing here talks to a network — every message, verdict and statistic is
scripted in `lib/data.ts`.

## What the system does

AFK is an **on-device notification gatekeeper**. You flip a switch before you
step away from your phone; while you're gone, a local AI stands at the door and
decides what happens to every incoming message, email and call. Most things get
quietly handled or held. The rare thing that genuinely matters rings through and
breaks Do Not Disturb.

The product's stated success metric is inverted from normal apps: **hours
reclaimed, not hours in the app.** The landing page counter reads "1,204,317
hours reclaimed and counting."

### The core loop

1. **Go AFK** — one toggle, with an end time ("until 7:00pm").
2. **Triage** — each incoming event is read locally, scored, and given a verdict.
3. **Return Briefing** — one 20-second digest instead of 200 notifications, with
   an undo button on everything AFK did.

### Triage: the four verdicts

Every event gets classified along three axes — *intent*, *urgency*, *trust* —
and compared against a per-sender baseline ("Mom never texts this at this
hour"). The deviation from baseline, not the content alone, drives the verdict:

| Verdict | What happens |
|---|---|
| **Suppress** | Silently held, folded into the return digest (promos, robocalls) |
| **Reply** | A disclosed AI holding reply goes out — always signed as an assistant |
| **Act** | Executes something inside your whitelist (confirms an appointment against your calendar) |
| **Escalate** | Breakthrough — bypasses Do Not Disturb and rings your phone |

The scripted demo runs six events and ends with `5 handled quietly · 1 reached
you`. The one that gets through is Mom texting about grandpa.

Replies are always disclosed as AI ("I'm Nhat's AFK assistant"), and one of the
scripted replies is notable for what the product is arguing: when a manager
sends the fifth "URGENT" of the week, AFK's baseline check flags it as *normal*
and it pushes back — "Is anything blocking you that truly can't wait until 7?"

### The autonomy ladder

You set how much AFK can do on your behalf, per person and per app. Four rungs
(`lib/data.ts:autonomyLadder`):

- **L0 · Observe** — watch and summarize only, nothing sent. Default for unknown contacts.
- **L1 · Hold the line** — disclosed holding replies that probe for real urgency.
- **L2 · Handle it** — answer routine questions from calendar and approved facts.
- **L3 · Act** — move meetings, reply in your voice to whitelisted people, file tasks.

Hard ceiling at every level: **never money, never legal, never new
commitments.** In the briefing, a new lease from the landlord is explicitly
routed to "genuinely needs you" rather than handled.

### Screen Time Lens

A weekly behavioral read-back, not a dashboard. It separates *hours spent* from
*compulsive opens* — short, frequent app opens with **no notification behind
them**. The pitch line: "Your phone didn't call you. You went anyway." The
demo's finding is a 23-pickup midnight cluster and 9.5h in short-video apps at
70% compulsive.

### Missions

Lens findings become challenges. "No social apps after 11pm" exists *because*
70% of your late-night opens were unprompted. Missions carry rewards in hours
reclaimed and badges, and while one is active **triage automatically holds the
line** — the challenge is enforced by the gatekeeper, not left to willpower.

Completing a mission posts to a feed where the only permitted content is proof
of life away from the screen — a photo, a mission, and time offline. No
screenshots, no scores.

### Burnout Guardian

AFK watches its own signals about you. After 11 straight nights of answering
work messages on 5.8h of sleep, it proactively *schedules* an overnight AFK
window and asks you to approve it.

### Front Desk

Calls get a receptionist: AFK answers, identifies itself, takes a message, and
books callbacks around your calendar. Unknown robocallers are screened and
logged with no message taken.

### Return Briefing

The welcome-back screen: a count of what was handled / held back / needs a
decision, every AI action listed with an **undo**, and suppressed email
collapsed into clusters ("31 newsletters — nothing time-sensitive"). The framing
is "an afternoon offline never costs an evening of catch-up."

### Privacy stance

Central to the pitch and repeated on every screen: the model runs **on your
device**. No cloud, no account, nobody reading your messages. The audit log is
described as local SQLite, never synced.

## Repo layout

```
app/page.tsx            Landing page — 5-slide horizontal deck (desktop), vertical (mobile)
app/demo/layout.tsx     Phone frame: status bar + 5-tab bottom nav, wraps AfkProvider
app/demo/page.tsx       Home — AFK toggle, autonomy ladder, Burnout Guardian, stats
app/demo/triage/        The live triage animation and breakthrough overlay
app/demo/lens/          Screen Time Lens charts
app/demo/missions/      Missions + the offline feed
app/demo/briefing/      Return Briefing digest
lib/afk-context.tsx     Shared demo state: afkOn, level, minutes away, handled, missions
lib/data.ts             All scripted content — the source of truth for the demo
components/             Hand-rolled SVG icons, illustrations, phone mock
```

State is React context only and resets on reload — there is no persistence and
no backend.

## Running it

```bash
bun dev   # or npm / pnpm / yarn
```

Open <http://localhost:3000>. The landing page is at `/`; the demo starts at
`/demo`.

Built on Next.js 16 + React 19 + Tailwind v4.

## Caveat

This is a concept demo. Every message is simulated and nothing is ever sent.
