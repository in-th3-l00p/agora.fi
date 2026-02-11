"use client";

import { createContext, useContext } from "react";
import type { PublicClient, WalletClient, Address } from "viem";

export interface Web3ContextValue {
  publicClient: PublicClient;
  walletClient: WalletClient | null;
  isConnected: boolean;
  address: Address | null;
}

export const Web3Context = createContext<Web3ContextValue | null>(null);

export function useWeb3(): Web3ContextValue {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within <Web3Provider>");
  return ctx;
}
