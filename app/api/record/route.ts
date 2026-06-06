/**
 * POST /api/record
 *
 * Validates the URL, enqueues a recording job, and returns the jobId.
 * The worker process must be running separately to process the job.
 *
 * Body: { url: string, options?: { duration?: number } }
 * Response: ApiResponse with jobId
 */

import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/utils/apiError";
import { ApiResponse } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { addRecordingJob } from "@/lib/video/queue";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/job";
import { auth } from "@/lib/auth";

export const POST = asyncHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError(401, "You must be logged in to generate videos.");
  }

  await connectDB();

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

  const job = await Job.create({
    user: session.user.id,
    url: parsedUrl.toString(),
    status: "processing",
  });

  const jobId = await addRecordingJob(job._id.toString(), parsedUrl.toString());

  return NextResponse.json(
    new ApiResponse(
      202,
      { jobId },
      "Job enqueued"
    ),
    { status: 202 }
  );
});
