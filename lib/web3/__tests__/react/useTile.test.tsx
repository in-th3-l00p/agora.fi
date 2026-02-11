import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { Web3Context, type Web3ContextValue } from "../../src/react/useWeb3";
import { useTile } from "../../src/react/useTile";
import { mockPublicClient, mockWalletClient, TEST_CONTRACT } from "../helpers";

function wrapper(value: Web3ContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(Web3Context.Provider, { value }, children);
  };
}

describe("useTile", () => {
  it("returns all hook methods", () => {
    const ctx: Web3ContextValue = {
      publicClient: mockPublicClient(),
      walletClient: mockWalletClient(),
      isConnected: true,
      address: "0x1234567890abcdef1234567890abcdef12345678",
    };

    const { result } = renderHook(() => useTile(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    expect(result.current.getSpaceInfo).toBeTypeOf("function");
    expect(result.current.getTileInfo).toBeTypeOf("function");
    expect(result.current.ownerOf).toBeTypeOf("function");
    expect(result.current.tileId).toBeTypeOf("function");
    expect(result.current.getUserTiles).toBeTypeOf("function");
    expect(result.current.totalSupply).toBeTypeOf("function");
    expect(result.current.mint).toBeTypeOf("function");
  });

  it("delegates getSpaceInfo to TileService", async () => {
    const pub = mockPublicClient();
    (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue([100n, true]);
    const ctx: Web3ContextValue = {
      publicClient: pub,
      walletClient: null,
      isConnected: false,
      address: null,
    };

    const { result } = renderHook(() => useTile(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    const info = await result.current.getSpaceInfo(1n);
    expect(info).toEqual({ mintPrice: 100n, exists: true });
    expect(pub.readContract).toHaveBeenCalled();
  });

  it("delegates mint to TileService", async () => {
    const pub = mockPublicClient();
    const wallet = mockWalletClient();
    (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
    const ctx: Web3ContextValue = {
      publicClient: pub,
      walletClient: wallet,
      isConnected: true,
      address: "0x1234567890abcdef1234567890abcdef12345678",
    };

    const { result } = renderHook(() => useTile(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    const hash = await result.current.mint(1n, 5, 10, 100n);
    expect(hash).toBe("0xhash");
    expect(wallet.writeContract).toHaveBeenCalled();
  });
});
