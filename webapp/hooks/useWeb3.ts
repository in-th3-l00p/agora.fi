"use client";

import { useContext } from "react";
import { Web3Context, type Web3ContextValue } from "@/lib/web3/Web3Provider";

export function useWeb3(): Web3ContextValue {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within <Web3Provider>");
  return ctx;
}
