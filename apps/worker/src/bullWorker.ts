/**
 * BullMQ worker that processes recording jobs.
 *
 * Concurrency is controlled by MAX_CONCURRENT_WORKERS (default 3), which
 * matches the Xvfb display pool size so we never starve or overflow it.
 */

import { Worker } from "bullmq";
import { getRedisConnectionOptions } from "./redisConnection";
import { saveVideo, getLocalOutputPath } from "./storage";
import { QUEUE_NAME } from "./queue";
import { Job, connectDB } from "@sitecast/db";
import type { RecordingJob, RecordingResult } from "@sitecast/shared";
import { recordWebsite } from "@sitecast/renderer";

const MAX_WORKERS = parseInt(process.env.MAX_CONCURRENT_WORKERS ?? "3", 10);

function createWorker(): Worker<RecordingJob, RecordingResult, string> {
  const worker = new Worker<RecordingJob, RecordingResult, string>(
    QUEUE_NAME,
    async (job) => {
      const { jobId, url } = job.data;

      console.log(`[worker] Starting job ${jobId} - ${url}`);
      await connectDB();
      await Job.findByIdAndUpdate(jobId, { status: "processing" });

      const renderResult = await recordWebsite(job.data);

      // Persist to local disk or cloud, get the public URL
      const publicUrl = await saveVideo(renderResult.outputPath, jobId);
      const isCloudStorage = publicUrl.startsWith("http");

      const result: RecordingResult = {
        ...renderResult,
        outputPath: isCloudStorage ? publicUrl : getLocalOutputPath(jobId),
        publicUrl,
      };

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

export function startWorker(): void {
  const worker = getWorker();
  console.log(
    `[worker] Started - concurrency: ${MAX_WORKERS}, queue: ${QUEUE_NAME}`
  );

  let shuttingDown = false;

  async function shutdown(signal: string): Promise<void> {
    if (shuttingDown) {
      console.log(`\n[worker] Received ${signal} again, forcing exit immediately`);
      process.exit(1);
    }
    shuttingDown = true;
    console.log(`\n[worker] Received ${signal}, shutting down gracefully... (Press Ctrl+C again to force exit)`);

    const forceExitTimer = setTimeout(() => {
      console.log(`[worker] Graceful shutdown timed out. Forcing exit.`);
      process.exit(1);
    }, 10000);

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
