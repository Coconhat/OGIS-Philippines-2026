export type Verdict = "suppress" | "reply" | "act" | "escalate";

/** The four rungs of the autonomy ladder. */
export type LevelId = 0 | 1 | 2 | 3;

/** What AFK actually did — the three fields every consumer reads. */
export type TriageOutcome = {
  verdict: Verdict;
  aiAction: string;
  aiReply?: string;
};

/* The event as authored: facts about the message, plus one outcome per
   rung. The same six messages arrive whatever the level; what changes
   is what AFK is allowed to do about them. */
export type TriageEvent = {
  id: string;
  channel: "iMessage" | "Slack" | "Email" | "Telegram" | "Call";
  sender: string;
  senderRole: string;
  avatar: string; // initials
  preview: string;
  intent: string;
  urgency: "none" | "low" | "medium" | "high";
  trust: "unknown" | "known" | "trusted";
  deviation: string;
  outcomes: Record<LevelId, TriageOutcome>;
};

/* An event flattened against one rung. Deliberately the same shape the
   old flat TriageEvent had, so consumers keep reading ev.verdict /
   ev.aiAction / ev.aiReply unchanged. `level` rides along so a stored
   record can always say which rung it ran at. */
export type ResolvedEvent = Omit<TriageEvent, "outcomes"> &
  TriageOutcome & { level: LevelId };

export const asLevelId = (n: number): LevelId =>
  Math.min(3, Math.max(0, Math.trunc(n))) as LevelId;

export function resolveEvent(ev: TriageEvent, level: number): ResolvedEvent {
  const l = asLevelId(level);
  const { outcomes, ...rest } = ev;
  return { ...rest, ...outcomes[l], level: l };
}

export function resolveScript(level: number): ResolvedEvent[] {
  return triageScript.map((ev) => resolveEvent(ev, level));
}

/* The outcome matrix.

   The progression is meant to be *felt*, not read:
   - L0's cost is cumulative and silent — three people wait, a dental
     slot expires, and Mom gets a ring she can't tell landed.
   - L1 is honest but useless against machines. The dentist line and the
     robocall both make the point that a holding reply only works on
     humans.
   - L2 is the original script, preserved verbatim. It's the default and
     the best-written copy in the app.
   - L3 is the only rung that touches your calendar. That's the trust
     being spent, made visible.

   L3 replies read in the user's own voice with no AI preamble. That's
   safe because triage-detail-sheet.tsx renders "— sent by AFK, on your
   behalf" in Caveat beneath every reply — the UI carries the
   disclosure, so the copy doesn't have to. Keep it that way. */
