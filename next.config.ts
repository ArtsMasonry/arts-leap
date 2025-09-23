// next.config.ts — Firebase App Hosting friendly (NO static export)
import type { NextConfig } from "next";

/**
 * We are deploying to Firebase App Hosting (server runtime),
 * so we MUST NOT set `output: "export"`.
 * Static export breaks dynamic routes like /customers/[id]/edit.
 *
 * If later you want a GitHub Pages build, we can add a *separate*
 * workflow that sets an env flag and enables export only in that job.
 */
const nextConfig: NextConfig = {
  // Keep defaults; do NOT use basePath/assetPrefix/output: "export"
  images: { unoptimized: true }, // harmless; keep if you’re not using next/image optimizations
  trailingSlash: false,
  // You can add other Next options here as needed.
};

export default nextConfig;
