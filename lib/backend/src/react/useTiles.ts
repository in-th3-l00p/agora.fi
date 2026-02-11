"use client";

import { useCallback, useMemo } from "react";
import { useBackend } from "./useBackend";
import { TilesService } from "../services";
import type { CreateTileInput, UpdateTileInput } from "../types";

export function useTiles(spaceId: string) {
  const { client } = useBackend();

  const service = useMemo(
    () => new TilesService(spaceId, client),
    [spaceId, client],
  );

  const list = useCallback(() => service.list(), [service]);

  const get = useCallback(
    (tokenId: number) => service.get(tokenId),
    [service],
  );

  const create = useCallback(
    (input: CreateTileInput) => service.create(input),
    [service],
  );

  const update = useCallback(
    (tokenId: number, input: UpdateTileInput) =>
      service.update(tokenId, input),
    [service],
  );

  const del = useCallback(
    (tokenId: number) => service.delete(tokenId),
    [service],
  );

  return { list, get, create, update, delete: del };
}