export const triageScript: TriageEvent[] = [
  {
    id: "ev-promo",
    channel: "Email",
    sender: "FlashDeals",
    senderRole: "Marketing list",
    avatar: "FD",
    preview: "🔥 48-HOUR SALE — Everything must go! Up to 70% off…",
    intent: "Promotion",
    urgency: "none",
    trust: "unknown",
    deviation: "Matches sender baseline (daily blast)",
    outcomes: {
      0: {
        verdict: "suppress",
        aiAction: "Read it, filed it under noise. Nothing sent.",
      },
      1: {
        verdict: "suppress",
        aiAction:
          "Suppressed. Marketing lists don't get a reply, not even a polite one.",
      },
      2: {
        verdict: "suppress",
        aiAction: "Suppressed. Folded into your return digest.",
      },
      3: {
        verdict: "act",
        aiAction:
          "Suppressed — and unsubscribed. That was their fourth blast this week.",
      },
    },
  },
  {
    id: "ev-slack",
    channel: "Slack",
    sender: "Priya N.",
    senderRole: "Coworker · #design",
    avatar: "PN",
    preview: "hey! quick q — which Figma file has the latest onboarding flow?",
    intent: "Routine question",
    urgency: "low",
    trust: "known",
    deviation: "Normal pattern for this sender",
    outcomes: {
      0: {
        verdict: "suppress",
        aiAction:
          "Read and summarised for your return. Priya is still waiting.",
      },
      1: {
        verdict: "reply",
        aiAction:
          "Held the door. Didn't answer the question — that's not mine to answer.",
        aiReply:
          "Hi Priya — I'm Nhat's AFK assistant. They're offline until 7pm. Is this blocking you, or can it wait until then?",
      },
      2: {
        verdict: "reply",
        aiAction: "Answered from approved knowledge, disclosed as AI.",
        aiReply:
          "Hi Priya — I'm Nhat's AFK assistant. The latest onboarding flow is in “Onboarding v4 – final”, updated Tuesday. Nhat is offline until 7pm; want me to flag this for their return?",
      },
      3: {
        verdict: "act",
        aiAction: "Answered in your voice, dropped the link, closed the thread.",
        aiReply:
          "“Onboarding v4 – final” — updated Tuesday, that's the live one. Ping me if the spacing looks off, I'll be back around 7.",
      },
    },
  },
  {
    id: "ev-dentist",
    channel: "Telegram",
    sender: "Bright Smile Dental",
    senderRole: "Service · appointments",
    avatar: "BS",
    preview:
      "Reminder: cleaning tomorrow 9:00. Reply YES to confirm or call to reschedule.",
    intent: "Confirmation request",
    urgency: "low",
    trust: "known",
    deviation: "Expected reminder",
    outcomes: {
      0: {
        verdict: "suppress",
        aiAction:
          "Logged it. Nobody replied YES — the 9:00 slot releases at midnight.",
      },
      1: {
        verdict: "reply",
        aiAction:
          "Asked them to hold the slot. It's an automated line; nobody read it.",
        aiReply:
          "Nhat is offline until 7pm — this is their AFK assistant. Can the 9:00 slot be held until then?",
      },
      2: {
        verdict: "act",
        aiAction: "Confirmed against calendar — tomorrow 9:00 is free.",
        aiReply: "YES — confirmed for 9:00. (Sent by Nhat's AFK assistant.)",
      },
      3: {
        verdict: "act",
        aiAction:
          "Confirmed 9:00, then pushed your 9:45 standup to 10:15 so you're not sprinting from the chair.",
        aiReply: "YES — confirmed for 9:00. (Sent by Nhat's AFK assistant.)",
      },
    },
  },
  {
    id: "ev-boss",
    channel: "Slack",
    sender: "Marcus L.",
    senderRole: "Manager",
    avatar: "ML",
    preview: "URGENT — need the deck tonight!!",
    intent: "Demand · deadline pressure",
    urgency: "medium",
    trust: "known",
    deviation: "5th “urgent” this week — within baseline",
    outcomes: {
      0: {
        verdict: "suppress",
        aiAction: "Logged as “urgent”. Fifth one this week. He'll ping again.",
      },
      1: {
        verdict: "reply",
        aiAction: "Held the line. Asked what specifically is needed before 9am.",
        aiReply:
          "Marcus — Nhat is offline until 7pm. AFK assistant here. What specifically do you need before 9am tomorrow?",
      },
      2: {
        verdict: "reply",
        aiAction: "Held the line, and pointed him at the file himself.",
        aiReply:
          "Marcus — Nhat is offline until 7pm (AFK assistant here). The deck's latest export is in the shared drive. Is anything blocking you that truly can't wait until 7?",
      },
      3: {
        verdict: "act",
        aiAction:
          "Sent him the current export and put “deck — final pass” at the top of your 7pm list. Didn't promise him tonight.",
        aiReply:
          "Latest export's in the shared drive — grab it now if you're blocked. I'll do the final pass after 7. Not tonight.",
      },
    },
  },
  {
    id: "ev-call",
    channel: "Call",
    sender: "+1 (415) 555-0132",
    senderRole: "Unknown caller",
    avatar: "?",
    preview: "Incoming call — answered by Front Desk",
    intent: "Sales call (insurance quote)",
    urgency: "none",
    trust: "unknown",
    deviation: "First contact, robocall signature",
    outcomes: {
      0: {
        verdict: "suppress",
        aiAction: "Let it ring out. Number logged, no answer, no message.",
      },
      1: {
        verdict: "reply",
        aiAction:
          "Front Desk picked up, said you were offline, asked who's calling. They hung up.",
        aiReply:
          "Nhat is away from their phone until 7pm. This is their AFK assistant — who's calling, and is it urgent?",
      },
      2: {
        verdict: "suppress",
        aiAction:
          "Front Desk answered, identified itself, took no message. Logged.",
      },
      3: {
        verdict: "act",
        aiAction:
          "Front Desk screened it, then blocked the number. Third insurance robocall from that range this month.",
      },
    },
  },
  {
    id: "ev-mom",
    channel: "iMessage",
    sender: "Mom",
    senderRole: "Family · trusted",
    avatar: "M",
    preview: "Call me when you see this. It's about grandpa.",
    intent: "Personal · possible emergency",
    urgency: "high",
    trust: "trusted",
    deviation: "Far outside baseline — Mom never texts this at this hour",
    /* Breaks through at every rung, including Observe — that's the
       promise the sheet makes. What changes is how much she's told. */
    outcomes: {
      0: {
        verdict: "escalate",
        aiAction:
          "BREAKTHROUGH — bypassed Do Not Disturb and rang through. Nothing sent; she doesn't know it worked.",
      },
      1: {
        verdict: "escalate",
        aiAction: "BREAKTHROUGH — rang through, and told her the phone's ringing.",
        aiReply:
          "This is Nhat's AFK assistant — I've just rung their phone. They should see this within seconds.",
      },
      2: {
        verdict: "escalate",
        aiAction: "BREAKTHROUGH — rang through and gave her something to hold onto.",
        aiReply:
          "This is Nhat's AFK assistant. I've rung their phone — they're offline until 7pm, but you're on their always-list, so this went straight through. Hang on a moment.",
      },
      3: {
        verdict: "escalate",
        aiAction:
          "BREAKTHROUGH — rang through, wrote back in your voice, and cleared your 6pm.",
        aiReply:
          "Mom — phone's ringing now, give me two minutes. I've moved my 6pm. Is he okay?",
      },
    },
  },
];

