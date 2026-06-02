/**
 * POST /api/record
 *
 * Validates the URL, enqueues a recording job, and returns the jobId.
 * The worker process must be running separately to process the job.
 *
 * Body: { url: string, options?: { duration?: number } }
 * Response: { jobId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/utils/apiError";
import { asyncHandler } from "@/utils/asyncHandler";
import { addRecordingJob } from "@/lib/video/queue";
// Importing the worker here starts it in-process during development.
// In production, run it as a separate process instead.
import "@/lib/video/worker";

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json().catch(() => {
    throw new ApiError(400, "Invalid JSON body");
  });

  const { url, options } = body as {
    url?: unknown;
    options?: { duration?: unknown };
  };

  if (!url || typeof url !== "string") {
    throw new ApiError(400, "Missing or invalid 'url' field");
  }

  // Validate: must be a proper http/https URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new ApiError(400, "Invalid URL — must include http:// or https://");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new ApiError(400, "URL must use http or https protocol");
  }

  const duration =
    typeof options?.duration === "number" && options.duration > 0
      ? Math.min(options.duration, 120) // cap at 2 minutes
      : undefined;

  const jobId = await addRecordingJob(parsedUrl.toString(), {
    targetDurationSeconds: duration,
  });

  return NextResponse.json({ jobId }, { status: 202 });
});
