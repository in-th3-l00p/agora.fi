"use client";

import { useCallback, useMemo } from "react";
import { useBackend } from "./useBackend";
import { AuthService } from "../services";

export function useAuth() {
  const { client } = useBackend();

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
