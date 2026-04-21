import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.BUILD_TARGET === "docker" && { output: "standalone" as const }),
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      if (process.env.BACKEND_URL) {
        return [{ source: "/api/:path*", destination: `${process.env.BACKEND_URL}/api/:path*` }];
      }
      return [];
    }
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
