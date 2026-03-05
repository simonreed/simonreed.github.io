import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/spec",
  images: { unoptimized: true },
};

export default nextConfig;
