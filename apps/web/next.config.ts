import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mongoose uses native modules that must not be bundled by webpack
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
