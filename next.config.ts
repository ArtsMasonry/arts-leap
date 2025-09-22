// next.config.ts
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repo = "arts-leap"; // your repo name

const nextConfig: NextConfig = {
  // Export a static site for GitHub Pages
  output: "export",

  // Serve under https://artsmasonry.github.io/arts-leap/
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : undefined,

  // Safe for static export if using next/image
  images: { unoptimized: true },

  trailingSlash: true,
};

export default nextConfig;
