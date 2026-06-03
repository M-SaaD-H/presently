/**
 * BullMQ job queue for recording jobs.
 */

import { Queue } from "bullmq";
import { nanoid } from "nanoid";
import { getRedisConnectionOptions } from "./redisConnection";
import type { RecordingJob, RecordingResult } from "./types";

export const QUEUE_NAME = "recording";

// BullMQ v5: the second generic is the return value type, the third is the job
// name type. Using 'string' for the name keeps the API flexible.
export const recordingQueue = new Queue<RecordingJob, RecordingResult, string>(
  QUEUE_NAME,
  { connection: getRedisConnectionOptions() }
);

export interface AddJobOptions {
  viewport?: { width: number; height: number };
}

/**
 * Enqueues a new recording job and returns the generated jobId.
 */
export async function addRecordingJob(
  url: string,
  options: AddJobOptions = {}
): Promise<string> {
  const jobId = nanoid();

  const jobData: RecordingJob = {
    jobId,
    url,
    viewport: options.viewport ?? { width: 1280, height: 800 },
  };

  await recordingQueue.add("record", jobData, {
    jobId,
    removeOnComplete: { age: 86_400 },
    removeOnFail: { age: 86_400 },
  });

  return jobId;
}

export type JobStatus =
  | "queued"
  | "processing"
  | "done"
  | "failed"
  | "unknown";

export interface JobStatusResult {
  status: JobStatus;
  result?: RecordingResult;
  error?: string;
}

export async function getJobStatus(jobId: string): Promise<JobStatusResult> {
  const job = await recordingQueue.getJob(jobId);

  if (!job) {
    return { status: "unknown" };
  }

  const state = await job.getState();

  switch (state) {
    case "waiting":
    case "delayed":
    case "prioritized":
      return { status: "queued" };

    case "active":
      return { status: "processing" };

    case "completed": {
      const result = job.returnvalue as RecordingResult;
      return { status: "done", result };
    }

    case "failed":
      return {
        status: "failed",
        error: job.failedReason ?? "Recording failed for an unknown reason",
      };

    default:
      return { status: "unknown" };
  }
}
