import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "striped-perch-765.convex.cloud",
        pathname: "/api/storage/**",
      },
    ],
  },
};

export default nextConfig;
