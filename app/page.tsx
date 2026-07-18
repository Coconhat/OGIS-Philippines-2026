"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PhoneMock } from "@/components/phone-mock";
import {
  BellIllo,
  BubblesIllo,
  CallIllo,
  DialIllo,
  FlagIllo,
  InboxIllo,
  LockIllo,
  MoonIllo,
} from "@/components/illustrations";
import { IconArrowRight, IconCheck, IconMoon } from "@/components/icons";

const features = [
  {
    illo: BubblesIllo,
    title: "Replies while you're gone",
    body: "Friendly holding replies to anything that can wait — always signed as your assistant.",
  },
  {
    illo: BellIllo,
    title: "Real emergencies ring through",
    body: "A fire alarm, not a doorbell. Mom at 2am gets through. Spam never does.",
  },
  {
    illo: CallIllo,
    title: "Calls get a receptionist",
    body: "AFK answers, takes a message, and books callbacks around your calendar.",
  },
  {
    illo: DialIllo,
    title: "You set the dial",
    body: "From just watching to handling it all — per person, per app. Never money, never contracts.",
  },
  {
    illo: FlagIllo,
    title: "Missions worth leaving for",
    body: "Phone-free dinners, morning walks, real streaks. Share the proof, not the screenshots.",
  },
  {
    illo: InboxIllo,
    title: "A 20-second welcome back",
    body: "One tidy digest instead of 200 notifications. Anything it did, you can undo.",
  },
  {
    illo: MoonIllo,
    title: "It knows when you're fried",
    body: "Short sleep, long nights of replies? AFK schedules the break — then guards it.",
  },
  {
    illo: LockIllo,
    title: "Nothing leaves your phone",
    body: "The AI lives on your device. No cloud, no account, nobody reading your messages.",
  },
];

const vignette = [
  { who: "FlashDeals", msg: "48-HOUR SALE — everything must go!", tag: "Muted", cls: "bg-canvas text-ink-soft" },
  { who: "Priya · Slack", msg: "“which Figma file is the latest?”", tag: "Replied", cls: "bg-sky-soft text-sky" },
  { who: "Dentist · SMS", msg: "“Reply YES to confirm tomorrow 9:00”", tag: "Confirmed", cls: "bg-mint-soft text-mint" },
  { who: "Mom", msg: "“Call me when you see this.”", tag: "Rang through", cls: "bg-coral text-white", hot: true },
];

const SLIDES = 4;

function Wordmark() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span className="wallpaper grid size-9 place-items-center rounded-[12px] text-white shadow-card">
        <IconMoon size={19} strokeWidth={2.4} />
      </span>
      <span className="text-xl font-black tracking-tight">afk</span>
    </Link>
  );
}

