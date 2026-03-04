import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  // skipWaiting dihapus di sini
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default withPWA(nextConfig);