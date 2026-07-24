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

/* ---- Unhealthy phone-usage behaviours ---------------------------------
   The missing middle layer. Missions used to be a hardcoded list whose
   `why` field *claimed* it came from Lens; nothing modelled that. This
   is what Lens actually detects, what missions actually treat, and what
   live nudges actually fire from — one vocabulary across all three.

   Every behaviour here is anchored to a number the demo already asserts
   somewhere (lensApps, lensDay, guardianNights), so this unifies
   existing claims rather than inventing new ones. */

export type BehaviourId =
  | "doomscroll"
  | "phantom"
  | "churn"
  | "latenight"
  | "morningreach"
  | "mealtime"
  | "workbleed";

/* The line a behaviour has to cross before AFK writes a mission.

   Without this, "generated from your behaviour" was a sentence rather
   than a mechanism: `signal` says how something is watched, `evidence`
   says what was measured, but nothing said *what crossing produces a
   mission*. A mission with no threshold behind it is a self-help tip. */
export type BehaviourRule = {
  /** The line. Quoted verbatim on the mission it writes. */
  threshold: string;
  /** What the threshold is measured over. */
  window: string;
  /** What actually crossed it. */
  observed: string;
  /** When it crossed. */
  crossedAt: string;
};

export type Behaviour = {
  id: BehaviourId;
  name: string;
  /** What it is, in plain language. */
  definition: string;
  /** How it's detected. A signal, not a vibe. */
  signal: string;
  /** The measurement this week — what earns the claim. */
  evidence: string;
  /** The threshold that turns the measurement into a mission. */
  rule: BehaviourRule;
  severity: "high" | "medium" | "low";
  icon: "flame" | "eye" | "clock" | "moon" | "sun" | "heart" | "zap";
};

export const behaviours: Behaviour[] = [
  {
    id: "doomscroll",
    name: "Doomscrolling",
    definition:
      "Long unbroken stretches in a feed, scrolling past far more than you stop to read.",
    signal: "Session length in feed apps, plus scroll distance without interaction.",
    evidence: "9.5h in ShortReel · longest unbroken run 1h 52m",
    rule: {
      threshold: "60+ min unbroken in a feed app",
      window: "any single session",
      observed: "1h 52m in ShortReel · 3 runs over an hour",
      crossedAt: "Tue 11:47pm",
    },
    severity: "high",
    icon: "flame",
  },
  {
    id: "phantom",
    name: "Phantom checking",
    definition:
      "Opening an app when nothing asked you to. No notification, no message — just reflex.",
    signal: "Opens with no notification in the seconds before them.",
    evidence: "70% of ShortReel opens were unprompted",
    rule: {
      threshold: "60%+ of opens with nothing behind them",
      window: "rolling 7 days",
      observed: "70% of 214 opens · no notification",
      crossedAt: "Fri 9:02am",
    },
    severity: "high",
    icon: "eye",
  },
  {
    id: "latenight",
    name: "Sleep displacement",
    definition:
      "Phone use pushing your bedtime later, night after night.",
    signal: "Pickups after 10pm, measured against when you actually fell asleep.",
    evidence: "asleep after 12:40am, 4 of 7 nights · 23 pickups after 10pm",
    rule: {
      threshold: "asleep after midnight on 3+ nights",
      window: "rolling 7 days",
      observed: "asleep after 12:40am, 4 of 7 nights",
      crossedAt: "Thu 12:52am",
    },
    severity: "high",
    icon: "moon",
  },
  {
    id: "workbleed",
    name: "Work bleed",
    definition:
      "Answering work messages in hours that aren't work hours.",
    signal: "Work-app activity outside your stated working window.",
    evidence: "11 straight nights answering work messages",
    rule: {
      threshold: "work apps after 9pm on 5+ nights",
      window: "rolling 7 days",
      observed: "11 straight nights · latest reply 11:41pm",
      crossedAt: "Wed 10:18pm",
    },
    severity: "high",
    icon: "zap",
  },
  {
    id: "churn",
    name: "App-hopping",
    definition:
      "Cycling the same three or four apps in a loop, looking for something new in each.",
    signal: "Switch rate inside a short window, and repeated app sequences.",
    evidence: "9 switches in 4 minutes · same loop 6× this week",
    rule: {
      threshold: "8+ app switches inside 5 minutes",
      window: "any single session",
      observed: "9 switches in 4 min · same loop 6×",
      crossedAt: "Tue 11:12pm",
    },
    severity: "medium",
    icon: "clock",
  },
  {
    id: "mealtime",
    name: "Presence displacement",
    definition:
      "Reaching for the phone while you're with people.",
    signal: "Usage during meals and calendar events marked social.",
    evidence: "Slack checked 14× during dinners last week",
    rule: {
      threshold: "phone picked up during 3+ meals",
      window: "rolling 7 days",
      observed: "Slack checked 14× across 6 dinners",
      crossedAt: "Sun 7:34pm",
    },
    severity: "medium",
    icon: "heart",
  },
  {
    id: "morningreach",
    name: "First-thing reach",
    definition:
      "The phone is the first thing you touch, before you're properly awake.",
    signal: "Gap between your alarm going off and your first pickup.",
    evidence: "Phone in hand within 4 min of waking, 6 of 7 days",
    rule: {
      threshold: "phone within 5 min of waking, 4+ mornings",
      window: "rolling 7 days",
      observed: "within 4 min, 6 of 7 mornings",
      crossedAt: "Mon 6:44am",
    },
    severity: "medium",
    icon: "sun",
  },
];

