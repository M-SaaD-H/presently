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

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json().catch(() => {
    throw new ApiError(400, "Invalid JSON body");
  });

  const { url } = body as {
    url?: unknown;
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

  const jobId = await addRecordingJob(parsedUrl.toString());

  return NextResponse.json({ jobId }, { status: 202 });
});
