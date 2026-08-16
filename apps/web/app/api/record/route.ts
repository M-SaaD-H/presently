/**
 * POST /api/record
 *
 * Validates the URL, creates a Job record in MongoDB, then delegates to the
 * worker HTTP API to enqueue the recording job.
 *
 * Body: { url: string, recordingOptions: RecordingOptions }
 * Response: ApiResponse with jobId
 */

import { NextRequest, NextResponse } from "next/server";
import { ApiError, ApiResponse, type RecordingOptions } from "@sitecast/shared";
import { connectDB, Job } from "@sitecast/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { auth } from "@/lib/auth";

const WORKER_URL = process.env.WORKER_URL ?? "http://localhost:3001";

export const POST = asyncHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  if (!session?.user?.id) {
    throw new ApiError(401, "You must be logged in to generate videos.");
  }

  await connectDB();

  const body = await req.json().catch(() => {
    throw new ApiError(400, "Invalid JSON body");
  });

  const { url, recordingOptions } = body as {
    url?: string;
    recordingOptions?: RecordingOptions;
  };

  if (!url || typeof url !== "string") {
    throw new ApiError(400, "Missing or invalid 'url' field");
  }

  if (!recordingOptions || typeof recordingOptions !== "object") {
    throw new ApiError(400, "Missing or invalid 'recordingOptions' field");
  }

  // Validate: must be a proper http/https URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new ApiError(400, "URL must include http:// or https://");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new ApiError(400, "URL must use http or https protocol");
  }

  // Create the DB record first so we have a jobId
  const job = await Job.create({
    user: session.user.id,
    url: parsedUrl.toString(),
    status: "processing",
  });

  const jobId = job._id.toString();

  // Delegate to the worker HTTP API, no direct Redis/BullMQ access from web
  const workerRes = await fetch(`${WORKER_URL}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId, url: parsedUrl.toString(), recordingOptions }),
  });

  if (!workerRes.ok) {
    // Roll back DB record status to failed if the worker rejected the job
    await Job.findByIdAndUpdate(jobId, { status: "failed", error: "Worker rejected the job" });
    throw new ApiError(502, "Failed to enqueue job with worker");
  }

  return NextResponse.json(
    new ApiResponse(202, { jobId }, "Job enqueued"),
    { status: 202 }
  );
});
