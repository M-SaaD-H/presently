import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/job";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import { asyncHandler } from "@/utils/asyncHandler";
import { auth } from "@/lib/auth";

export const GET = asyncHandler(async (_req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError(401, "You must be logged in to view jobs");
  }

  await connectDB();
  const jobs = await Job.find({ user: session.user.id }).sort({ createdAt: -1 });

  return NextResponse.json(
    new ApiResponse(200, { jobs }, "Jobs fetched successfully"),
    { status: 200 }
  );
});
