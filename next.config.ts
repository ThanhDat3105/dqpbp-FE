import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev",
      },
    ],
  },
};

export default nextConfig;
