/* The hero phone: orange wallpaper, frosted lock-screen notifications. */

export function PhoneMock() {
  return (
    <div className="mx-auto w-[290px] rounded-[46px] bg-[#1d1d1f] p-[10px] shadow-[0_24px_60px_rgb(120_60_0/0.28)] sm:w-[310px]">
      <div className="wallpaper relative overflow-hidden rounded-[38px] px-4 pt-4 pb-6">
        {/* Dynamic island */}
        <div className="mx-auto mb-5 h-[26px] w-[92px] rounded-full bg-[#1d1d1f]" />

        {/* Lock clock */}
        <div className="text-center text-white">
          <p className="text-[13px] font-bold text-white/85">Friday, July 18</p>
          <p className="text-[64px] leading-none font-extrabold tracking-tight drop-shadow-sm">
            4:21
          </p>
        </div>

        {/* AFK status pill */}
        <div className="glass mx-auto mt-4 flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5">
          <span className="size-2 rounded-full bg-accent-deep animate-pulse-dot" />
          <span className="text-[12px] font-extrabold text-ink">
            AFK is holding your place
          </span>
        </div>

        {/* Notification stack */}
        <div className="mt-5 space-y-2">
          <div className="glass-faint rounded-2xl px-3.5 py-2.5 opacity-75">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-extrabold text-ink/80">FlashDeals</p>
              <p className="text-[10px] font-bold text-ink/50">muted</p>
            </div>
            <p className="truncate text-[11px] font-semibold text-ink/60">
              48-HOUR SALE — everything must go!
            </p>
          </div>

          <div className="glass rounded-2xl px-3.5 py-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-extrabold text-ink">Priya · Slack</p>
              <p className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-extrabold text-white">
                AFK replied
              </p>
            </div>
            <p className="truncate text-[11px] font-semibold text-ink-soft">
              “which Figma file is the latest?”
            </p>
            <p className="mt-1 truncate rounded-lg bg-white/70 px-2 py-1 text-[10px] font-bold text-ink-soft">
              ↳ “It's Onboarding v4 — I'm Nhat's assistant…”
            </p>
          </div>

          <div className="rounded-2xl border border-white/50 bg-[#ff6154]/85 px-3.5 py-2.5 shadow-[0_8px_24px_rgb(160_30_20/0.35)] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-extrabold text-white">Mom</p>
              <p className="text-[10px] font-extrabold tracking-wide text-white/90 uppercase">
                ringing through
              </p>
            </div>
            <p className="truncate text-[11px] font-semibold text-white/90">
              “Call me when you see this.”
            </p>
          </div>
        </div>

        {/* Home indicator */}
        <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-white/70" />
      </div>
    </div>
  );
}
