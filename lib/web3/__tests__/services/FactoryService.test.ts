import { describe, it, expect, vi } from "vitest";
import { FactoryService } from "../../src/services/FactoryService";
import { spaceFactoryAbi } from "../../src/abis";
import { mockPublicClient, mockWalletClient, TEST_ADDRESS, TEST_CONTRACT } from "../helpers";

describe("FactoryService", () => {
  describe("getSpaceInfo", () => {
    it("calls readContract and maps result to SpaceInfo", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue([
        TEST_ADDRESS,
        TEST_ADDRESS,
        100n,
      ]);
      const svc = new FactoryService(TEST_CONTRACT, pub);

      const result = await svc.getSpaceInfo(1n);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceFactoryAbi,
        functionName: "spaceInfo",
        args: [1n],
      });
      expect(result).toEqual({
        token: TEST_ADDRESS,
        creator: TEST_ADDRESS,
        mintPrice: 100n,
      });
    });
  });

  describe("spaceCount", () => {
    it("returns count", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(5n);
      const svc = new FactoryService(TEST_CONTRACT, pub);

      const result = await svc.spaceCount();

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceFactoryAbi,
        functionName: "spaceCount",
      });
      expect(result).toBe(5n);
    });
  });

  describe("tokenOf", () => {
    it("returns token address", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(TEST_ADDRESS);
      const svc = new FactoryService(TEST_CONTRACT, pub);

      const result = await svc.tokenOf(1n);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceFactoryAbi,
        functionName: "tokenOf",
        args: [1n],
      });
      expect(result).toBe(TEST_ADDRESS);
    });
  });

  describe("spaceIdByIndex", () => {
    it("returns space id", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(42n);
      const svc = new FactoryService(TEST_CONTRACT, pub);

      const result = await svc.spaceIdByIndex(0n);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceFactoryAbi,
        functionName: "spaceIds",
        args: [0n],
      });
      expect(result).toBe(42n);
    });
  });

  describe("createSpace", () => {
    it("calls writeContract with correct params", async () => {
      const pub = mockPublicClient();
      const wallet = mockWalletClient();
      (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
      const svc = new FactoryService(TEST_CONTRACT, pub, wallet);

      const alloc = {
        treasury: TEST_ADDRESS,
        team: TEST_ADDRESS,
        stakingRewards: TEST_ADDRESS,
        liquidityPool: TEST_ADDRESS,
        earlySupporters: TEST_ADDRESS,
        platformReserve: TEST_ADDRESS,
      };

      const result = await svc.createSpace(1n, "Test", "TST", 100n, 1000n, alloc);

      expect(wallet.writeContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceFactoryAbi,
        functionName: "createSpace",
        args: [1n, "Test", "TST", 100n, 1000n, alloc],
        chain: wallet.chain,
        account: wallet.account,
      });
      expect(result).toBe("0xhash");
    });

    it("throws when wallet not connected", async () => {
      const pub = mockPublicClient();
      const svc = new FactoryService(TEST_CONTRACT, pub);

      const alloc = {
        treasury: TEST_ADDRESS,
        team: TEST_ADDRESS,
        stakingRewards: TEST_ADDRESS,
        liquidityPool: TEST_ADDRESS,
        earlySupporters: TEST_ADDRESS,
        platformReserve: TEST_ADDRESS,
      };

      await expect(
        svc.createSpace(1n, "Test", "TST", 100n, 1000n, alloc),
      ).rejects.toThrow("Wallet not connected");
    });
  });
});
