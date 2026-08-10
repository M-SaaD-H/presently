import { NextRequest, NextResponse } from "next/server";
import { connectDB, Job } from "@presently/db";
import { ApiResponse, ApiError } from "@presently/shared";
import { asyncHandler } from "@/utils/asyncHandler";
import { auth } from "@/lib/auth";

export const GET = asyncHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
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