export function behaviourById(id: BehaviourId) {
  return behaviours.find((b) => b.id === id);
}

export const severityTheme: Record<
  Behaviour["severity"],
  { chip: string; label: string }
> = {
  high: { chip: "bg-coral-dim text-coral-text", label: "Needs attention" },
  medium: { chip: "bg-accent-dim text-accent-text", label: "Worth watching" },
  low: { chip: "bg-fill-2 text-label-2", label: "Minor" },
};

/* Why a mission exists, copied off the rule at the moment it fired.

   Denormalised on purpose: a mission is a *record of a crossing*, so it
   has to keep the numbers that were true when it was written, even
   after next week's Lens moves them. */
export type MissionOrigin = {
  /** The line that was crossed, quoted from the behaviour's rule. */
  threshold: string;
  /** What crossed it. */
  observed: string;
  /** When AFK wrote the mission. */
  createdAt: string;
};

export type Mission = {
  id: string;
  title: string;
  /** What to actually do. A mission is a prescription, not a challenge. */
  prescription: string;
  why: string;
  /** The behaviour this mission treats. Missions are written when a
      behaviour crosses its rule — this is the join, not decoration. */
  behaviourId: BehaviourId;
  /** The crossing that wrote it. */
  origin: MissionOrigin;
  /** The measurement that generated it. */
  evidence: string;
  /** `active` shipped on your list · `suggested` means the rule crossed
      on a weekly read and it's waiting for you · `created` means it is
      written live, the moment its rule crosses in front of you. */
  status: "active" | "suggested" | "created";
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
    prescription: "Feed apps lock at 11pm. AFK holds the door until morning.",
    why: "Written Thu 12:52am — four nights this week you fell asleep after 12:40am, and the phone was the last thing you put down each time.",
    behaviourId: "latenight",
    origin: {
      threshold: "asleep after midnight on 3+ nights",
      observed: "asleep after 12:40am, 4 of 7 nights",
      createdAt: "Thu 12:52am",
    },
    evidence: "asleep after 12:40am, 4 of 7 nights · 23 pickups after 10pm",
    status: "active",
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
    prescription: "One meal this week with the phone in another room. AFK takes messages while you eat.",
    why: "Written Sun 7:34pm — you crossed the 3-meal line six dinners in, checking Slack 14 times across them.",
    behaviourId: "mealtime",
    origin: {
      threshold: "phone picked up during 3+ meals",
      observed: "Slack checked 14× across 6 dinners",
      createdAt: "Sun 7:34pm",
    },
    evidence: "Slack checked 14× during dinners last week",
    status: "active",
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
  /* The one you watch get written. It does not ship on the list — it
     exists only after `missionRules` catches you crossing the hour in a
     feed, which is the whole argument: the usage writes the mission.
     `origin` here is the fallback copy; the live crossing overwrites it
     with tonight's actual number (see `createdMissions`). */
  {
    id: "m3",
    title: "Swap tomorrow's scroll for a 20-minute walk",
    prescription: "Twenty minutes outside before ShortReel opens again. AFK holds the app until you're back.",
    why: "Written the moment you crossed an hour unbroken in ShortReel — the third run over an hour this week.",
    behaviourId: "doomscroll",
    origin: {
      threshold: "60+ min unbroken in a feed app",
      observed: "1h 02m unbroken",
      createdAt: "tonight",
    },
    evidence: "9.5h in ShortReel · longest unbroken run 1h 52m",
    status: "created",
    reward: "+2h reclaimed · Fresh Air badge",
    progress: 0,
    goal: "Tomorrow",
    icon: "sun",
    steps: { total: 1, done: 0 },
    tint: "mint",
    emoji: "🚶",
    schedule: "Tomorrow · before 6pm",
    points: "+2h",
  },

  /* Rules that crossed on the weekly read rather than in front of you.
     Keeping these unaccepted is what makes the mechanism visible — if
     every mission were already active, "your usage wrote this" would be
     a claim rather than something you watch happen. */
  {
    id: "m4",
    title: "Leave the phone out of the bedroom",
    prescription: "Charge it in the next room. The alarm still works; the reflex doesn't.",
    why: "Written Mon 6:44am — you reached for it within 4 minutes of waking on 6 of 7 mornings, past the 4-morning line.",
    behaviourId: "morningreach",
    origin: {
      threshold: "phone within 5 min of waking, 4+ mornings",
      observed: "within 4 min, 6 of 7 mornings",
      createdAt: "Mon 6:44am",
    },
    evidence: "Phone in hand within 4 min of waking, 6 of 7 days",
    status: "suggested",
    reward: "+4h reclaimed · Clear Head badge",
    progress: 0,
    goal: "3 nights",
    icon: "sun",
    steps: { total: 3, done: 0 },
    tint: "mint",
    emoji: "🛏️",
    schedule: "Tonight · bedtime",
    points: "+4h",
  },
  {
    id: "m5",
    title: "No work apps after 7pm",
    prescription: "Slack and Mail go quiet at 7pm. AFK answers them at Level 1 until morning.",
    why: "Written Wed 10:18pm — 11 straight nights answering work messages, more than double the 5-night line.",
    behaviourId: "workbleed",
    origin: {
      threshold: "work apps after 9pm on 5+ nights",
      observed: "11 straight nights · latest reply 11:41pm",
      createdAt: "Wed 10:18pm",
    },
    evidence: "11 straight nights answering work messages",
    status: "suggested",
    reward: "+5h reclaimed · Off The Clock badge",
    progress: 0,
    goal: "5 evenings",
    icon: "moon",
    steps: { total: 5, done: 0 },
    tint: "sky",
    emoji: "🌆",
    schedule: "Weeknights · 7pm",
    points: "+5h",
  },
  {
    id: "m6",
    title: "Open ShortReel on purpose, not on reflex",
    prescription: "A one-line prompt before it opens: name what you came for. Nothing to name, nothing to open.",
    why: "Written Fri 9:02am — 70% of 214 opens had nothing behind them, past the 60% line.",
    behaviourId: "phantom",
    origin: {
      threshold: "60%+ of opens with nothing behind them",
      observed: "70% of 214 opens · no notification",
      createdAt: "Fri 9:02am",
    },
    evidence: "70% of ShortReel opens were unprompted",
    status: "suggested",
    reward: "+3h reclaimed · Deliberate badge",
    progress: 0,
    goal: "1 day",
    icon: "target",
    steps: { total: 1, done: 0 },
    tint: "coral",
    emoji: "🎯",
    schedule: "Tomorrow",
    points: "+3h",
  },
];

