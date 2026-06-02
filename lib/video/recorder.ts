/**
 * Main recording orchestrator.
 *
 * Animation-first recording sequence:
 *   1. Allocate an isolated Xvfb display from the pool
 *   2. Start Xvfb (virtual X11 display — Wayland-compatible via XWayland)
 *   3. Launch Chrome (pointing at the Xvfb display)
 *   4. Start FFmpeg x11grab capture — recording begins NOW on the blank tab
 *   5. Navigate to the target URL — all page-load animations are captured
 *   6. Wait for the load event + animationSettleMs grace period
 *   7. Run the natural human-like scroll session
 *   8. Stop FFmpeg cleanly (stdin 'q', await exit)
 *   9. Tear down Chrome → Xvfb → release display
 *  10. Move the output file to permanent storage
 *
 * Every step is inside try/finally so processes are always cleaned up even
 * if an error occurs mid-recording.
 */

import { spawn } from "child_process";
import type { ChildProcess } from "child_process";
import os from "os";
import path from "path";
import fs from "fs/promises";
import { chromium } from "playwright";

import { acquireDisplay, releaseDisplay } from "./displayPool";
import { startRecording, stopRecording } from "./ffmpeg";
import { runScrollSession } from "./scroller";
import { saveVideo } from "./storage";
import type { RecordingJob, RecordingResult, ScrollOptions } from "./types";

const CHROME_EXECUTABLE =
  process.env.CHROME_EXECUTABLE ?? "/usr/bin/google-chrome-stable";

/** Milliseconds to wait after xdpyinfo reports Xvfb is ready before launching Chrome */
const XVFB_READY_POLL_INTERVAL_MS = 200;
const XVFB_READY_TIMEOUT_MS = 15_000;

/** Resolution must match the FFmpeg x11grab capture size in ffmpeg.ts */
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 800;

