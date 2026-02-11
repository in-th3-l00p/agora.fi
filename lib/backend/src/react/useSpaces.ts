"use client";

import { useCallback, useMemo } from "react";
import { useBackend } from "./useBackend";
import { SpacesService } from "../services";
import type { CreateSpaceInput, UpdateSpaceInput } from "../types";

export function useSpaces() {
  const { client } = useBackend();

  const service = useMemo(() => new SpacesService(client), [client]);

  const list = useCallback(() => service.list(), [service]);

  const get = useCallback(
    (spaceId: string) => service.get(spaceId),
    [service],
  );

  const create = useCallback(
    (input: CreateSpaceInput) => service.create(input),
    [service],
  );

  const update = useCallback(
    (spaceId: string, input: UpdateSpaceInput) =>
      service.update(spaceId, input),
    [service],
  );

  const del = useCallback(
    (spaceId: string) => service.delete(spaceId),
    [service],
  );

  return { list, get, create, update, delete: del };
}
