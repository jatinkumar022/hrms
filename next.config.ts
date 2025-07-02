import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-right", // <-- this also helps
  },
  images: {
    domains: ["randomuser.me", "res.cloudinary.com"],
  },
  env: {
    TOKEN_SECRET: process.env.TOKEN_SECRET, // 👈 expose the token secret to the app
  },
};

export default nextConfig;
