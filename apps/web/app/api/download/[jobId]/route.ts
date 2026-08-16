/**
 * GET /api/download/[jobId]
 *
 * Fetches the completed job from MongoDB and redirects to the publicUrl.
 * For local storage the publicUrl is a relative path to the local file;
 * for cloud storage it is a CDN URL.
 *
 * Returns 404 if the job doesn't exist or hasn't completed yet.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ApiError } from "@sitecast/shared";
import { asyncHandler } from "@/utils/asyncHandler";
import { connectDB, Job } from "@sitecast/db";
import { auth } from "@/lib/auth";

const WORKER_URL = process.env.WORKER_URL ?? "http://localhost:3001";

type Ctx = { params: Promise<{ jobId: string }> };

export const GET = asyncHandler<Ctx>(
  async (req: NextRequest, ctx: Ctx) => {
    const { jobId } = await ctx.params;

    if (!jobId || typeof jobId !== "string") {
      throw new ApiError(400, "Missing jobId parameter");
    }

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      throw new ApiError(401, "You must be logged in to download recordings");
    }

    await connectDB();
    const job = await Job.findById(jobId).catch(() => null);

    if (!job) {
      throw new ApiError(404, "Recording not found");
    }

    if (job.user.toString() !== session.user.id) {
      throw new ApiError(403, "You do not have permission to download this recording");
    }

    if (job.status !== "completed") {
      throw new ApiError(404, "Recording not found or not yet complete");
    }

    if (!job.publicUrl) {
      throw new ApiError(404, "No recording URL available for this job");
    }

    // Delegate to the worker HTTP API
    const workerRes = await fetch(`${WORKER_URL}/api/download/${jobId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  
    if (!workerRes.ok) {
      throw new ApiError(502, "Failed to get the generated video.");
    }

    const workerData = await workerRes.json();

    const url = workerData.data.job.publicUrl;
    // local url
    if (!url.startsWith("http")) {
      workerData.data.job.publicUrl = `${WORKER_URL}/${url.substring(1)}`;
    }

    return new NextResponse(workerData);
  }
);
