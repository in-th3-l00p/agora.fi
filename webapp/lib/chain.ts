import { defineChain } from "viem";
import { http } from "viem";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31337);
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545";

export const chain = defineChain({
  id: chainId,
  name: chainId === 31337 ? "Anvil" : "Base Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
});

export const transport = http(rpcUrl);
