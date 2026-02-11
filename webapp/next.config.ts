import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@agora.fi/web3", "@agora.fi/backend"],
  turbopack: {},
};

export default nextConfig;
