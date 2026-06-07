/**
 * Test for the cloudinary upload
 */

import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const JOB_ID = "123";
const LOCAL_PATH = "./output/123.mp4";

async function testUpload(): Promise<void> {
  if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      "Cloudinary upload requires CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET env vars."
    );
  }
  
  try {
    // Automatically create a tiny fake video file for testing
    await fs.mkdir("./output", { recursive: true });
    const res = await fetch("https://www.w3schools.com/html/mov_bbb.mp4");
    const buffer = await res.arrayBuffer();
    await fs.writeFile(LOCAL_PATH, Buffer.from(buffer));
    console.log(`Created dummy video file at ${LOCAL_PATH}`);

    const result = await cloudinary.uploader.upload(LOCAL_PATH, {
      resource_type: "video",
      public_id: `presently/recordings/${JOB_ID}`,
    });

    // The Cloudinary SDK can sometimes resolve the promise slightly before
    // fully closing the file descriptor internally. If we unlink immediately,
    // Bun throws an EBADF (bad file descriptor) error on close.
    // We defer the cleanup slightly to avoid this race condition.
    setTimeout(() => {
      fs.unlink(LOCAL_PATH).catch(() => {});
    }, 1000);
    
    if (!result.secure_url) {
      throw new Error("Secure url is missing from cloudinary");
    }
    
    console.log("Video file uploaded successfully.");
    
    // Clean up: delete the file from Cloudinary so we don't waste storage
    await cloudinary.uploader.destroy(result.public_id, { resource_type: "video" });
    console.log("Video file deleted from Cloudinary successfully.");
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
}

testUpload();