export function missionById(id: string) {
  return missions.find((m) => m.id === id);
}

/** The mission a behaviour's rule writes when it crosses. */
export function missionForBehaviour(id: BehaviourId) {
  return missions.find((m) => m.behaviourId === id);
}

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

/* ---- Behavioural nudges ----------------------------------------------
   The other half of the product. Triage guards what comes *in*; this
   guards what you reach *for*. Lens already reads the week back after
   the fact — nudges are the same observation delivered in the moment,
   while the habit is still happening.

   The voice is Lens's: observational, numeric, never scolding. Every
   nudge cites the number that earns it, because "you're on your phone
   too much" is a judgement and "8 minutes, 0 notifications" is a fact. */

/* A live nudge fires from the same behaviour taxonomy Lens detects and
   missions treat — one vocabulary, so "doomscroll" means the same thing
   in the chart, on the mission, and in the notification. */
export type NudgeTrigger = BehaviourId;

/** 1 notice · 2 firm · 3 mission at stake · 4 hard stop. */
export type NudgeTier = 1 | 2 | 3 | 4;

export type NudgeAction = {
  label: string;
  /** `close` leaves the feed (back to the home screen) and counts as
      heeded — the "you actually stopped" outcome, without a mission
      attached. */
  kind: "dismiss" | "snooze" | "mission" | "goAfk" | "acceptMission" | "close";
};

