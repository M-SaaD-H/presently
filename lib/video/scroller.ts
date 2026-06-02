/**
 * Scroll engine for the recording session.
 *
 * Uses requestAnimationFrame inside page.evaluate() — not page.mouse.wheel(),
 * which looks robotic and triggers scroll-jank on many sites.
 *
 * The motion profile mimics natural human scrolling:
 *   - Cubic ease-in-out curve (gentle acceleration + deceleration)
 *   - ±10% per-frame speed jitter so it never looks mechanical
 *   - 1–2 micro-pauses mid-scroll (like a human stopping to read)
 *   - Generous pause at top and bottom for visual breathing room
 */

import type { Page } from "playwright";
import type { ScrollOptions } from "./types";

const DEFAULT_SCROLL_OPTIONS: Required<ScrollOptions> = {
  targetDurationSeconds: 30,
  pauseAtTopMs: 1500,
  pauseAtBottomMs: 2000,
  animationSettleMs: 800,
};

export async function runScrollSession(
  page: Page,
  options: Partial<ScrollOptions> = {}
): Promise<void> {
  const opts = { ...DEFAULT_SCROLL_OPTIONS, ...options };

  // Pause at top — lets opening hero animations fully play before we move
  await sleep(opts.pauseAtTopMs);

  // Measure scroll range inside the page context
  const scrollHeight = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  );

  if (scrollHeight <= 0) {
    // Page has no scroll — just hold the static frame for the target duration
    await sleep(opts.targetDurationSeconds * 1000);
    return;
  }

  // Decide where to insert micro-pauses (1–2 random stops mid-scroll)
  // Expressed as fractions of total scroll distance (0.0 – 1.0)
  const pausePoints = generatePausePoints();

  // Perform the scroll using rAF inside the browser for buttery smoothness
  await page.evaluate(
    scrollWithAnimation,
    {
      totalDistance: scrollHeight,
      targetDurationMs: opts.targetDurationSeconds * 1000,
      pausePoints,
    }
  );

  // Pause at bottom
  await sleep(opts.pauseAtBottomMs);
}

// ---------------------------------------------------------------------------
// This function runs INSIDE the browser via page.evaluate — no imports allowed
// ---------------------------------------------------------------------------
function scrollWithAnimation(args: {
  totalDistance: number;
  targetDurationMs: number;
  pausePoints: number[];
}): Promise<void> {
  const { totalDistance, targetDurationMs, pausePoints } = args;

  return new Promise<void>((resolve) => {
    let startTime: number | null = null;
    // Track which pause points we've already triggered
    const triggeredPauses = new Set<number>();
    let pauseUntil = 0;

    function easeInOutCubic(t: number): number {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function addJitter(value: number): number {
      // ±10% random variation per frame — avoids mechanical perfection
      return value * (0.9 + Math.random() * 0.2);
    }

    function step(timestamp: number): void {
      if (startTime === null) startTime = timestamp;

      // Honour micro-pauses: freeze the scroll position but keep rAF alive
      if (timestamp < pauseUntil) {
        requestAnimationFrame(step);
        return;
      }

      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / targetDurationMs, 1);
      const easedProgress = easeInOutCubic(rawProgress);

      const targetY = Math.round(easedProgress * totalDistance);
      window.scrollTo(0, addJitter(targetY));

      // Check if we've crossed a pause point
      for (const point of pausePoints) {
        if (!triggeredPauses.has(point) && rawProgress >= point) {
          triggeredPauses.add(point);
          // Pause 300–700ms — long enough to look intentional, short enough
          // to keep the overall pacing natural
          pauseUntil = timestamp + 300 + Math.random() * 400;
          requestAnimationFrame(step);
          return;
        }
      }

      if (rawProgress < 1) {
        requestAnimationFrame(step);
      } else {
        // Snap to exact bottom
        window.scrollTo(0, totalDistance);
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

/** Generate 1–2 random pause points between 20% and 80% of the scroll range */
function generatePausePoints(): number[] {
  const count = Math.random() < 0.5 ? 1 : 2;
  const points: number[] = [];
  for (let i = 0; i < count; i++) {
    // Space them at least 25% apart
    let candidate: number;
    do {
      candidate = 0.2 + Math.random() * 0.6;
    } while (points.some((p) => Math.abs(p - candidate) < 0.25));
    points.push(candidate);
  }
  return points.sort((a, b) => a - b);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
