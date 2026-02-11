"use client";

import { createContext, useContext } from "react";
import type { BackendClient } from "../client";

export interface BackendContextValue {
  client: BackendClient;
}

export const BackendContext = createContext<BackendContextValue | null>(null);

export function useBackend(): BackendContextValue {
  const ctx = useContext(BackendContext);
  if (!ctx) throw new Error("useBackend must be used within <BackendProvider>");
  return ctx;
}
