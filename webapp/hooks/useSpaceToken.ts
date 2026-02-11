"use client";

import { useCallback, useMemo } from "react";
import { type Address } from "viem";
import { useWeb3 } from "./useWeb3";
import { TokenService } from "@/lib/web3/services";

export function useSpaceToken(tokenAddress: Address) {
  const { publicClient, walletClient } = useWeb3();

  const service = useMemo(
    () => new TokenService(tokenAddress, publicClient, walletClient ?? undefined),
    [tokenAddress, publicClient, walletClient],
  );

  const balanceOf = useCallback(
    (account: Address) => service.balanceOf(account),
    [service],
  );

  const totalSupply = useCallback(() => service.totalSupply(), [service]);

  const name = useCallback(() => service.name(), [service]);

  const symbol = useCallback(() => service.symbol(), [service]);

  const getVotes = useCallback(
    (account: Address) => service.getVotes(account),
    [service],
  );

  const delegates = useCallback(
    (account: Address) => service.delegates(account),
    [service],
  );

  const allowance = useCallback(
    (owner: Address, spender: Address) => service.allowance(owner, spender),
    [service],
  );

  const approve = useCallback(
    (spender: Address, amount: bigint) => service.approve(spender, amount),
    [service],
  );

  const delegate = useCallback(
    (delegatee: Address) => service.delegate(delegatee),
    [service],
  );

  const transfer = useCallback(
    (to: Address, amount: bigint) => service.transfer(to, amount),
    [service],
  );

  return {
    balanceOf,
    totalSupply,
    name,
    symbol,
    getVotes,
    delegates,
    allowance,
    approve,
    delegate,
    transfer,
  };
}
