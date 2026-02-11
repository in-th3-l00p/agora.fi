"use client";

import { useCallback, useMemo } from "react";
import { useBackend } from "./useBackend";
import { OffersService } from "../services";
import type { CreateOfferInput, ListOffersQuery } from "../types";

export function useOffers() {
  const { client } = useBackend();

  const service = useMemo(() => new OffersService(client), [client]);

  const list = useCallback(
    (query?: ListOffersQuery) => service.list(query),
    [service],
  );

  const get = useCallback((id: string) => service.get(id), [service]);

  const create = useCallback(
    (input: CreateOfferInput) => service.create(input),
    [service],
  );

  const cancel = useCallback((id: string) => service.cancel(id), [service]);

  const accept = useCallback((id: string) => service.accept(id), [service]);

  const reject = useCallback((id: string) => service.reject(id), [service]);

  return { list, get, create, cancel, accept, reject };
}
