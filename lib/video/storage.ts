/**
 * File output abstraction.
 *
 * STORAGE_TYPE=local: copies the recording to OUTPUT_DIR and returns a
 *                     relative URL path (served by Next.js /api/download).
 * STORAGE_TYPE=cloudinary: uploads to Cloudinary and returns the public CDN URL.
 */

import fs from "fs/promises";
import path from "path";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { v2 as cloudinary } from "cloudinary";

const STORAGE_TYPE = process.env.STORAGE_TYPE ?? "local";
const OUTPUT_DIR = path.resolve(
  process.env.OUTPUT_DIR ?? path.join(process.cwd(), "output")
);

/**
 * Persists the recorded MP4 to permanent storage.
 * Returns the public URL to access the video.
 */
export async function saveVideo(
  localPath: string,
  jobId: string
): Promise<string> {
  if (STORAGE_TYPE === "cloudinary") {
    return uploadToCloudinary(localPath, jobId);
  }
  return saveLocally(localPath, jobId);
}

async function saveLocally(localPath: string, jobId: string): Promise<string> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const filename = `${jobId}.mp4`;
  const destPath = path.join(OUTPUT_DIR, filename);

  // Stream copy instead of rename so it works across filesystem boundaries
  await pipeline(createReadStream(localPath), createWriteStream(destPath));

  // Clean up the temp file
  await fs.unlink(localPath).catch(() => {
    // Non-fatal if the temp file was already cleaned up
  });

  // Return the download API path — the route handler streams this file
  return `/api/download/${jobId}`;
}


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadToCloudinary(localPath: string, jobId: string): Promise<string> {
  if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      "Cloudinary upload requires CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET env vars."
    );
  }

  try {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: "video",
      public_id: `presently/recordings/${jobId}`,
    });

    // The Cloudinary SDK can sometimes resolve the promise slightly before
    // fully closing the file descriptor internally. If we unlink immediately,
    // Bun throws an EBADF (bad file descriptor) error on close.
    // We defer the cleanup slightly to avoid this race condition.
    setTimeout(() => {
      fs.unlink(localPath).catch(() => {});
    }, 1000);

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
}

// Returns the absolute local path for a job's output file (local storage only)
export function getLocalOutputPath(jobId: string): string {
  return path.join(OUTPUT_DIR, `${jobId}.mp4`);
}
