/**
 * GET /api/record/[jobId]
 *
 * Returns the current status of a recording job by reading from MongoDB.
 *
 * Response: { status, publicUrl?, error? }
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ApiError, ApiResponse } from "@presently/shared";
import { asyncHandler } from "@/utils/asyncHandler";
import { connectDB, Job } from "@presently/db";
import { auth } from "@/lib/auth";

type Ctx = { params: Promise<{ jobId: string }> };

export const GET = asyncHandler<Ctx>(
  async (req: NextRequest, ctx: Ctx) => {
    const { jobId } = await ctx.params;

    if (!jobId || typeof jobId !== "string") {
      throw new ApiError(400, "Missing jobId parameter");
    }

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      throw new ApiError(401, "You must be logged in to view job status");
    }

    await connectDB();
    const job = await Job.findById(jobId).catch(() => null);

    if (!job) {
      throw new ApiError(404, `No job found with id: ${jobId}`);
    }

    if (job.user.toString() !== session.user.id) {
      throw new ApiError(403, "You do not have permission to view this job");
    }

    // Normalize DB status to the status labels the UI expects
    const statusMap: Record<string, string> = {
      processing: "processing",
      completed: "done",
      failed: "failed",
    };

    return NextResponse.json(
      new ApiResponse(
        200,
        {
          status: statusMap[job.status] ?? job.status,
          publicUrl: job.publicUrl,
          error: job.error,
        },
        "Job status fetched successfully"
      ),
      { status: 200 }
    );
  }
);
