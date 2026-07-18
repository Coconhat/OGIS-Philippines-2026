"use client";

import { useState } from "react";
import { useAfk } from "@/lib/afk-context";
import { feed, missions, type Mission } from "@/lib/data";
import {
  IconCamera,
  IconCheck,
  IconFlame,
  IconHeart,
  IconMoon,
  IconShield,
  IconSun,
  IconTarget,
} from "@/components/icons";

const missionIcon = {
  moon: IconMoon,
  sun: IconSun,
  heart: IconHeart,
  target: IconTarget,
};

const sceneStyle: Record<string, string> = {
  hike: "linear-gradient(135deg, #7fb069 0%, #4a7c59 55%, #2c5530 100%)",
  meal: "linear-gradient(135deg, #ffb45c 0%, #ff8c17 60%, #d95f02 100%)",
  book: "linear-gradient(135deg, #8ea6c8 0%, #5b729b 60%, #3b4a6b 100%)",
  run: "linear-gradient(135deg, #ff9a8b 0%, #ff6154 60%, #c73e33 100%)",
};

const sceneLabel: Record<string, string> = {
  hike: "🌲 out on the trail",
  meal: "🍜 dinner, phones away",
  book: "📖 paper pages",
  run: "🏃 morning air",
};

function MissionCard({ mission }: { mission: Mission }) {
  const { completedMissions, completeMission } = useAfk();
  const done = completedMissions.includes(mission.id);
  const Icon = missionIcon[mission.icon];
  const progress = done ? 1 : mission.progress;

  return (
    <article className="rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start gap-3">
        <div
          className={`grid size-11 shrink-0 place-items-center rounded-2xl transition-colors duration-300 ${
            done ? "bg-mint-soft text-mint" : "bg-accent-soft text-accent-deep"
          }`}
        >
          {done ? <IconCheck size={22} strokeWidth={2.6} /> : <Icon size={22} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold leading-snug">{mission.title}</p>
          <p className="mt-1 text-xs leading-relaxed font-semibold text-ink-soft">
            {mission.why}
          </p>
        </div>
      </div>
      <div className="mt-3.5 flex items-center justify-between text-[11px] font-bold text-ink-faint">
        <span>{done ? "Completed · shared to feed" : mission.goal}</span>
        <span className="text-accent-deep">{mission.reward}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas">
        <div
          className={`h-full rounded-full transition-all duration-700 ${done ? "bg-mint" : "bg-accent"}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      {!done && (
        <button
          onClick={() => completeMission(mission.id)}
          className="mt-3.5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-extrabold text-white transition-colors duration-200 hover:bg-night-2"
        >
          <IconCamera size={16} />
          Complete + snap proof
        </button>
      )}
    </article>
  );
}

export default function MissionsPage() {
  const { completedMissions } = useAfk();
  const [kudos, setKudos] = useState<Record<string, number>>({});

  const myPosts = missions
    .filter((m) => completedMissions.includes(m.id))
    .map((m) => ({
      id: `me-${m.id}`,
      author: "You",
      avatar: "Y",
      time: "just now",
      mission: m.title,
      caption: "Proof of life away from the screen.",
      offline: "mission protected by triage",
      kudos: 0,
      scene: "run" as const,
    }));

  const allPosts = [...myPosts, ...feed];

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Missions</h1>
          <p className="text-sm font-semibold text-ink-soft">
            Built from your own patterns.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3.5 py-1.5 text-sm font-black text-accent-deep">
          <IconFlame size={16} />
          {4 + completedMissions.length}-day streak
        </span>
      </header>

      <div className="wallpaper rounded-card px-5 py-4 shadow-card">
        <p className="flex items-center gap-2.5 text-[13px] font-extrabold text-white drop-shadow-sm">
          <IconShield size={16} className="shrink-0" />
          While a mission is active, triage automatically holds the line — the
          challenge is protected, not just promised.
        </p>
      </div>

      <section className="space-y-3">
        {missions.map((m) => (
          <MissionCard key={m.id} mission={m} />
        ))}
      </section>

      {/* Social feed */}
      <section>
        <h2 className="mb-1 text-lg font-black tracking-tight">The feed</h2>
        <p className="mb-3 text-xs font-semibold text-ink-soft">
          The only content allowed: proof of life away from the screen.
        </p>
        <div className="space-y-3">
          {allPosts.map((post) => {
            const k = kudos[post.id] ?? post.kudos;
            const liked = post.id in kudos;
            return (
              <article
                key={post.id}
                className="animate-rise overflow-hidden rounded-card border border-line bg-surface shadow-card"
              >
                <div
                  className="flex h-36 items-end p-4"
                  style={{ background: sceneStyle[post.scene] }}
                >
                  <span className="rounded-full bg-ink/45 px-3 py-1.5 text-xs font-extrabold text-white backdrop-blur-sm">
                    {sceneLabel[post.scene]}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-black ${
                        post.author === "You"
                          ? "bg-accent text-white"
                          : "bg-canvas text-ink-soft"
                      }`}
                    >
                      {post.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold">
                        {post.author}
                        <span className="ml-2 text-[11px] font-bold text-ink-faint">
                          {post.time}
                        </span>
                      </p>
                      <p className="truncate text-[11px] font-bold text-accent-deep">
                        {post.mission}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[13px] font-semibold text-ink">
                    {post.caption}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-ink-faint">
                      {post.offline}
                    </span>
                    <button
                      onClick={() =>
                        setKudos((prev) => ({
                          ...prev,
                          [post.id]: liked ? post.kudos : post.kudos + 1,
                        }))
                      }
                      aria-pressed={liked}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200 ${
                        liked
                          ? "bg-coral-soft text-coral"
                          : "bg-canvas text-ink-soft hover:bg-line/70"
                      }`}
                    >
                      <IconHeart
                        size={14}
                        fill={liked ? "currentColor" : "none"}
                      />
                      {k}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
