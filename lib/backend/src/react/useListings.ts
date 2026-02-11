"use client";

import { useCallback, useMemo } from "react";
import { useBackend } from "./useBackend";
import { ListingsService } from "../services";
import type {
  CreateListingInput,
  UpdateListingInput,
  ListListingsQuery,
} from "../types";

export function useListings() {
  const { client } = useBackend();

  const service = useMemo(() => new ListingsService(client), [client]);

  const list = useCallback(
    (query?: ListListingsQuery) => service.list(query),
    [service],
  );

  const get = useCallback((id: string) => service.get(id), [service]);

  const create = useCallback(
    (input: CreateListingInput) => service.create(input),
    [service],
  );

  const update = useCallback(
    (id: string, input: UpdateListingInput) => service.update(id, input),
    [service],
  );

  const cancel = useCallback((id: string) => service.cancel(id), [service]);

  const purchase = useCallback(
    (id: string) => service.purchase(id),
    [service],
  );

  return { list, get, create, update, cancel, purchase };
}
