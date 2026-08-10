import { NextRequest, NextResponse } from "next/server";
import { connectDB, Job } from "@presently/db";
import { ApiResponse, ApiError } from "@presently/shared";
import { asyncHandler } from "@/utils/asyncHandler";
import { auth } from "@/lib/auth";

export const GET = asyncHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  if (!session?.user?.id) {
    throw new ApiError(401, "You must be logged in to view jobs");
  }

  const { id } = await params;

  if (!id) {
    throw new ApiError(400, "Job ID is required");
  }

  await connectDB();
  const job = await Job.findById(id).catch(() => null);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (job.user.toString() !== session.user.id) {
    throw new ApiError(403, "You do not have permission to view this job");
  }

  return NextResponse.json(
    new ApiResponse(200, { job }, "Job fetched successfully"),
    { status: 200 }
  );
});
