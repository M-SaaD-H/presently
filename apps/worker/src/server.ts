/**
 * Express HTTP server for the worker.
 *
 * Exposes a minimal API so apps/web can submit jobs and poll status
 * without touching Redis directly.
 *
 * POST /jobs          — enqueue a recording job
 * GET  /jobs/:jobId   — get job status
 */

import express, { type Request, type Response, type Express } from "express";
import { z } from "zod";
import { addRecordingJob, getJobStatus } from "./queue";
import { connectDB } from "@presently/db";
import { Job } from "@presently/db";

const app: Express = express();
app.use(express.json());

// Validation schemas

const ScrollOptionsSchema = z.object({
  pauseAtTopMs: z.number().int().nonnegative(),
  pauseAtBottomMs: z.number().int().nonnegative(),
  animationSettleMs: z.number().int().nonnegative(),
});

const RecordingOptionsSchema = z.object({
  enableDarkMode: z.boolean(),
  viewport: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  showBrowserFrame: z.boolean(),
  scroll: ScrollOptionsSchema,
});

const EnqueueJobSchema = z.object({
  jobId: z.string().min(1),
  url: z.string().url(),
  recordingOptions: RecordingOptionsSchema,
});

// Routes

/**
 * POST /jobs
 * Enqueues a new recording job.
 * Body: { jobId, url, recordingOptions }
 */
app.post("/jobs", async (req: Request, res: Response) => {
  const parsed = EnqueueJobSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid request body",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { jobId, url, recordingOptions } = parsed.data;

  try {
    await connectDB();
    await addRecordingJob(jobId, url, recordingOptions);
    res.status(202).json({ success: true, data: { jobId }, message: "Job enqueued" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to enqueue job";
    console.error("[server] Failed to enqueue job:", err);
    res.status(500).json({ success: false, message });
  }
});

/**
 * GET /jobs/:jobId
 * Returns the current status of a recording job.
 */
app.get("/jobs/:jobId", async (req: Request, res: Response) => {
  const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;

  if (!jobId) {
    res.status(400).json({ success: false, message: "Missing jobId" });
    return;
  }

  try {
    // Prefer the DB record (authoritative source for completed/failed jobs)
    await connectDB();
    const dbJob = await Job.findById(jobId).catch(() => null);

    if (!dbJob) {
      // Fall back to BullMQ queue state for very new jobs not yet in DB
      const queueStatus = await getJobStatus(jobId);
      if (queueStatus.status === "unknown") {
        res.status(404).json({ success: false, message: `No job found with id: ${jobId}` });
        return;
      }
      res.json({ success: true, data: queueStatus });
      return;
    }

    res.json({
      success: true,
      data: {
        status: dbJob.status,
        publicUrl: dbJob.publicUrl,
        error: dbJob.error,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch job";
    console.error("[server] Failed to fetch job:", err);
    res.status(500).json({ success: false, message });
  }
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export { app };
