import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "https://vidaordenada-production.up.railway.app/:path*",
      },
    ];
  },
};

export default nextConfig;
