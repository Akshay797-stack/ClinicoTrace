import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for AWS Amplify deployment (standalone output)
  output: "standalone",

  // Environment variable passthrough
  env: {
    NEXT_PUBLIC_MODE: process.env.NEXT_PUBLIC_MODE ?? "demo",
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Image optimization
  images: {
    unoptimized: true, // Amplify doesn't have image optimization server by default
  },
};

export default nextConfig;
