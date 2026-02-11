import { describe, it, expect, vi } from "vitest";
import { StakingService } from "../../src/services/StakingService";
import { spaceStakingAbi } from "../../src/abis";
import { LockPeriod } from "../../src/types";
import { mockPublicClient, mockWalletClient, TEST_ADDRESS, TEST_CONTRACT } from "../helpers";

describe("StakingService", () => {
  describe("getStakeInfo", () => {
    it("calls readContract and maps result to StakeInfo", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue([
        100n, 200n, 50n, 1000n, 2000n, 5n, 0, true,
      ]);
      const svc = new StakingService(TEST_CONTRACT, pub);

      const result = await svc.getStakeInfo(1n);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceStakingAbi,
        functionName: "stakes",
        args: [1n],
      });
      expect(result).toEqual({
        amount: 100n,
        weight: 200n,
        rewardDebt: 50n,
        startTime: 1000n,
        unlockTime: 2000n,
        tileTokenId: 5n,
        lockPeriod: LockPeriod.THREE_MONTHS,
        active: true,
      });
    });
  });

  describe("pendingReward", () => {
    it("returns pending reward", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(300n);
      const svc = new StakingService(TEST_CONTRACT, pub);

      const result = await svc.pendingReward(1n);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceStakingAbi,
        functionName: "pendingReward",
        args: [1n],
      });
      expect(result).toBe(300n);
    });
  });

  describe("getUserStakeIds", () => {
    it("returns stake ids array", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue([1n, 2n, 3n]);
      const svc = new StakingService(TEST_CONTRACT, pub);

      const result = await svc.getUserStakeIds(TEST_ADDRESS);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceStakingAbi,
        functionName: "getUserStakeIds",
        args: [TEST_ADDRESS],
      });
      expect(result).toEqual([1n, 2n, 3n]);
    });
  });

  describe("totalWeight", () => {
    it("returns total weight", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(5000n);
      const svc = new StakingService(TEST_CONTRACT, pub);

      const result = await svc.totalWeight();

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceStakingAbi,
        functionName: "totalWeight",
      });
      expect(result).toBe(5000n);
    });
  });

  describe("rewardRate", () => {
    it("returns reward rate", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(10n);
      const svc = new StakingService(TEST_CONTRACT, pub);

      const result = await svc.rewardRate();

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceStakingAbi,
        functionName: "rewardRate",
      });
      expect(result).toBe(10n);
    });
  });

  describe("rewardPool", () => {
    it("returns reward pool", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(50000n);
      const svc = new StakingService(TEST_CONTRACT, pub);

      const result = await svc.rewardPool();

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceStakingAbi,
        functionName: "rewardPool",
      });
      expect(result).toBe(50000n);
    });
  });

  describe("stake", () => {
    it("calls writeContract with correct params", async () => {
      const pub = mockPublicClient();
      const wallet = mockWalletClient();
      (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
      const svc = new StakingService(TEST_CONTRACT, pub, wallet);

      const result = await svc.stake(100n, LockPeriod.SIX_MONTHS, 5n);

      expect(wallet.writeContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceStakingAbi,
        functionName: "stake",
        args: [100n, LockPeriod.SIX_MONTHS, 5n],
        chain: wallet.chain,
        account: wallet.account,
      });
      expect(result).toBe("0xhash");
    });

    it("throws when wallet not connected", async () => {
      const pub = mockPublicClient();
      const svc = new StakingService(TEST_CONTRACT, pub);

      await expect(svc.stake(100n, LockPeriod.SIX_MONTHS, 5n)).rejects.toThrow(
        "Wallet not connected",
      );
    });
  });

  describe("claimReward", () => {
    it("calls writeContract", async () => {
      const pub = mockPublicClient();
      const wallet = mockWalletClient();
      (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
      const svc = new StakingService(TEST_CONTRACT, pub, wallet);

      const result = await svc.claimReward(1n);

      expect(wallet.writeContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceStakingAbi,
        functionName: "claimReward",
        args: [1n],
        chain: wallet.chain,
        account: wallet.account,
      });
      expect(result).toBe("0xhash");
    });

    it("throws when wallet not connected", async () => {
      const pub = mockPublicClient();
      const svc = new StakingService(TEST_CONTRACT, pub);

      await expect(svc.claimReward(1n)).rejects.toThrow("Wallet not connected");
    });
  });

  describe("unstake", () => {
    it("calls writeContract", async () => {
      const pub = mockPublicClient();
      const wallet = mockWalletClient();
      (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
      const svc = new StakingService(TEST_CONTRACT, pub, wallet);

      const result = await svc.unstake(1n);

      expect(wallet.writeContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceStakingAbi,
        functionName: "unstake",
        args: [1n],
        chain: wallet.chain,
        account: wallet.account,
      });
      expect(result).toBe("0xhash");
    });

    it("throws when wallet not connected", async () => {
      const pub = mockPublicClient();
      const svc = new StakingService(TEST_CONTRACT, pub);

      await expect(svc.unstake(1n)).rejects.toThrow("Wallet not connected");
    });
  });
});
