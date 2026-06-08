/**
 * BullMQ worker that processes recording jobs.
 *
 * Can be run as a standalone process for production:
 *   node --require tsx/cjs worker/video/worker.ts
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
import { connectDB } from "@/lib/db";
import { Job } from "@/models/job";

const MAX_WORKERS = parseInt(process.env.MAX_CONCURRENT_WORKERS ?? "3", 10);

function createWorker(): Worker<RecordingJob, RecordingResult, string> {
  const worker = new Worker<RecordingJob, RecordingResult, string>(
    QUEUE_NAME,
    async (job) => {
      const { jobId, url } = job.data;
      
      console.log(`[worker] Starting job ${jobId} - ${url}`);
      await connectDB();
      await Job.findByIdAndUpdate(jobId, { status: "processing" });

      const result = await recordWebsite(job.data);

      await Job.findByIdAndUpdate(jobId, {
        status: "completed",
        publicUrl: result.publicUrl,
        duration: result.durationSeconds,
      });

      console.log(
        `[worker] Completed job ${jobId} - publicUrl: ${result.publicUrl}`
      );

      return result;
    },
    {
      connection: getRedisConnectionOptions(),
      concurrency: MAX_WORKERS,
    }
  );

  worker.on("failed", async (job, err) => {
    const jobId = job?.data?.jobId ?? job?.id ?? "unknown";
    const url = job?.data?.url ?? "unknown";
    
    console.error(
      `[worker] Failed job ${jobId} - ${url}.\nError: ${err.message}`
    );

    try {
      await connectDB();
      await Job.findByIdAndUpdate(jobId, {
        status: "failed",
        error: err.message,
      });
    } catch (dbErr) {
      console.error(`[worker] Failed to update DB for failed job ${jobId}`, dbErr);
    }
  });

  worker.on("error", (err) => {
    console.error(`[worker] Worker error: ${err.message}`);
  });

  return worker;
}

// Singleton worker instance, only one per process
let workerInstance: Worker<RecordingJob, RecordingResult> | null = null;

export function getWorker(): Worker<RecordingJob, RecordingResult> {
  if (!workerInstance) {
    workerInstance = createWorker();
  }
  return workerInstance;
}

// Standalone entrypoint
// When run directly (not imported), start the worker and keep the process alive.
if (require.main === module) {
  const worker = getWorker();
  console.log(
    `[worker] Started - concurrency: ${MAX_WORKERS}, queue: ${QUEUE_NAME}`
  );

  let shuttingDown = false;
  
  // Graceful shutdown on SIGTERM/SIGINT
  async function shutdown(signal: string): Promise<void> {
    if (shuttingDown) {
      console.log(`\n[worker] Received ${signal} again, forcing exit immediately`);
      process.exit(1);
    }
    shuttingDown = true;
    console.log(`\n[worker] Received ${signal}, shutting down gracefully... (Press Ctrl+C again to force exit)`);
    
    // Give active jobs some time to finish, but don't hang forever
    const forceExitTimer = setTimeout(() => {
      console.log(`[worker] Graceful shutdown timed out. Forcing exit.`);
      process.exit(1);
    }, 10000); // 10 seconds timeout
    
    try {
      await worker.close();
      clearTimeout(forceExitTimer);
      process.exit(0);
    } catch (err) {
      console.error(`[worker] Error during shutdown:`, err);
      process.exit(1);
    }
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
