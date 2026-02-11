"use client";

import { useCallback, useMemo } from "react";
import { type Address } from "viem";
import { useWeb3 } from "./useWeb3";
import { TileService } from "../services";

export function useTile(contractAddress: Address) {
  const { publicClient, walletClient } = useWeb3();

  const service = useMemo(
    () => new TileService(contractAddress, publicClient, walletClient ?? undefined),
    [contractAddress, publicClient, walletClient],
  );

  const getSpaceInfo = useCallback(
    (spaceId: bigint) => service.getSpaceInfo(spaceId),
    [service],
  );

  const getTileInfo = useCallback(
    (tokenId: bigint) => service.getTileInfo(tokenId),
    [service],
  );

  const ownerOf = useCallback(
    (tokenId: bigint) => service.ownerOf(tokenId),
    [service],
  );

  const tileId = useCallback(
    (spaceId: bigint, x: number, y: number) => service.tileId(spaceId, x, y),
    [service],
  );

  const getUserTiles = useCallback(
    (owner: Address) => service.getUserTiles(owner),
    [service],
  );

  const totalSupply = useCallback(() => service.totalSupply(), [service]);

  const mint = useCallback(
    (spaceId: bigint, x: number, y: number, value: bigint) =>
      service.mint(spaceId, x, y, value),
    [service],
  );

  return {
    getSpaceInfo,
    getTileInfo,
    ownerOf,
    tileId,
    getUserTiles,
    totalSupply,
    mint,
  };
}
