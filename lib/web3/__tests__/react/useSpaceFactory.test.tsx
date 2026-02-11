import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { Web3Context, type Web3ContextValue } from "../../src/react/useWeb3";
import { useSpaceFactory } from "../../src/react/useSpaceFactory";
import { mockPublicClient, mockWalletClient, TEST_ADDRESS, TEST_CONTRACT } from "../helpers";

function wrapper(value: Web3ContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(Web3Context.Provider, { value }, children);
  };
}

describe("useSpaceFactory", () => {
  it("returns all hook methods", () => {
    const ctx: Web3ContextValue = {
      publicClient: mockPublicClient(),
      walletClient: mockWalletClient(),
      isConnected: true,
      address: TEST_ADDRESS,
    };

    const { result } = renderHook(() => useSpaceFactory(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    expect(result.current.getSpaceInfo).toBeTypeOf("function");
    expect(result.current.spaceCount).toBeTypeOf("function");
    expect(result.current.tokenOf).toBeTypeOf("function");
    expect(result.current.spaceIdByIndex).toBeTypeOf("function");
    expect(result.current.createSpace).toBeTypeOf("function");
  });

  it("delegates spaceCount to FactoryService", async () => {
    const pub = mockPublicClient();
    (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(5n);
    const ctx: Web3ContextValue = {
      publicClient: pub,
      walletClient: null,
      isConnected: false,
      address: null,
    };

    const { result } = renderHook(() => useSpaceFactory(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    const count = await result.current.spaceCount();
    expect(count).toBe(5n);
    expect(pub.readContract).toHaveBeenCalled();
  });

  it("delegates createSpace to FactoryService", async () => {
    const pub = mockPublicClient();
    const wallet = mockWalletClient();
    (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
    const ctx: Web3ContextValue = {
      publicClient: pub,
      walletClient: wallet,
      isConnected: true,
      address: TEST_ADDRESS,
    };

    const { result } = renderHook(() => useSpaceFactory(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    const alloc = {
      treasury: TEST_ADDRESS,
      team: TEST_ADDRESS,
      stakingRewards: TEST_ADDRESS,
      liquidityPool: TEST_ADDRESS,
      earlySupporters: TEST_ADDRESS,
      platformReserve: TEST_ADDRESS,
    };

    const hash = await result.current.createSpace(1n, "Test", "TST", 100n, 1000n, alloc);
    expect(hash).toBe("0xhash");
    expect(wallet.writeContract).toHaveBeenCalled();
  });
});