export type LevelChrome = {
  /** First person — the Doorkeeper explaining the rung in its own voice. */
  assistantLine: string;
  /** One-line tally. Carries the cost, not just the count. */
  tally: string;
  /** L3 only: the thing it still won't do, shown where power peaks. */
  ceiling?: { who: string; what: string };
};

export const levelChrome: Record<LevelId, LevelChrome> = {
  0: {
    assistantLine: "I'll just watch and take notes. Nothing leaves your phone.",
    tally:
      "6 read · nothing sent · 1 rang through — 3 people still waiting on you",
  },
  1: {
    assistantLine: "I'll answer the door and say you're out. I won't speak for you.",
    tally:
      "4 held at the door · 1 suppressed · 1 rang through — 2 things still need you",
  },
  2: {
    assistantLine:
      "I'll answer what I can from your calendar, and sign every message as me.",
    tally:
      "2 suppressed · 2 answered · 1 confirmed · 1 rang through — 1 thing still needs you",
  },
  3: {
    assistantLine:
      "I'll handle it end to end — except money, anything legal, and any promise you haven't made.",
    tally:
      "5 handled end to end · 1 rang through — nothing left but the one thing it won't touch",
    ceiling: {
      who: "Landlord · Email",
      what: "New lease terms arrived. I read them and filed them. I won't sign them.",
    },
  },
};

/* Verdict styling for the demo app.
   Tailwind class strings rather than raw CSS vars, so verdict colour
   participates in the token system instead of being injected through
   inline style={{}}. `icon` is what keeps verdict from being signalled
   by colour alone. */
export type VerdictTone = "mute" | "reply" | "act" | "alert";

export const verdictTheme: Record<
  Verdict,
  {
    label: string;
    tone: VerdictTone;
    icon: "bellOff" | "message" | "check" | "alarm";
    /** Pill styling, legible on top of that tone's card. */
    badge: string;
  }
> = {
  suppress: {
    label: "Suppressed",
    tone: "mute",
    icon: "bellOff",
    badge: "bg-white/70 text-label-2",
  },
  reply: {
    label: "Replied",
    tone: "reply",
    icon: "message",
    badge: "bg-white/70 text-sky-text",
  },
  act: {
    label: "Acted",
    tone: "act",
    icon: "check",
    badge: "bg-white/70 text-mint-text",
  },
  escalate: {
    label: "Rang through",
    tone: "alert",
    icon: "alarm",
    badge: "bg-white/80 text-coral-text",
  },
};

/* Legacy map — still consumed by the landing page. */
export const verdictMeta: Record<
  Verdict,
  { label: string; color: string; bg: string; description: string }
