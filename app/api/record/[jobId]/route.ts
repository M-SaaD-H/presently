/**
 * GET /api/record/[jobId]
 *
 * Returns the current status of a recording job.
 *
 * Response: {
 *   status: 'queued' | 'processing' | 'done' | 'failed' | 'unknown',
 *   publicUrl?: string,   // present when status === 'done'
 *   error?: string        // present when status === 'failed'
 * }
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ApiError } from "@/utils/apiError";
import { asyncHandler } from "@/utils/asyncHandler";
import { getJobStatus } from "@/lib/video/queue";

type Ctx = { params: Promise<{ jobId: string }> };

export const GET = asyncHandler<Ctx>(
  async (_req: NextRequest, ctx: Ctx) => {
    const { jobId } = await ctx.params;

    if (!jobId || typeof jobId !== "string") {
      throw new ApiError(400, "Missing jobId parameter");
    }

    const { status, result, error } = await getJobStatus(jobId);

    if (status === "unknown") {
      throw new ApiError(404, `No job found with id: ${jobId}`);
    }

    return NextResponse.json({
      status,
      publicUrl: result?.publicUrl,
      error,
    });
  }
);
