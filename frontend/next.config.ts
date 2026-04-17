import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint vérifié séparément en CI — ne bloque pas le build Vercel
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://demoema-backend.onrender.com"
        : "http://localhost:8000");
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