/* What actually earns each nudge. These are conditions on real signals
   from the simulator — seconds spent inside the feed, screenfuls
   scrolled, apps opened — not positions on a timeline. A nudge that
   fires on a stopwatch regardless of what you did is a screensaver;
   the whole claim of the feature is that the behaviour triggers it. */
export type NudgeCondition =
  | { kind: "dwell"; seconds: number }
  | { kind: "switches"; count: number }
  | { kind: "scroll"; screens: number };

export type Nudge = {
  id: string;
  trigger: NudgeTrigger;
  tier: NudgeTier;
  /** A warning about what you're doing, or AFK handing you a mission it
      just wrote. Same delivery, opposite vector — so the mission notice
      never wears a warning tier's colour. */
  kind?: "nudge" | "missionCreated";
  /** The behaviour that earns it. */
  when: NudgeCondition;
  /** Colour never carries meaning alone — every tier ships a glyph. */
  icon: "eye" | "clock" | "alertTriangle" | "moon" | "target";
  headline: string;
  body: string;
  /** The measurement behind the claim. */
  evidence: string;
  missionId?: string;
  actions: NudgeAction[];
  /** Tiers 1–3 are non-modal banners. Only the hard stop takes over. */
  present: "banner" | "alert";
  autoDismissMs: number | null;
};

/* What the Briefing reads back in the morning. The outcome is the whole
   point — a nudge you dismissed is more interesting than one you heeded,
   because it's the one that cost you the mission. */
export type NudgeRecord = {
  nudgeId: string;
  tier: NudgeTier;
  at: string;
  outcome: "heeded" | "snoozed" | "ignored";
  missionId?: string;
};

/* One escalation, all about the reels session you're in right now. It
   starts by noticing, gets firmer as the minutes stack up, and — if you
   keep going past an hour — ends with `missionRules` handing you a
   mission. Nothing here references a streak or a mission you haven't
   set; the behaviour in front of you is the whole story. */
