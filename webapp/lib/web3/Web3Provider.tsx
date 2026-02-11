"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  type PublicClient,
  type WalletClient,
  type Address,
} from "viem";
import { useWallets } from "@privy-io/react-auth";
import { chain, transport } from "./chain";

export interface Web3ContextValue {
  publicClient: PublicClient;
  walletClient: WalletClient | null;
  isConnected: boolean;
  address: Address | null;
}

export const Web3Context = createContext<Web3ContextValue | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const { wallets, ready } = useWallets();
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [address, setAddress] = useState<Address | null>(null);

  const publicClient = useMemo(
    () => createPublicClient({ chain, transport }),
    [],
  );

  useEffect(() => {
    if (!ready) return;

    const wallet = wallets[0];
    if (!wallet) {
      setWalletClient(null);
      setAddress(null);
      return;
    }

    let cancelled = false;

    wallet.getEthereumProvider().then((provider) => {
      if (cancelled) return;
      const client = createWalletClient({
        account: wallet.address as Address,
        chain,
        transport: custom(provider),
      });
      setWalletClient(client);
      setAddress(wallet.address as Address);
    });

    return () => {
      cancelled = true;
    };
  }, [wallets, ready]);

  const value = useMemo<Web3ContextValue>(
    () => ({
      publicClient: publicClient as PublicClient,
      walletClient,
      isConnected: walletClient !== null,
      address,
    }),
    [publicClient, walletClient, address],
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}
