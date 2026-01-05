import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // یا 'export' برای static export
  trailingSlash: true, // برای Vercel بهتر است
  reactStrictMode: true,
  images: {
    unoptimized: true, // اگر مشکل image دارید
  },
};

export default nextConfig;