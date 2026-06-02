/**
 * BullMQ worker that processes recording jobs.
 *
 * Can be run as a standalone process for production:
 *   node --require tsx/cjs lib/video/worker.ts
 *
 * Or imported by Next.js API routes in development for convenience.
 *
 * Concurrency is controlled by MAX_CONCURRENT_WORKERS (default 3), which
 * matches the Xvfb display pool size so we never starve or overflow it.
 */

import { Worker } from "bullmq";
import { getRedisConnectionOptions } from "./redisConnection";
import { recordWebsite } from "./recorder";
import type { RecordingJob, RecordingResult } from "./types";
import { QUEUE_NAME } from "./queue";

const MAX_WORKERS = parseInt(process.env.MAX_CONCURRENT_WORKERS ?? "3", 10);

function createWorker(): Worker<RecordingJob, RecordingResult, string> {
  const worker = new Worker<RecordingJob, RecordingResult, string>(
    QUEUE_NAME,
    async (job) => {
      const { jobId, url } = job.data;
      console.log(`[worker] Starting job ${jobId} — ${url}`);

      const result = await recordWebsite(job.data);

      console.log(
        `[worker] Completed job ${jobId} — ${result.fileSizeBytes} bytes, ` +
          `publicUrl: ${result.publicUrl}`
      );

      return result;
    },
    {
      connection: getRedisConnectionOptions(),
      concurrency: MAX_WORKERS,
    }
  );

  worker.on("failed", (job, err) => {
    const jobId = job?.data?.jobId ?? job?.id ?? "unknown";
    const url = job?.data?.url ?? "unknown";
    // Log a clean single-line message — not a full stack trace — so log
    // aggregators can parse it easily
    console.error(
      `[worker] Failed job ${jobId} — ${url} — ${err.message}`
    );
  });

  worker.on("error", (err) => {
    console.error(`[worker] Worker error: ${err.message}`);
  });

  return worker;
}

// Singleton worker instance — only one per process
let workerInstance: Worker<RecordingJob, RecordingResult> | null = null;

export function getWorker(): Worker<RecordingJob, RecordingResult> {
  if (!workerInstance) {
    workerInstance = createWorker();
  }
  return workerInstance;
}

// ── Standalone entrypoint ────────────────────────────────────────────────────
// When run directly (not imported), start the worker and keep the process alive.
if (require.main === module) {
  const worker = getWorker();
  console.log(
    `[worker] Started — concurrency: ${MAX_WORKERS}, queue: ${QUEUE_NAME}`
  );

  // Graceful shutdown on SIGTERM/SIGINT
  async function shutdown(signal: string): Promise<void> {
    console.log(`[worker] Received ${signal}, shutting down gracefully…`);
    await worker.close();
    process.exit(0);
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