export const nudges: Nudge[] = [
  {
    id: "n1",
    trigger: "doomscroll",
    tier: 1,
    // A couple of screenfuls in without stopping on anything.
    when: { kind: "scroll", screens: 2 },
    icon: "eye",
    headline: "You've been scrolling ShortReel for 8 minutes.",
    body: "Nothing brought you here — no notification, no message. Just reflex.",
    evidence: "8 min · nothing behind it",
    actions: [{ label: "Got it", kind: "dismiss" }],
    present: "banner",
    autoDismissMs: 5000,
  },
  {
    id: "n2",
    trigger: "churn",
    tier: 2,
    // You bounced out to other apps and came straight back.
    when: { kind: "switches", count: 3 },
    icon: "clock",
    headline: "Same three apps, on a loop.",
    body: "ShortReel → Mail → Slack → ShortReel. That's nine switches in four minutes, all landing back here.",
    evidence: "9 switches · 4 min",
    actions: [
      { label: "Got it", kind: "dismiss" },
      { label: "Mute for an hour", kind: "snooze" },
    ],
    present: "banner",
    autoDismissMs: 7000,
  },
  {
    id: "n3",
    trigger: "doomscroll",
    tier: 3,
    // Twenty unbroken minutes in the feed.
    when: { kind: "dwell", seconds: 20 },
    icon: "clock",
    headline: "20 minutes straight in ShortReel.",
    body: "No breaks, nothing you were looking for. Want to close it before it turns into an hour?",
    evidence: "20 min · no breaks",
    actions: [
      { label: "Close ShortReel", kind: "close" },
      { label: "Five more minutes", kind: "snooze" },
    ],
    present: "banner",
    autoDismissMs: null,
  },
  {
    id: "n4",
    trigger: "doomscroll",
    tier: 4,
    // Half an hour in, and still going.
    when: { kind: "dwell", seconds: 38 },
    icon: "moon",
    headline: "Half an hour of ShortReel, back to back.",
    body: "You opened it after 11 and haven't put it down. I can lock it and hold your notifications until morning — say the word.",
    evidence: "26 min · after 11pm",
    actions: [
      { label: "Lock it till 7am", kind: "goAfk" },
      { label: "Keep scrolling", kind: "dismiss" },
    ],
    present: "banner",
    autoDismissMs: null,
  },
];

/* ---- Mission rules ----------------------------------------------------
   Where missions come from. A rule watches the same live signals the
   nudges do; crossing it doesn't warn you, it *writes a mission* —
   an hour unbroken in a feed buys you a walk tomorrow.

   Nudges defend a mission that already exists. This is the step before
   that: the behaviour producing the mission in the first place. */

/* A mission written in front of you, stamped with the measurement that
   wrote it. The static `Mission.origin` is the fallback; this is what
   actually happened tonight. */
export type CreatedMission = {
  missionId: string;
  ruleId: string;
  /** What crossed the line, measured at the moment it crossed. */
  observed: string;
  /** Fiction clock time of the crossing. */
  at: string;
};

export type MissionRule = {
  id: string;
  behaviourId: BehaviourId;
  /** The mission this crossing writes. */
  missionId: string;
  /** The line, expressed in signals the simulator actually emits. */
  when: NudgeCondition;
  /** The same line in words, quoted on the mission it writes. */
  threshold: string;
  /** What AFK posts the moment it crosses. `evidence` is replaced at
      fire time with the measurement that actually crossed it. */
  notice: Nudge;
};

/* 90 seconds of dwell is 60 fiction minutes (see
   FICTION_MINUTES_PER_SECOND in nudge-context) — so you have to ignore
   the hard stop and keep scrolling to get here, which is exactly the
   behaviour the mission treats. */
export const missionRules: MissionRule[] = [
  {
    id: "r-doomscroll",
    behaviourId: "doomscroll",
    missionId: "m3",
    when: { kind: "dwell", seconds: 90 },
    threshold: "60+ min unbroken in a feed app",
    notice: {
      id: "r-doomscroll",
      trigger: "doomscroll",
      tier: 1,
      kind: "missionCreated",
      when: { kind: "dwell", seconds: 90 },
      icon: "target",
      headline: "A full hour in ShortReel. Here's a mission.",
      body: "That's your third run past an hour this week. Tomorrow: a 20-minute walk before ShortReel opens — I'll hold the app until you're back.",
      evidence: "1h straight · 3rd this week",
      missionId: "m3",
      actions: [
        { label: "Take it on", kind: "acceptMission" },
        { label: "Not now", kind: "dismiss" },
      ],
      present: "banner",
      autoDismissMs: null,
    },
  },
];

