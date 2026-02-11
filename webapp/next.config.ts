import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@agora.fi/web3"],
  turbopack: {},
};

export default nextConfig;
