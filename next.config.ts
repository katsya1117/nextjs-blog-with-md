import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // 開発時にチェックを厳しくする
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
      {
        protocol: "https",
        hostname: "pub-87cc761d49c546f89a7ea60f2cc35faf.r2.dev", // body 内の画像用
      },
    ],
  },
};

export default nextConfig;