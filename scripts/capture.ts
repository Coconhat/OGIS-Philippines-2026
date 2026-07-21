/* Shoots every [data-cap] block on /capture as a 3x PNG for video editing.
   Requires the dev server on :3000.

     npx tsx scripts/capture.ts              # all blocks
     npx tsx scripts/capture.ts hero triage  # only ids matching these

   Output lands in capture-out/ (gitignored). Delete this script and
   app/capture/ together when the video is cut. */

import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const URL = process.env.CAPTURE_URL ?? "http://localhost:3000/capture";
const OUT = path.resolve(process.cwd(), "capture-out");
const SCALE = 3;

/* Animations are what make the mascot feel alive and what make a still
   capture non-deterministic. Freeze them at a legible frame.

   -10s lands the face animations (blink, scan, float, shake) on their
   resting expression, which is what they're authored to resolve to. The
   transient decorations are different: they fade in and out over their
   cycle, so an arbitrary frame catches them mid-fade or fully invisible.
   Each one below is pinned to its peak instead. */
const FREEZE = `
  *, *::before, *::after {
    animation-play-state: paused !important;
    animation-delay: -10s !important;
    transition: none !important;
  }
  /* dk-zzz peaks at 30% of 3.6s — anywhere else the z's are transparent */
  .dk-zzz { animation-delay: -1.08s !important; }
  /* dk-ring peaks at 0% of 1.6s and is gone by 70% */
  .dk-ring { animation-delay: -0.16s !important; }
  /* pulse-dot and fadepulse are at full opacity at 0% */
  .animate-pulse-dot, .anim-pulse { animation-delay: 0s !important; }
  /* The dev-tools indicator is fixed to the bottom-left of the viewport
     and paints into any block whose rectangle reaches it. */
  nextjs-portal { display: none !important; }
`;

async function main() {
  const filters = process.argv.slice(2);

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    deviceScaleFactor: SCALE,
    viewport: { width: 1600, height: 1200 },
  });

  const res = await page.goto(URL, { waitUntil: "networkidle" });
  if (!res || !res.ok()) {
    throw new Error(
      `Could not load ${URL} (${res?.status() ?? "no response"}). Is the dev server running?`,
    );
  }

  await page.addStyleTag({ content: FREEZE });
  // Let webfonts settle — Nunito and Caveat both load async.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const blocks = await page.$$("[data-cap]");
  if (blocks.length === 0) throw new Error("No [data-cap] blocks found.");

  const written: string[] = [];
  const skipped: string[] = [];

  for (const el of blocks) {
    const id = (await el.getAttribute("data-cap"))!;
    const bg = (await el.getAttribute("data-cap-bg")) ?? "transparent";

    if (filters.length && !filters.some((f) => id.includes(f))) {
      skipped.push(id);
      continue;
    }

    /* An element screenshot paints whatever lands in that rectangle,
       including neighbouring blocks that overhang it. Hide every other
       block for the shot — visibility keeps the layout stable, so
       nothing reflows and the element stays where it was measured. */
    await page.$$eval(
      "[data-cap]",
      (els, current) => {
        for (const e of els) {
          (e as HTMLElement).style.visibility =
            e.getAttribute("data-cap") === current ? "visible" : "hidden";
        }
      },
      id,
    );

    await el.screenshot({
      path: path.join(OUT, `${id}@${SCALE}x.png`),
      omitBackground: bg === "transparent",
    });
    written.push(id);
  }

  await page.$$eval("[data-cap]", (els) => {
    for (const e of els) (e as HTMLElement).style.visibility = "visible";
  });

  await browser.close();

  console.log(`\n  ${written.length} written to capture-out/ at ${SCALE}x`);
  for (const id of written) console.log(`    ${id}@${SCALE}x.png`);
  if (skipped.length) console.log(`\n  ${skipped.length} skipped by filter`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
