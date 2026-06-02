import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Trust the Caddy reverse proxy headers so NextAuth
  // correctly detects HTTPS (x-forwarded-proto) and the
  // original host (x-forwarded-host) for cookie setting.
  serverExternalPackages: [],
};

export default nextConfig;