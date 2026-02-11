"use client";

import { useCallback, useMemo } from "react";
import {
  AuthService,
  ListingsService,
  OffersService,
} from "@agora.fi/backend";
import type {
  CreateListingInput,
  UpdateListingInput,
  ListListingsQuery,
  CreateOfferInput,
  ListOffersQuery,
} from "@agora.fi/backend";
import { useMarketplaceClient } from "@/components/BackendProvider";

export function useMarketplaceAuth() {
  const client = useMarketplaceClient();
  const service = useMemo(() => new AuthService(client), [client]);

  const getNonce = useCallback(
    (address: string) => service.getNonce(address),
    [service],
  );
  const verify = useCallback(
    (address: string, signature: string) => service.verify(address, signature),
    [service],
  );
  const logout = useCallback(() => service.logout(), [service]);

  return { getNonce, verify, logout };
}

export function useMarketplaceListings() {
  const client = useMarketplaceClient();
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

export function useMarketplaceOffers() {
  const client = useMarketplaceClient();
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
