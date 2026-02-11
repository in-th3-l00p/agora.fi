import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { Web3Context, type Web3ContextValue } from "../../src/react/useWeb3";
import { useSpaceToken } from "../../src/react/useSpaceToken";
import { mockPublicClient, mockWalletClient, TEST_ADDRESS, TEST_CONTRACT } from "../helpers";

const OTHER_ADDRESS = "0x9876543210fedcba9876543210fedcba98765432" as const;

function wrapper(value: Web3ContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(Web3Context.Provider, { value }, children);
  };
}

describe("useSpaceToken", () => {
  it("returns all hook methods", () => {
    const ctx: Web3ContextValue = {
      publicClient: mockPublicClient(),
      walletClient: mockWalletClient(),
      isConnected: true,
      address: TEST_ADDRESS,
    };

    const { result } = renderHook(() => useSpaceToken(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    expect(result.current.balanceOf).toBeTypeOf("function");
    expect(result.current.totalSupply).toBeTypeOf("function");
    expect(result.current.name).toBeTypeOf("function");
    expect(result.current.symbol).toBeTypeOf("function");
    expect(result.current.getVotes).toBeTypeOf("function");
    expect(result.current.delegates).toBeTypeOf("function");
    expect(result.current.allowance).toBeTypeOf("function");
    expect(result.current.approve).toBeTypeOf("function");
    expect(result.current.delegate).toBeTypeOf("function");
    expect(result.current.transfer).toBeTypeOf("function");
  });

  it("delegates balanceOf to TokenService", async () => {
    const pub = mockPublicClient();
    (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(1000n);
    const ctx: Web3ContextValue = {
      publicClient: pub,
      walletClient: null,
      isConnected: false,
      address: null,
    };

    const { result } = renderHook(() => useSpaceToken(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    const balance = await result.current.balanceOf(TEST_ADDRESS);
    expect(balance).toBe(1000n);
    expect(pub.readContract).toHaveBeenCalled();
  });

  it("delegates approve to TokenService", async () => {
    const pub = mockPublicClient();
    const wallet = mockWalletClient();
    (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
    const ctx: Web3ContextValue = {
      publicClient: pub,
      walletClient: wallet,
      isConnected: true,
      address: TEST_ADDRESS,
    };

    const { result } = renderHook(() => useSpaceToken(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    const hash = await result.current.approve(OTHER_ADDRESS, 100n);
    expect(hash).toBe("0xhash");
    expect(wallet.writeContract).toHaveBeenCalled();
  });
});