> = {
  suppress: {
    label: "Suppressed",
    color: "var(--color-ink-soft)",
    bg: "var(--color-canvas)",
    description: "Waits silently in your return digest",
  },
  reply: {
    label: "Replied",
    color: "var(--color-sky)",
    bg: "var(--color-sky-soft)",
    description: "Disclosed AI reply holds the line",
  },
  act: {
    label: "Acted",
    color: "var(--color-mint)",
    bg: "var(--color-mint-soft)",
    description: "Handled within your whitelist",
  },
  escalate: {
    label: "Escalated",
    color: "var(--color-coral)",
    bg: "var(--color-coral-soft)",
    description: "Broke through — this one is real",
  },
};

export type AutonomyLevel = {
  level: LevelId;
  name: string;
  tagline: string;
  detail: string;
};

export const autonomyLadder: AutonomyLevel[] = [
  {
    level: 0,
    name: "Observe",
    tagline: "Watch & summarize",
    detail:
      "AFK only watches and summarizes. Nothing is sent. Default for unknown contacts.",
  },
  {
    level: 1,
    name: "Hold the line",
    tagline: "Disclosed holding replies",
    detail:
      "“Nhat is offline until 7pm, I'm their assistant. Is this urgent?” — AFK asks clarifying questions to extract urgency.",
  },
  {
    level: 2,
    name: "Handle it",
    tagline: "Answer from approved knowledge",
    detail:
      "Answers routine questions from calendar, prior messages and approved facts. Reschedules, confirms, declines — always disclosed as AI.",
  },
  {
    level: 3,
    name: "Act",
    tagline: "Execute whitelisted actions",
    detail:
      "Moves meetings, replies in your voice to whitelisted people, files tasks. Never money, never legal, never new commitments.",
  },
];

/* The evidence behind the Burnout Guardian. Asserting "5.8h average"
   is a claim; drawing seven short bars under a target line is proof. */
export const guardianNights = [
  { day: "M", hours: 6.1 },
  { day: "T", hours: 5.4 },
  { day: "W", hours: 6.0 },
  { day: "T", hours: 5.2 },
  { day: "F", hours: 5.9 },
  { day: "S", hours: 6.3 },
  { day: "S", hours: 5.7 },
];

export const GUARDIAN_TARGET_HOURS = 8;
export const GUARDIAN_LATE_NIGHTS = 11;

/* Session lengths. `until` is the label the rest of the app shows —
   Home's hero, the session strip, the briefing all read it, so picking
   "For 1 hour" actually changes what the app says. */
export const durations = [
  { id: "until7", label: "Until 7:00pm", detail: "2h 39m", until: "7:00pm" },
  { id: "hour", label: "For 1 hour", detail: "until 5:21pm", until: "5:21pm" },
  {
    id: "tomorrow",
    label: "Until tomorrow morning",
    detail: "until 7:00am",
    until: "7:00am",
  },
];

/* Who is allowed past the door regardless of verdict. Surfacing this
   as configuration makes escalation feel set up rather than magical. */
export const breakthroughContacts = [
  { id: "c-mom", name: "Mom", detail: "Family · always", on: true },
  { id: "c-partner", name: "Alex", detail: "Partner · always", on: true },
  { id: "c-school", name: "Northside School", detail: "Kids · school hours", on: true },
  { id: "c-oncall", name: "On-call rotation", detail: "Work · only when you're paged", on: false },
];

export type Mission = {
  id: string;
  title: string;
  why: string;
  reward: string;
  progress: number; // 0..1
  goal: string;
  icon: "moon" | "sun" | "heart" | "target";
  /** Countable attempts, so progress can render as dots you can tick
      off rather than an abstract bar. `total: 1` means a one-off. */
  steps: { total: number; done: number };
  /** Each mission gets its own colour so the three read as distinct
      challenges rather than three identical rows. */
  tint: "sky" | "coral" | "accent" | "mint";
  /** Checklist chrome: when it lands, and what completing it is worth. */
  emoji: string;
  schedule: string;
  points: string;
};

