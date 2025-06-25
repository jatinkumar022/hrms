import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivityPosition: "bottom-right", // <-- this also helps
  },
  images: {
    domains: ["randomuser.me"],
  },
};

export default nextConfig;
