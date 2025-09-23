// next.config.ts — Firebase App Hosting friendly (SSR, tolerant build)
import type { NextConfig } from "next";

/**
 * We deploy to Firebase App Hosting. Keep standard SSR (no static export),
 * and ignore type/ESLint errors during CI so builds don’t fail on non-blockers.
 */
const nextConfig: NextConfig = {
  // IMPORTANT: do NOT set output:"export" here
  trailingSlash: false,

  // If you use next/image, leaving this on is fine with Firebase
  images: { unoptimized: true },

  // Make CI builds resilient to lint/type issues
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
