import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "central.buttoninks.com",
      },
      {
        protocol: "https",
        hostname: "buttoninks.com",
      },
      {
        protocol: "https",
        hostname: "www.buttoninks.com",
      },
    ],
  },
};

export default nextConfig;
