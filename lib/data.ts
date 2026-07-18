export type Verdict = "suppress" | "reply" | "act" | "escalate";

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
  verdict: Verdict;
  aiAction: string;
  aiReply?: string;
};

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
    verdict: "suppress",
    aiAction: "Suppressed. Folded into your return digest.",
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
    verdict: "reply",
    aiAction: "Answered from approved knowledge, disclosed as AI.",
    aiReply:
      "Hi Priya — I'm Nhat's AFK assistant. The latest onboarding flow is in “Onboarding v4 – final”, updated Tuesday. Nhat is offline until 7pm; want me to flag this for their return?",
  },
  {
    id: "ev-dentist",
    channel: "Telegram",
    sender: "Bright Smile Dental",
    senderRole: "Service · appointments",
    avatar: "BS",
    preview: "Reminder: cleaning tomorrow 9:00. Reply YES to confirm or call to reschedule.",
    intent: "Confirmation request",
    urgency: "low",
    trust: "known",
    deviation: "Expected reminder",
    verdict: "act",
    aiAction: "Confirmed against calendar — tomorrow 9:00 is free.",
    aiReply: "YES — confirmed for 9:00. (Sent by Nhat's AFK assistant.)",
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
    verdict: "reply",
    aiAction: "Held the line. Asked what specifically is needed before 9am.",
    aiReply:
      "Marcus — Nhat is offline until 7pm (AFK assistant here). The deck's latest export is in the shared drive. Is anything blocking you that truly can't wait until 7?",
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
    verdict: "suppress",
    aiAction: "Front Desk answered, identified itself, took no message. Logged.",
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
    verdict: "escalate",
    aiAction: "BREAKTHROUGH — bypassed Do Not Disturb and rang through.",
  },
];

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
  level: number;
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

export type Mission = {
  id: string;
  title: string;
  why: string;
  reward: string;
  progress: number; // 0..1
  goal: string;
  icon: "moon" | "sun" | "heart" | "target";
};

export const missions: Mission[] = [
  {
    id: "m1",
    title: "No social apps after 11pm",
    why: "Generated from your Lens: 70% of your late-night opens had no notification behind them.",
    reward: "+3h reclaimed · Night Owl badge",
    progress: 2 / 3,
    goal: "3 nights · 2 done",
    icon: "moon",
  },
  {
    id: "m2",
    title: "One phone-free dinner",
    why: "You checked Slack 14 times during dinners last week.",
    reward: "+2h reclaimed · Present badge",
    progress: 0,
    goal: "This week",
    icon: "heart",
  },
  {
    id: "m3",
    title: "Replace the Sunday scroll with a walk",
    why: "Sunday 9–11am is your longest doomscroll window.",
    reward: "+2h reclaimed · Fresh Air badge",
    progress: 0,
    goal: "Sunday morning",
    icon: "sun",
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

export const briefingHandled = [
  {
    id: "b1",
    who: "Priya N. · Slack",
    what: "Answered: latest onboarding flow is in “Onboarding v4 – final”.",
    verdict: "reply" as Verdict,
  },
  {
    id: "b2",
    who: "Bright Smile Dental · Telegram",
    what: "Confirmed tomorrow's 9:00 cleaning against your calendar.",
    verdict: "act" as Verdict,
  },
  {
    id: "b3",
    who: "Marcus L. · Slack",
    what: "Held the line on “urgent deck” — pointed him to the shared drive.",
    verdict: "reply" as Verdict,
  },
  {
    id: "b4",
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
