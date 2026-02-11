// Contract addresses and chain config.
// Resolution: env vars > deployments/local.json > defaults (local anvil)

interface DeploymentArtifact {
  chainId: number;
  rpcUrl: string;
  deployer: string;
  contracts: Record<string, string>;
}

function loadLocalDeployment(): DeploymentArtifact | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("../../deployments/local.json") as DeploymentArtifact;
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
