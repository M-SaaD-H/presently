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
import { connectDB } from "@sitecast/db";
import { Job } from "@sitecast/db";
import path from "path";
import fs from "fs";

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

const OUTPUT_DIR = path.resolve(
  // turborepo warning: This is only used in local dev.
  // Cloud storage will be used in production
  process.env.OUTPUT_DIR ?? path.join(process.cwd(), "output")
);

/**
 * Routes
 * 
 * Don't have much routes so doing this workaround.
 * Will follow MVC later if this project grows.
 */

/**
 * POST /jobs
 * Enqueues a new recording job.
 * Body: { jobId, url, recordingOptions }
 */
app.post("/api/jobs", async (req: Request, res: Response) => {
  const parsed = EnqueueJobSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { jobId, url, recordingOptions } = parsed.data;

  try {
    await connectDB();
    await addRecordingJob(jobId, url, recordingOptions);
    return res.status(202).json({ success: true, data: { jobId }, message: "Job enqueued" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to enqueue job";
    console.error("[server] Failed to enqueue job:", err);
    return res.status(500).json({ success: false, message });
  }
});

/**
 * GET /jobs/:jobId
 * Returns the current status of a recording job.
 */
app.get("/api/jobs/:jobId", async (req: Request, res: Response) => {
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
      return res.json({ success: true, data: queueStatus });
    }

    return res.json({
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
    return res.status(500).json({ success: false, message });
  }
});

app.get('/api/download/:jobId', async (req: Request, res: Response) => {
  const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;

  if (!jobId) {
    return res.status(400).json({ success: false, message: "Missing jobId" });
  }

  try {
    await connectDB();
    const dbJob = await Job.findById(jobId).catch(() => null);
    // Cloud storage: redirect to CDN URL
    if (dbJob.publicUrl.startsWith("http")) {
      return res.redirect(dbJob.publicUrl);
    }

    // Local storage: stream file from disk
    const filePath = path.join(OUTPUT_DIR, `${jobId}.mp4`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Recording file not found on disk" });
    }

    const stat = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);

    res.status(200).set({
      "Content-Type": "video/mp4",
      "Content-Length": String(stat.size),
      "Content-Disposition": `attachment; filename="sitecast-${jobId}.mp4"`,
      "Accept-Ranges": "bytes",
    });
    fileStream.pipe(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get recorded video";
    console.error("[server] Failed to get recorded video:", err);
    return res.status(500).json({ success: false, message });
  }
});

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export { app };
