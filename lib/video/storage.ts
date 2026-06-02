/**
 * File output abstraction.
 *
 * STORAGE_TYPE=local  — copies the recording to OUTPUT_DIR and returns a
 *                       relative URL path (served by Next.js /api/download).
 * STORAGE_TYPE=s3     — uploads to S3/R2 and returns the public CDN URL.
 */

import fs from "fs/promises";
import path from "path";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";

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
  if (STORAGE_TYPE === "s3") {
    return uploadToS3(localPath, jobId);
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

async function uploadToS3(localPath: string, jobId: string): Promise<string> {
  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_ENDPOINT;
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

  if (!bucket || !endpoint || !accessKey || !secretKey || !publicBaseUrl) {
    throw new Error(
      "S3 upload requires S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_PUBLIC_BASE_URL env vars"
    );
  }

  // Dynamic import so the aws-sdk is only loaded when actually needed.
  // We cast through unknown because @aws-sdk/client-s3 is an optional peer
  // dependency not installed in the default setup.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const awsSdk: any = await import("@aws-sdk/client-s3" as string).catch(() => {
    throw new Error(
      "@aws-sdk/client-s3 is not installed. Run: bun add @aws-sdk/client-s3"
    );
  });

  const { S3Client, PutObjectCommand } = awsSdk;

  const client = new S3Client({
    endpoint,
    region: "auto",
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  const key = `recordings/${jobId}.mp4`;
  const fileBuffer = await fs.readFile(localPath);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: "video/mp4",
    })
  );

  await fs.unlink(localPath).catch(() => {});

  return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
}

/** Returns the absolute local path for a job's output file (local storage only). */
export function getLocalOutputPath(jobId: string): string {
  return path.join(OUTPUT_DIR, `${jobId}.mp4`);
}