/* Coral *tint* is your own behaviour; coral *fill* (card-alert) is
   someone else needing you. Never a nudge on card-alert — that beat
   belongs to the breakthrough. */
export const nudgeTierTheme: Record<
  NudgeTier,
  { chip: string; stripe: string; label: string }
> = {
  1: { chip: "bg-fill-2 text-label-2", stripe: "bg-fill-1", label: "Noticing" },
  2: {
    chip: "bg-accent-dim text-accent-text",
    stripe: "bg-accent",
    label: "Pattern",
  },
  3: {
    chip: "bg-coral-dim text-coral-text",
    stripe: "bg-coral",
    label: "Still scrolling",
  },
  4: {
    chip: "bg-coral-dim text-coral-text",
    stripe: "bg-coral",
    label: "Hard stop",
  },
};

/* Not a fifth tier. The four tiers escalate a warning; this one hands
   you something — so it reads mint, the way every other "AFK did a
   thing for you" surface in the app does. */
export const missionCreatedTheme = {
  chip: "bg-mint-dim text-mint-text",
  stripe: "bg-mint",
  label: "Mission written",
};

/* The fake phone the simulator puts you inside: a home screen you tap
   out of, not a button that says "pretend you're scrolling". App-hopping
   has to be something you *do* — the churn nudge lands differently when
   you caused it.

   ShortReel is already the 70%-compulsive app in `lensApps`, so the sim
   and the chart agree with each other. */

export type SimApp = {
  id: string;
  name: string;
  /** Key into `simMarks` in components/demo/sim-icons.tsx. */
  icon: string;
  /** Inline background, same idiom as `lensApps`. iOS icons are a
      single hue, lighter at the top — not a two-colour diagonal. */
  color: string;
  dock?: boolean;
  /** The artwork *is* the tile (Calendar's page, Notes' paper, the map)
      so it draws edge to edge. Glyph-on-a-field icons (Mail, Music) sit
      inset instead. Getting this wrong is what made Notes render as a
      floating yellow bar rather than a header band. */
  bleed?: boolean;
  /** The doomscroll app. Everything else is a stub you bounce off. */
  feed?: boolean;
  /** What the stub screen says when you open it. */
  stub?: string;
  badge?: number;
};

