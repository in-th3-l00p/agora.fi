"use client";

import { useCallback, useMemo } from "react";
import { useWeb3 } from "./useWeb3";
import { FactoryService } from "@/lib/web3/services";
import type { TokenAllocation } from "@/lib/web3/types";

export function useSpaceFactory() {
  const { publicClient, walletClient } = useWeb3();

  const service = useMemo(
    () => new FactoryService(publicClient, walletClient ?? undefined),
    [publicClient, walletClient],
  );

  const getSpaceInfo = useCallback(
    (spaceId: bigint) => service.getSpaceInfo(spaceId),
    [service],
  );

  const spaceCount = useCallback(() => service.spaceCount(), [service]);

  const tokenOf = useCallback(
    (spaceId: bigint) => service.tokenOf(spaceId),
    [service],
  );

  const spaceIdByIndex = useCallback(
    (index: bigint) => service.spaceIdByIndex(index),
    [service],
  );

  const createSpace = useCallback(
    (
      spaceId: bigint,
      name: string,
      symbol: string,
      mintPrice: bigint,
      totalSupply: bigint,
      alloc: TokenAllocation,
    ) => service.createSpace(spaceId, name, symbol, mintPrice, totalSupply, alloc),
    [service],
  );

  return {
    getSpaceInfo,
    spaceCount,
    tokenOf,
    spaceIdByIndex,
    createSpace,
  };
}