export async function recordWebsite(job: RecordingJob): Promise<RecordingResult> {
  const display = await acquireDisplay();

  let xvfbProc: ChildProcess | null = null;
  let ffmpegHandle: ReturnType<typeof startRecording> | null = null;
  let browserContext: Awaited<ReturnType<typeof chromium.launchPersistentContext>> | null = null;
  const tempPath = path.join(os.tmpdir(), `presently-${job.jobId}.mp4`);

  try {
    // ── 1. Start Xvfb ──────────────────────────────────────────────────────
    xvfbProc = spawnXvfb(display);
    await waitForXvfb(display);

    // ── 2. Launch Chrome via Playwright ────────────────────────────────────
    // We use launchPersistentContext so we get a real user-data-dir, which
    // enables Chrome to render sites exactly as a user would see them.
    const userDataDir = path.join(os.tmpdir(), `presently-profile-${job.jobId}`);
    await fs.mkdir(userDataDir, { recursive: true });

    const displayEnv = `:${display}`;
    browserContext = await chromium.launchPersistentContext(userDataDir, {
      executablePath: CHROME_EXECUTABLE,
      headless: false,
      viewport: {
        width: job.viewport?.width ?? VIEWPORT_WIDTH,
        height: job.viewport?.height ?? VIEWPORT_HEIGHT,
      },
      env: {
        ...process.env,
        DISPLAY: displayEnv,
      },
      args: [
        // Force X11 mode so Chrome works inside the Xvfb display on Wayland
        "--ozone-platform=x11",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        // Disable features that can interfere with smooth rendering in a VM display
        "--disable-dev-shm-usage",
        "--disable-gpu-sandbox",
        "--disable-software-rasterizer",
        // Ensure animations run at full speed — not throttled for background tabs
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
        // Keep a consistent window size matching the FFmpeg capture resolution
        `--window-size=${VIEWPORT_WIDTH},${VIEWPORT_HEIGHT}`,
        "--window-position=0,0",
      ],
      ignoreDefaultArgs: ["--enable-automation"],
    });

    const page = browserContext.pages()[0] ?? await browserContext.newPage();

    // ── 3. Start FFmpeg recording (blank Chrome tab is first frame) ─────────
    ffmpegHandle = startRecording(display, tempPath);

    // Small delay so FFmpeg's x11grab initializes before we navigate.
    // Without this, the first frames can be black or skipped.
    await sleep(500);

    // ── 4. Navigate — all page-load animations are captured from this point ──
    await page.goto(job.url, {
      // 'load' fires after DOMContentLoaded + stylesheets/images are ready.
      // We intentionally do NOT use 'networkidle' because:
      //   a) many sites stream content and never fully idle
      //   b) waiting for idle means missing the initial CSS transition animations
      waitUntil: "load",
      timeout: 60_000,
    });

    // ── 5. Let opening animations run ───────────────────────────────────────
    // This grace period captures hero animations, fade-ins, route transitions,
    // etc. that fire immediately after the load event.
    const scrollOpts: Partial<ScrollOptions> = {
      targetDurationSeconds: job.targetDurationSeconds,
      pauseAtTopMs: 2000,      // 2s pause at top — lets hero animations breathe
      pauseAtBottomMs: 2000,
      animationSettleMs: 1000, // Extra settle before scroll starts
    };
    await sleep(scrollOpts.animationSettleMs ?? 1000);

    // ── 6. Scroll session ────────────────────────────────────────────────────
    await runScrollSession(page, scrollOpts);

    // ── 7. Stop FFmpeg cleanly ───────────────────────────────────────────────
    await stopRecording(ffmpegHandle);
    ffmpegHandle = null;

    // ── 8. Tear down browser ─────────────────────────────────────────────────
    await browserContext.close();
    browserContext = null;

    // Clean up the temporary user-data-dir (non-fatal if it fails)
    await fs.rm(userDataDir, { recursive: true, force: true }).catch(() => {});

  } finally {
    // Guaranteed cleanup regardless of where an error occurred
    if (ffmpegHandle) {
      await stopRecording(ffmpegHandle).catch(() => {
        ffmpegHandle!.process.kill("SIGTERM");
      });
    }
    if (browserContext) {
      await browserContext.close().catch(() => {});
    }
    if (xvfbProc && !xvfbProc.killed) {
      xvfbProc.kill("SIGTERM");
    }
    releaseDisplay(display);
  }

  // ── 9. Persist to storage ──────────────────────────────────────────────────
  const publicUrl = await saveVideo(tempPath, job.jobId);

  // Measure the output file
  const { size } = await fs.stat(tempPath).catch(async () => {
    // File may have been moved by saveVideo already; try the output location
    const { getLocalOutputPath } = await import("./storage");
    return fs.stat(getLocalOutputPath(job.jobId));
  });

  return {
    jobId: job.jobId,
    outputPath: tempPath,
    publicUrl,
    // Approximate duration from job options — FFmpeg could be queried for exact
    durationSeconds: job.targetDurationSeconds,
    fileSizeBytes: size,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function spawnXvfb(display: number): ChildProcess {
  const proc = spawn(
    "Xvfb",
    [`:${display}`, "-screen", "0", "1280x800x24", "-ac", "+extension", "GLX"],
    {
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
    }
  );

  proc.stderr?.on("data", (chunk: Buffer) => {
    process.stderr.write(`[xvfb:${display}] ${chunk.toString()}`);
  });

  return proc;
}

/**
 * Polls xdpyinfo until Xvfb accepts connections on the given display.
 * This is more reliable than a fixed sleep because Xvfb startup time varies.
 */
async function waitForXvfb(display: number): Promise<void> {
  const deadline = Date.now() + XVFB_READY_TIMEOUT_MS;
  const displayStr = `:${display}`;

  while (Date.now() < deadline) {
    const ready = await new Promise<boolean>((resolve) => {
      const check = spawn("xdpyinfo", ["-display", displayStr], {
        stdio: "ignore",
        env: { ...process.env, DISPLAY: displayStr },
      });
      check.on("close", (code) => resolve(code === 0));
      check.on("error", () => resolve(false));
    });

    if (ready) return;
    await sleep(XVFB_READY_POLL_INTERVAL_MS);
  }

  throw new Error(
    `Xvfb :${display} did not become ready within ${XVFB_READY_TIMEOUT_MS}ms`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
