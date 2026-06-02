import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from trying to bundle Node-only packages used in API routes.
  // These must run in the Node.js runtime, not the Edge runtime or client bundle.
  serverExternalPackages: [
    "bullmq",
    "ioredis",
    "playwright",
    "playwright-core",
  ],
};

export default nextConfig;
