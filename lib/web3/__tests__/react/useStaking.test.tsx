import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { Web3Context, type Web3ContextValue } from "../../src/react/useWeb3";
import { useStaking } from "../../src/react/useStaking";
import { LockPeriod } from "../../src/types";
import { mockPublicClient, mockWalletClient, TEST_ADDRESS, TEST_CONTRACT } from "../helpers";

function wrapper(value: Web3ContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(Web3Context.Provider, { value }, children);
  };
}

describe("useStaking", () => {
  it("returns all hook methods", () => {
    const ctx: Web3ContextValue = {
      publicClient: mockPublicClient(),
      walletClient: mockWalletClient(),
      isConnected: true,
      address: TEST_ADDRESS,
    };

    const { result } = renderHook(() => useStaking(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    expect(result.current.getStakeInfo).toBeTypeOf("function");
    expect(result.current.pendingReward).toBeTypeOf("function");
    expect(result.current.getUserStakeIds).toBeTypeOf("function");
    expect(result.current.totalWeight).toBeTypeOf("function");
    expect(result.current.rewardRate).toBeTypeOf("function");
    expect(result.current.rewardPool).toBeTypeOf("function");
    expect(result.current.stake).toBeTypeOf("function");
    expect(result.current.claimReward).toBeTypeOf("function");
    expect(result.current.unstake).toBeTypeOf("function");
  });

  it("delegates pendingReward to StakingService", async () => {
    const pub = mockPublicClient();
    (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(300n);
    const ctx: Web3ContextValue = {
      publicClient: pub,
      walletClient: null,
      isConnected: false,
      address: null,
    };

    const { result } = renderHook(() => useStaking(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    const reward = await result.current.pendingReward(1n);
    expect(reward).toBe(300n);
    expect(pub.readContract).toHaveBeenCalled();
  });

  it("delegates stake to StakingService", async () => {
    const pub = mockPublicClient();
    const wallet = mockWalletClient();
    (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
    const ctx: Web3ContextValue = {
      publicClient: pub,
      walletClient: wallet,
      isConnected: true,
      address: TEST_ADDRESS,
    };

    const { result } = renderHook(() => useStaking(TEST_CONTRACT), {
      wrapper: wrapper(ctx),
    });

    const hash = await result.current.stake(100n, LockPeriod.SIX_MONTHS, 5n);
    expect(hash).toBe("0xhash");
    expect(wallet.writeContract).toHaveBeenCalled();
  });
});
