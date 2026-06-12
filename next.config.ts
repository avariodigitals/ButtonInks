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
        hostname: "buttoninks.com",
      },
      {
        protocol: "https",
        hostname: "*.your-wordpress-site.com", // update when backend is live
      },
    ],
  },
};

export default nextConfig;
