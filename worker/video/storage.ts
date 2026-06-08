/**
 * File output abstraction.
 *
 * STORAGE_TYPE=local: copies the recording to OUTPUT_DIR and returns a
 *                     relative URL path (served by Next.js /api/download).
 * STORAGE_TYPE=cloud: uploads to supabase storage and returns the public CDN URL.
 */

import fs from "fs/promises";
import path from "path";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { supabase } from "../utils/supabase";

const STORAGE_TYPE = process.env.STORAGE_TYPE ?? "local";
const OUTPUT_DIR = path.resolve(
  process.env.OUTPUT_DIR ?? path.join(process.cwd(), "output")
);

/**
 * Persists the recorded MP4 to permanent storage (local or cloud).
 * Returns the public URL to access the video.
 */
export async function saveVideo(
  localPath: string,
  jobId: string
): Promise<string> {
  if (STORAGE_TYPE === "cloud") {
    return uploadToCloud(localPath, jobId);
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

async function uploadToCloud(localPath: string, jobId: string): Promise<string> {
  try {
    const file = await fs.readFile(localPath);
    const { data, error } = await supabase.storage.from("recordings").upload(`recordings/${jobId}.mp4`, file, {
      contentType: "video/mp4",
      cacheControl: "3600",
      upsert: true
    });
    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage.from("recordings").getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Supabase upload failed:", error);
    throw error;
  }
}

// Returns the absolute local path for a job's output file (local storage only)
export function getLocalOutputPath(jobId: string): string {
  return path.join(OUTPUT_DIR, `${jobId}.mp4`);
}
