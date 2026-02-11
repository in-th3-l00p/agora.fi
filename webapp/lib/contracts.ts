// Contract addresses and chain config.
// Resolution: env vars > deployments/local.json > defaults (local anvil)

import fs from "fs";
import path from "path";

interface DeploymentArtifact {
  chainId: number;
  rpcUrl: string;
  deployer: string;
  contracts: Record<string, string>;
}

function loadLocalDeployment(): DeploymentArtifact | null {
  try {
    const filePath = path.resolve(process.cwd(), "..", "deployments", "local.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as DeploymentArtifact;
  } catch {
    return null;
  }
}

const local = loadLocalDeployment();

export const CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? local?.chainId ?? 31337
);

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? local?.rpcUrl ?? "http://127.0.0.1:8545";

export const AGORA_TILE_ADDRESS =
  process.env.NEXT_PUBLIC_AGORA_TILE_ADDRESS ??
  local?.contracts?.AgoraTile ??
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";
