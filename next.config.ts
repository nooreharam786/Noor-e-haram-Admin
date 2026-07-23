import path from "path";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isProd ? "export" : undefined,
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
