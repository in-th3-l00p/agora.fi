import { vi } from "vitest";
import type { PublicClient, WalletClient } from "viem";

export const TEST_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678" as const;
export const TEST_CONTRACT = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as const;

export function mockPublicClient() {
  return { readContract: vi.fn() } as unknown as PublicClient;
}

export function mockWalletClient() {
  return {
    writeContract: vi.fn(),
    account: { address: TEST_ADDRESS },
    chain: { id: 31337 },
  } as unknown as WalletClient;
}
