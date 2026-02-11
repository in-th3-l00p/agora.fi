"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { BackendClient } from "@agora.fi/backend";
import { BackendContext } from "@agora.fi/backend/react";

const SPACES_URL =
  process.env.NEXT_PUBLIC_SPACES_SERVICE_URL ?? "http://localhost:4000";
const MARKETPLACE_URL =
  process.env.NEXT_PUBLIC_MARKETPLACE_SERVICE_URL ?? "http://localhost:4001";

// ── Marketplace client context (webapp-specific) ────────────────────
const MarketplaceContext = createContext<BackendClient | null>(null);

export function useMarketplaceClient(): BackendClient {
  const client = useContext(MarketplaceContext);
  if (!client)
    throw new Error(
      "useMarketplaceClient must be used within <BackendProvider>",
    );
  return client;
}

// ── Combined provider ───────────────────────────────────────────────
export function BackendProvider({ children }: { children: ReactNode }) {
  const spacesClient = useMemo(() => new BackendClient(SPACES_URL), []);
  const marketplaceClient = useMemo(
    () => new BackendClient(MARKETPLACE_URL),
    [],
  );

  return (
    <BackendContext.Provider value={{ client: spacesClient }}>
      <MarketplaceContext.Provider value={marketplaceClient}>
        {children}
      </MarketplaceContext.Provider>
    </BackendContext.Provider>
  );
}
