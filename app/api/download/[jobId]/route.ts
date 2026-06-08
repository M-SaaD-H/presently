/**
 * GET /api/download/[jobId]
 *
 * Streams the recorded MP4 directly (local storage) or redirects to the CDN
 *
 * Returns 404 if the job doesn't exist or hasn't completed yet.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "fs";
import { ApiError } from "@/utils/apiError";
import { asyncHandler } from "@/utils/asyncHandler";
import { getJobStatus } from "@/worker/video/queue";
import { getLocalOutputPath } from "@/worker/video/storage";

const STORAGE_TYPE = process.env.STORAGE_TYPE ?? "local";

type Ctx = { params: Promise<{ jobId: string }> };

export const GET = asyncHandler<Ctx>(
  async (_req: NextRequest, ctx: Ctx) => {
    const { jobId } = await ctx.params;

    if (!jobId || typeof jobId !== "string") {
      throw new ApiError(400, "Missing jobId parameter");
    }

    const { status, result } = await getJobStatus(jobId);

    if (status === "unknown" || status === "queued" || status === "processing") {
      throw new ApiError(404, "Recording not found or not yet complete");
    }

    if (status === "failed") {
      throw new ApiError(410, "Recording failed.");
    }

    if (STORAGE_TYPE === "cloud" && result?.publicUrl) {
      return NextResponse.redirect(result.publicUrl, { status: 302 });
    }

    // Local: stream the file from disk
    const filePath = getLocalOutputPath(jobId);

    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, "Recording file not found on disk");
    }

    const stat = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);

    // Convert Node.js ReadStream to a Web API ReadableStream for Next.js App Router
    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        fileStream.on("data", (chunk: string | Buffer) => {
          const bytes =
            typeof chunk === "string"
              ? Buffer.from(chunk)
              : chunk;
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