export const missions: Mission[] = [
  {
    id: "m1",
    title: "No social apps after 11pm",
    why: "Generated from your Lens: 70% of your late-night opens had no notification behind them.",
    reward: "+3h reclaimed · Night Owl badge",
    progress: 2 / 3,
    goal: "3 nights",
    icon: "moon",
    steps: { total: 3, done: 2 },
    tint: "sky",
    emoji: "🌙",
    schedule: "Tonight · 11pm",
    points: "+3h",
  },
  {
    id: "m2",
    title: "One phone-free dinner",
    why: "You checked Slack 14 times during dinners last week.",
    reward: "+2h reclaimed · Present badge",
    progress: 0,
    goal: "This week",
    icon: "heart",
    steps: { total: 1, done: 0 },
    tint: "coral",
    emoji: "🍜",
    schedule: "This week",
    points: "+2h",
  },
  {
    id: "m3",
    title: "Replace the Sunday scroll with a walk",
    why: "Sunday 9–11am is your longest doomscroll window.",
    reward: "+2h reclaimed · Fresh Air badge",
    progress: 0,
    goal: "Sunday morning",
    icon: "sun",
    steps: { total: 1, done: 0 },
    tint: "accent",
    emoji: "🌤️",
    schedule: "Sunday morning",
    points: "+2h",
  },
];

export type FeedPost = {
  id: string;
  author: string;
  avatar: string;
  time: string;
  mission: string;
  caption: string;
  offline: string;
  kudos: number;
  scene: "hike" | "book" | "meal" | "run";
};

export const feed: FeedPost[] = [
  {
    id: "f1",
    author: "Linh T.",
    avatar: "LT",
    time: "2h ago",
    mission: "Sunday walk instead of the scroll",
    caption: "Turns out the park is nicer than my feed.",
    offline: "3h 40m offline",
    kudos: 12,
    scene: "hike",
  },
  {
    id: "f2",
    author: "Daniel K.",
    avatar: "DK",
    time: "5h ago",
    mission: "Phone-free dinner",
    caption: "First dinner in months where nobody's phone touched the table.",
    offline: "2h 10m offline",
    kudos: 9,
    scene: "meal",
  },
  {
    id: "f3",
    author: "Sara M.",
    avatar: "SM",
    time: "yesterday",
    mission: "No social after 11pm — night 3",
    caption: "Finished an actual book chapter. Wild.",
    offline: "8h sleep · streak 3",
    kudos: 21,
    scene: "book",
  },
];

export const lensApps = [
  { name: "ShortReel", hours: 9.5, compulsive: 70, color: "var(--color-coral)" },
  { name: "Slack", hours: 6.2, compulsive: 41, color: "var(--color-accent)" },
  { name: "Mail", hours: 3.8, compulsive: 55, color: "var(--color-sky)" },
  { name: "Messages", hours: 2.9, compulsive: 22, color: "var(--color-mint)" },
  { name: "Maps", hours: 1.1, compulsive: 4, color: "var(--color-ink-faint)" },
];

// Opens per 2-hour block, 8am → midnight-2am, for the heat strip
export const lensDay = [4, 7, 6, 9, 11, 8, 14, 23, 19];
export const lensDayLabels = ["8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p", "12a"];

/* `sourceId` ties a seeded row back to the triage event that would
   have produced it, so the briefing can de-duplicate against live
   results by id instead of by matching name prefixes. */
export const briefingHandled = [
  {
    id: "b1",
    sourceId: "ev-slack",
    who: "Priya N. · Slack",
    what: "Answered: latest onboarding flow is in “Onboarding v4 – final”.",
    verdict: "reply" as Verdict,
  },
  {
    id: "b2",
    sourceId: "ev-dentist",
    who: "Bright Smile Dental · Telegram",
    what: "Confirmed tomorrow's 9:00 cleaning against your calendar.",
    verdict: "act" as Verdict,
  },
  {
    id: "b3",
    sourceId: "ev-boss",
    who: "Marcus L. · Slack",
    what: "Held the line on “urgent deck” — pointed him to the shared drive.",
    verdict: "reply" as Verdict,
  },
  {
    id: "b4",
    sourceId: "ev-call",
    who: "Front Desk · +1 (415) 555-0132",
    what: "Screened a robocall. Identified itself, took no message.",
    verdict: "suppress" as Verdict,
  },
];

export const briefingDecisions = [
  {
    id: "d1",
    who: "Aunt Vy · iMessage",
    what: "Invites you to a birthday lunch Saturday — needs a yes/no from you.",
  },
  {
    id: "d2",
    who: "Landlord · Email",
    what: "New lease terms attached. AFK never signs commitments — your call.",
  },
];

export const emailClusters = [
  { name: "Newsletters & promos", count: 31, summary: "Nothing time-sensitive." },
  { name: "Work threads", count: 12, summary: "3 threads moved on without you; summaries ready." },
  { name: "Receipts & confirmations", count: 7, summary: "All filed." },
];
