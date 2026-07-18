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
  {
    who: "FlashDeals",
    msg: "48-HOUR SALE — everything must go!",
    tag: "Muted",
    cls: "bg-canvas text-ink-soft",
  },
  {
    who: "Priya · Slack",
    msg: "“which Figma file is the latest?”",
    tag: "Replied",
    cls: "bg-sky-soft text-sky",
  },
  {
    who: "Dentist · SMS",
    msg: "“Reply YES to confirm tomorrow 9:00”",
    tag: "Confirmed",
    cls: "bg-mint-soft text-mint",
  },
  {
    who: "Mom",
    msg: "“Call me when you see this.”",
    tag: "Rang through",
    cls: "bg-coral text-white",
    hot: true,
  },
];

const SLIDES = 5;

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
  const targetRef = useRef(0);
  const rafRef = useRef(0);

  // Smooth, continuous horizontal scroll: wheel input moves a target,
  // a lerp loop eases the deck toward it (Keeby-style glide, no snapping).
  const kick = useCallback(() => {
    const deck = deckRef.current;
    if (!deck || rafRef.current) return;
    const tick = () => {
      const d = targetRef.current - deck.scrollLeft;
      if (Math.abs(d) > 0.5) {
        deck.scrollLeft += d * 0.11;
        rafRef.current = requestAnimationFrame(tick);
      } else {
        deck.scrollLeft = targetRef.current;
        rafRef.current = 0;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const go = useCallback(
    (i: number) => {
      const deck = deckRef.current;
      if (!deck) return;
      targetRef.current =
        Math.max(0, Math.min(SLIDES - 1, i)) * deck.clientWidth;
      kick();
    },
    [kick],
  );

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    // Mobile is a plain vertical page — no horizontal hijacking below lg.
    const mq = window.matchMedia("(min-width: 1024px)");
    targetRef.current = deck.scrollLeft;

    const maxLeft = () => deck.scrollWidth - deck.clientWidth;

    const onWheel = (e: WheelEvent) => {
      if (!mq.matches) return;
      const vertical = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
      // Let a slide finish its own vertical scroll before gliding sideways.
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
      const delta = vertical ? e.deltaY : e.deltaX;
      targetRef.current = Math.max(
        0,
        Math.min(maxLeft(), targetRef.current + delta * 1.7),
      );
      kick();
    };

    const onKey = (e: KeyboardEvent) => {
      if (!mq.matches) return;
      if (e.key === "ArrowRight" || e.key === "PageDown")
        go(idxRef.current + 1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(idxRef.current - 1);
    };

    const onScroll = () => {
      // Touch/native scrolls move the deck directly — keep the target synced.
      if (!rafRef.current) targetRef.current = deck.scrollLeft;
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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [go, kick]);

  return (
    <div className="relative w-full lg:h-dvh lg:overflow-hidden">
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
        </div>
      </header>

      {/* Vertical page on mobile; free-gliding horizontal deck on desktop */}
      <div
        ref={deckRef}
        className="carousel w-full max-lg:flex-col max-lg:overflow-visible lg:h-full"
        style={{ scrollSnapType: "none" }}
      >
        {/* Slide 1 — Hero */}
        <section className="w-screen lg:h-full">
          <div data-scroll className="lg:h-full lg:overflow-y-auto">
            <div className="mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-5 pt-24 pb-20 lg:grid-cols-2 lg:gap-8 lg:pt-16">
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
        <section className="w-screen lg:h-full">
          <div data-scroll className="lg:h-full lg:overflow-y-auto">
            <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-5 pt-24 pb-20 lg:pt-20">
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
        <section className="w-screen lg:h-full">
          <div data-scroll className="lg:h-full lg:overflow-y-auto">
            <div className="mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-5 pt-24 pb-20 lg:grid-cols-2 lg:pt-16">
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
                {vignette.map((n, i) => (
                  <div
                    key={n.who}
                    className={`vign-card flex items-center justify-between gap-3 rounded-2xl px-5 py-4 shadow-card ${
                      n.hot
                        ? "border border-coral/40 bg-coral-soft"
                        : "border border-line bg-surface"
                    }`}
                    style={{ animationDelay: `${i * 0.55}s` }}
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
                      className={`vign-pill shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-extrabold ${n.cls}`}
                      style={{ animationDelay: `${i * 0.55 + 0.35}s` }}
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
        <section className="w-screen lg:h-full">
          <div data-scroll className="lg:h-full lg:overflow-y-auto">
            <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-5 pt-24 pb-20 lg:pt-20">
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
            </div>
          </div>
        </section>

        {/* Slide 5 — The end page, Keeby style */}
        <section className="w-screen lg:h-full">
          <div data-scroll className="lg:h-full lg:overflow-y-auto">
            <div className="mx-auto grid min-h-dvh w-full max-w-6xl content-center gap-12 px-5 pt-24 pb-20 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
              <div className="text-center lg:text-left">
                <h2 className="text-[2.6rem] leading-[1.05] font-black tracking-tight sm:text-6xl">
                  Try it.
                  <br />
                  You'll feel the difference.
                </h2>
                <p className="mx-auto mt-5 max-w-[40ch] text-[16px] font-semibold text-ink-soft lg:mx-0">
                  Made by Team x-03 for OGIS 2026.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2.5 rounded-full bg-ink px-8 py-4 text-[17px] font-extrabold text-white shadow-pop transition-all duration-200 hover:bg-night-2 hover:shadow-card"
                  >
                    <IconMoon size={19} />
                    Try the interactive demo
                  </Link>
                  <p className="text-[13px] font-bold text-ink-faint">
                    Requires a phone — and somewhere better to be.
                  </p>
                </div>
              </div>
              <footer className="flex flex-col items-center gap-2.5 text-[14px] font-bold text-ink-soft lg:items-end lg:text-right">
                <p className="text-ink-faint">© 2026 AFK · Team x-o3</p>
                {["Updates", "Privacy", "Support", "App Store"].map((l) => (
                  <a
                    key={l}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="transition-colors duration-150 hover:text-ink"
                  >
                    {l}
                  </a>
                ))}
                <p className="mt-3 max-w-[34ch] text-xs font-semibold text-ink-faint lg:text-right">
                  Concept demo — every message here is simulated, nothing is
                  ever sent.
                </p>
              </footer>
            </div>
          </div>
        </section>
      </div>

      {/* Slide dots */}
      <nav
        aria-label="Sections"
        className="absolute bottom-4 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-2 shadow-card backdrop-blur lg:flex"
      >
        {["Home", "Features", "Demo", "Pricing", "Get it"].map((label, i) => (
          <button
            key={label}
            onClick={() => go(i)}
            aria-label={label}
            aria-current={idx === i ? "true" : undefined}
            className={`cursor-pointer rounded-full transition-all duration-300 ${
              idx === i
                ? "h-2 w-6 bg-accent"
                : "size-2 bg-line hover:bg-ink-faint"
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
