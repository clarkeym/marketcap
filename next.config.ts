import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: some environments proxy/preview this app via 127.0.0.1 instead
  // of localhost. Without this, Next.js silently blocks the HMR dev-resource
  // channel for that origin, which breaks client hydration with no visible
  // error in the app itself (only in the dev overlay's network tab).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