export default function Landing() {
  const deckRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const lockRef = useRef(0);

  const go = useCallback((i: number) => {
    const deck = deckRef.current;
    if (!deck) return;
    const next = Math.max(0, Math.min(SLIDES - 1, i));
    idxRef.current = next;
    setIdx(next);
    deck.scrollTo({ left: next * deck.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    const onWheel = (e: WheelEvent) => {
      const vertical = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
      const delta = vertical ? e.deltaY : e.deltaX;
      // Let a slide finish its own vertical scroll before paging.
      if (vertical) {
        const slide = deck.children[idxRef.current] as HTMLElement | undefined;
        const inner = slide?.querySelector<HTMLElement>("[data-scroll]");
        if (inner) {
          const canDown =
            inner.scrollTop + inner.clientHeight < inner.scrollHeight - 2;
          const canUp = inner.scrollTop > 2;
          if ((e.deltaY > 0 && canDown) || (e.deltaY < 0 && canUp)) return;
        }
      }
      e.preventDefault();
      const now = Date.now();
      if (Math.abs(delta) < 10 || now - lockRef.current < 650) return;
      lockRef.current = now;
      go(idxRef.current + (delta > 0 ? 1 : -1));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") go(idxRef.current + 1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(idxRef.current - 1);
    };

    // Keep the dots honest when the user swipes natively (touch).
    const onScroll = () => {
      const i = Math.round(deck.scrollLeft / deck.clientWidth);
      if (i !== idxRef.current) {
        idxRef.current = i;
        setIdx(i);
      }
    };

    deck.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    deck.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      deck.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      deck.removeEventListener("scroll", onScroll);
    };
  }, [go]);

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-40 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Wordmark />
        <p className="hidden text-sm font-bold text-ink-soft md:block">
          <span className="font-black text-ink">1,204,317</span> hours reclaimed
          and counting
        </p>
        <div className="flex items-center gap-2.5">
          <Link
            href="/demo"
            className="hidden rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-extrabold transition-colors duration-200 hover:border-ink-faint sm:block"
          >
            Try it
          </Link>
          <button
            onClick={() => go(3)}
            className="cursor-pointer rounded-full bg-ink px-5 py-2.5 text-sm font-extrabold text-white transition-colors duration-200 hover:bg-night-2"
          >
            Get AFK
          </button>
        </div>
      </header>

      {/* Horizontal deck */}
      <div
        ref={deckRef}
        className="carousel h-full w-full"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {/* Slide 1 — Hero */}
        <section className="h-full w-screen">
          <div data-scroll className="h-full overflow-y-auto">
            <div className="mx-auto grid min-h-full w-full max-w-6xl items-center gap-10 px-5 pt-24 pb-20 lg:grid-cols-2 lg:gap-8 lg:pt-16">
              <div className="text-center lg:order-2 lg:text-left">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft">
                  Now in private beta
                  <span className="size-2 rounded-full bg-mint" />
                </p>
                <h1 className="mt-5 text-[2.75rem] leading-[1.04] font-black tracking-tight sm:text-6xl">
                  Your phone,
                  <br />
                  but quieter.
                </h1>
                <p className="mx-auto mt-5 max-w-[38ch] text-[17px] leading-relaxed font-semibold text-ink-soft lg:mx-0">
                  AFK holds your place while you're away — replying to what can
                  wait, and ringing only for what can't.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2.5 rounded-full bg-ink px-8 py-4 text-[17px] font-extrabold text-white shadow-pop transition-all duration-200 hover:bg-night-2 hover:shadow-card"
                  >
                    Try the interactive demo
                    <IconArrowRight size={19} />
                  </Link>
                  <p className="text-[13px] font-bold text-ink-faint">
                    Free while in beta · everything stays on your phone
                  </p>
                </div>
              </div>
              <div className="relative lg:order-1">
                <PhoneMock />
                <p className="hand absolute top-[54%] left-2 hidden -rotate-6 text-[22px] lg:block xl:left-12">
                  replies for you ↘
                </p>
                <p className="hand absolute right-4 -bottom-9 hidden rotate-2 text-[22px] lg:block xl:right-16">
                  ↖ only Mom rings through
                </p>
                <p className="hand mt-5 text-center text-[21px] lg:hidden">
                  ↑ it replies — only Mom rings through
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 2 — Features, two rows like the inspo */}
        <section className="h-full w-screen">
          <div data-scroll className="h-full overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center px-5 pt-24 pb-20 lg:pt-20">
              <h2 className="text-center text-[1.9rem] leading-tight font-black tracking-tight sm:text-4xl">
                It's got you covered.
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {features.map((f) => (
                  <article
                    key={f.title}
                    className="rounded-card border border-line bg-surface p-4 shadow-card transition-shadow duration-200 hover:shadow-pop sm:p-6"
                  >
                    <div className="mx-auto mb-3 w-[96px] sm:mb-4 sm:w-[130px]">
                      <f.illo />
                    </div>
                    <h3 className="text-center text-[13.5px] leading-snug font-extrabold sm:text-[16px]">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 hidden text-center text-[13px] leading-relaxed font-semibold text-ink-soft sm:block">
                      {f.body}
                    </p>
                    <p className="mt-1 text-center text-[11px] leading-relaxed font-semibold text-ink-soft sm:hidden">
                      {f.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Slide 3 — See it in action (white, like the hero) */}
        <section className="h-full w-screen">
          <div data-scroll className="h-full overflow-y-auto">
            <div className="mx-auto grid min-h-full w-full max-w-6xl items-center gap-10 px-5 pt-24 pb-20 lg:grid-cols-2 lg:pt-16">
              <div className="text-center lg:text-left">
                <h2 className="text-[2.2rem] leading-[1.05] font-black tracking-tight sm:text-5xl">
                  See it hold
                  <br /> the line.
                </h2>
                <p className="mx-auto mt-4 max-w-[36ch] text-[16px] leading-relaxed font-semibold text-ink-soft lg:mx-0">
                  Tap “Go AFK” and watch six real messages get read, judged, and
                  handled — live. No signup, nothing sent.
                </p>
                <Link
                  href="/demo"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-extrabold text-white shadow-pop transition-colors duration-200 hover:bg-night-2"
                >
                  Open the demo
                  <IconArrowRight size={18} />
                </Link>
                <p className="hand mt-4 text-[20px] text-ink-soft lg:pl-2">
                  every card below is a tap away →
                </p>
              </div>
              <div className="space-y-3">
                {vignette.map((n) => (
                  <div
                    key={n.who}
                    className={`flex items-center justify-between gap-3 rounded-2xl px-5 py-4 shadow-card ${
                      n.hot
                        ? "border border-coral/40 bg-coral-soft"
                        : "border border-line bg-surface"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-extrabold text-ink">
                        {n.who}
                      </p>
                      <p className="truncate text-[13px] font-semibold text-ink-soft">
                        {n.msg}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-extrabold ${n.cls}`}
                    >
                      {n.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Slide 4 — Pricing + footer */}
        <section className="h-full w-screen">
          <div data-scroll className="h-full overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center px-5 pt-24 pb-20 lg:pt-20">
              <div className="text-center">
                <h2 className="text-[1.9rem] leading-tight font-black tracking-tight sm:text-4xl">
                  Simple, like it should be.
                </h2>
                <p className="mt-2 text-[15px] font-semibold text-ink-soft">
                  Success is measured in hours reclaimed — not hours in the app.
                </p>
              </div>
              <div className="mx-auto mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
                <div className="rounded-card border border-line bg-surface p-7 shadow-card">
                  <p className="text-sm font-extrabold tracking-widest text-ink-faint uppercase">
                    Free
                  </p>
                  <p className="mt-2 text-4xl font-black">$0</p>
                  <ul className="mt-5 space-y-2.5 text-[14px] font-semibold text-ink-soft">
                    {[
                      "Message triage on 2 apps",
                      "Polite holding replies",
                      "Emergency breakthrough",
                      "The weekly Lens story",
                    ].map((li) => (
                      <li key={li} className="flex items-center gap-2.5">
                        <IconCheck
                          size={15}
                          strokeWidth={3}
                          className="shrink-0 text-ink-faint"
                        />
                        {li}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative rounded-card border-2 border-accent bg-surface p-7 shadow-pop">
                  <span className="absolute -top-3.5 left-6 rounded-full bg-accent px-3.5 py-1 text-xs font-extrabold text-white">
                    Most popular
                  </span>
                  <p className="text-sm font-extrabold tracking-widest text-accent-deep uppercase">
                    Pro
                  </p>
                  <p className="mt-2 text-4xl font-black">
                    $6
                    <span className="text-lg font-extrabold text-ink-faint">
                      /mo
                    </span>
                  </p>
                  <ul className="mt-5 space-y-2.5 text-[14px] font-semibold text-ink-soft">
                    {[
                      "Every app, every channel",
                      "Full autonomy — it can act for you",
                      "Front Desk answers your calls",
                      "Missions, streaks & the feed",
                    ].map((li) => (
                      <li key={li} className="flex items-center gap-2.5">
                        <IconCheck
                          size={15}
                          strokeWidth={3}
                          className="shrink-0 text-accent"
                        />
                        {li}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-6 text-center text-[13px] font-bold text-ink-soft">
                Running a team?{" "}
                <span className="text-ink underline decoration-accent decoration-2 underline-offset-4">
                  AFK for Teams
                </span>{" "}
                turns “right to disconnect” from a policy into a habit.
              </p>
              <footer className="mt-10 flex flex-col items-center gap-2 text-center">
                <Wordmark />
                <p className="text-[13px] font-semibold text-ink-soft">
                  The best notification is the one you never got.
                </p>
                <p className="text-xs font-bold text-ink-faint">
                  Made by Team x-o3 · concept demo — every message here is
                  simulated, nothing is ever sent.
                </p>
              </footer>
            </div>
          </div>
        </section>
      </div>

      {/* Slide dots */}
      <nav
        aria-label="Sections"
        className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-2 shadow-card backdrop-blur"
      >
        {["Home", "Features", "Demo", "Pricing"].map((label, i) => (
          <button
            key={label}
            onClick={() => go(i)}
            aria-label={label}
            aria-current={idx === i ? "true" : undefined}
            className={`cursor-pointer rounded-full transition-all duration-300 ${
              idx === i ? "h-2 w-6 bg-accent" : "size-2 bg-line hover:bg-ink-faint"
            }`}
          />
        ))}
      </nav>

      {idx < SLIDES - 1 && (
        <p className="hand absolute right-6 bottom-4 z-40 hidden text-[20px] lg:block">
          scroll →
        </p>
      )}
    </div>
  );
}
