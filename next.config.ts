import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "profile.line-scdn.net"
      }
    ]
  }
};

export default nextConfig;