export const simApps: SimApp[] = [
  /* Backgrounds mirror the real apps: most are a white tile carrying a
     coloured mark; only Mail/Messages/Phone/Music/ShortReel are a
     saturated tile with a white glyph. */
  {
    id: "shortreel",
    name: "ShortReel",
    icon: "play",
    color: "linear-gradient(180deg, #2a2a2e 0%, #08080a 100%)",
    feed: true,
    badge: 12,
  },
  { id: "mail", name: "Mail", icon: "mail", color: "linear-gradient(180deg, #52b1ff 0%, #1a76e8 100%)", badge: 3, stub: "3 unread. None of them are for tonight." },
  { id: "slack", name: "Slack", icon: "hash", color: "#ffffff", bleed: true, stub: "Your team is asleep. Your dot is green anyway." },
  { id: "photos", name: "Photos", icon: "photos", color: "#ffffff", bleed: true, stub: "One year ago today, you were outside." },
  { id: "maps", name: "Maps", icon: "map", color: "#ffffff", bleed: true, stub: "You are at home. You have been all evening." },
  { id: "music", name: "Music", icon: "music", color: "linear-gradient(180deg, #fc5c65 0%, #eb2f4b 100%)", stub: "Nothing playing." },
  { id: "notes", name: "Notes", icon: "notes", color: "#ffffff", bleed: true, stub: "“things to do tomorrow” — last edited 6 days ago." },
  { id: "settings", name: "Settings", icon: "gear", color: "linear-gradient(180deg, #a9adb5 0%, #71757d 100%)", stub: "Screen Time: you already know." },
  /* A third row, so the grid fills like a real springboard. Two rows
     floating above a void is the tell that it's a mockup. */
  { id: "calendar", name: "Calendar", icon: "calendar", color: "#ffffff", bleed: true, stub: "Nothing until 9am tomorrow." },
  { id: "camera", name: "Camera", icon: "camera", color: "linear-gradient(180deg, #7d818a 0%, #4a4d54 100%)", stub: "Last photo: a screenshot of a post." },
  { id: "clock", name: "Clock", icon: "clock", color: "linear-gradient(180deg, #2c2e33 0%, #0e0f12 100%)", bleed: true, stub: "Alarm set for 6:40am. In 7 hours 36 minutes." },
  { id: "weather", name: "Weather", icon: "weather", color: "linear-gradient(180deg, #4aa8f0 0%, #1f6fd0 100%)", bleed: true, stub: "Clear, 24°. You have not been outside since 6pm." },
  /* A fourth row. Twelve apps left a dead void in the lower half — real
     home screens are full, and the emptiness read as a mockup. */
  { id: "health", name: "Health", icon: "health", color: "#ffffff", bleed: true, stub: "You walked 2,140 steps today. Your weekly average is 6,800." },
  { id: "podcasts", name: "Podcasts", icon: "podcasts", color: "linear-gradient(180deg, #b07ae0 0%, #7d3fc4 100%)", stub: "3 episodes downloaded. None played." },
  { id: "appstore", name: "App Store", icon: "appstore", color: "linear-gradient(180deg, #2fa4ff 0%, #0a63c9 100%)", stub: "7 updates available." },
  { id: "reminders", name: "Reminders", icon: "reminders", color: "#ffffff", bleed: true, stub: "“Call the dentist” — moved 4 times." },
  { id: "phone", name: "Phone", icon: "phone", color: "linear-gradient(180deg, #5ee07a 0%, #23bf47 100%)", dock: true, stub: "No missed calls. Nobody is trying to reach you." },
  { id: "browser", name: "Safari", icon: "compass", color: "#ffffff", bleed: true, dock: true, stub: "14 tabs. You will not read any of them." },
  { id: "messages", name: "Messages", icon: "message", color: "linear-gradient(180deg, #5ee07a 0%, #23bf47 100%)", dock: true, badge: 1, stub: "Mom, 8:14pm. You'll reply tomorrow." },
  {
    id: "afk",
    name: "AFK",
    icon: "afk",
    color: "linear-gradient(180deg, #ffb04d 0%, #f07800 100%)",
    dock: true,
    stub: "You're already here.",
  },
];

/* The sim opens at 11:04pm. A mission written 60 fiction minutes in is
   stamped 12:04am — and crossing midnight inside a feed is the point,
   so the timestamp has to be computed rather than guessed. */
const SIM_START_MINUTES = 23 * 60 + 4;

export function simClockAt(minutesInApp: number) {
  const total = (SIM_START_MINUTES + minutesInApp) % (24 * 60);
  const h24 = Math.floor(total / 60);
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(total % 60).padStart(2, "0");
  return `${h}:${mm}${h24 < 12 ? "am" : "pm"}`;
}

export function formatMinutes(mins: number) {
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

export const simSession = {
  app: "ShortReel",
  clock: "11:04pm",
  posts: [
    { id: "p1", handle: "@nightowl.clips", caption: "6 things you didn't know about your houseplant", meta: "1.2M views" },
    { id: "p2", handle: "@kitchenspeedrun", caption: "Dinner in 47 seconds (you will not make this)", meta: "890K views" },
    { id: "p3", handle: "@oddlysatisfying", caption: "Watch this loop 40 times, apparently", meta: "3.4M views" },
    { id: "p4", handle: "@debate.club", caption: "Someone is wrong and 4,000 people are arguing", meta: "612K views" },
    { id: "p5", handle: "@catsofshortreel", caption: "He does this every night at 11", meta: "2.1M views" },
    { id: "p6", handle: "@nightowl.clips", caption: "Part 2 of the thing you never finished part 1 of", meta: "740K views" },
  ],
};
