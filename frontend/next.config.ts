import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // "standalone" produit un bundle minimal pour Docker (VPS).
  // Sur Cloudflare Workers (OpenNext), on laisse la sortie Next par défaut.
  ...(process.env.BUILD_TARGET === "docker" && { output: "standalone" as const }),
  eslint: {
    // eslint-config-next v15 uses legacy format incompatible with flat config.
    // Type checking is handled by TypeScript during build.
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    // Only proxy to localhost in development.
    // In production (Vercel), vercel.json handles /api/* routing.
    if (process.env.NODE_ENV === "production") {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default withSerwist(nextConfig);
