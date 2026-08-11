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
import { ApiError } from "@presently/shared";
import { asyncHandler } from "@/utils/asyncHandler";
import { connectDB, Job } from "@presently/db";
import { auth } from "@/lib/auth";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.resolve(
  // turborepo warning: This is only used in local dev.
  // Cloud storage will be used in production
  process.env.OUTPUT_DIR ?? path.join(process.cwd(), "output")
);

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

    // Cloud storage: redirect to CDN URL
    if (job.publicUrl.startsWith("http")) {
      return NextResponse.redirect(job.publicUrl, { status: 302 });
    }

    // Local storage: stream file from disk
    const filePath = path.join(OUTPUT_DIR, `${jobId}.mp4`);

    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, "Recording file not found on disk");
    }

    const stat = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);

    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        fileStream.on("data", (chunk: string | Buffer) => {
          const bytes = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
          controller.enqueue(new Uint8Array(bytes));
        });
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(stat.size),
        "Content-Disposition": `attachment; filename="presently-${jobId}.mp4"`,
        "Accept-Ranges": "bytes",
      },
    });
  }
);
