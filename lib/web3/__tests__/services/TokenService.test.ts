import { describe, it, expect, vi } from "vitest";
import { TokenService } from "../../src/services/TokenService";
import { spaceTokenAbi } from "../../src/abis";
import { mockPublicClient, mockWalletClient, TEST_ADDRESS, TEST_CONTRACT } from "../helpers";

const OTHER_ADDRESS = "0x9876543210fedcba9876543210fedcba98765432" as const;

describe("TokenService", () => {
  describe("balanceOf", () => {
    it("calls readContract with correct params", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(1000n);
      const svc = new TokenService(TEST_CONTRACT, pub);

      const result = await svc.balanceOf(TEST_ADDRESS);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceTokenAbi,
        functionName: "balanceOf",
        args: [TEST_ADDRESS],
      });
      expect(result).toBe(1000n);
    });
  });

  describe("totalSupply", () => {
    it("returns total supply", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(1000000n);
      const svc = new TokenService(TEST_CONTRACT, pub);

      const result = await svc.totalSupply();

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceTokenAbi,
        functionName: "totalSupply",
      });
      expect(result).toBe(1000000n);
    });
  });

  describe("name", () => {
    it("returns token name", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue("Test Token");
      const svc = new TokenService(TEST_CONTRACT, pub);

      const result = await svc.name();

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceTokenAbi,
        functionName: "name",
      });
      expect(result).toBe("Test Token");
    });
  });

  describe("symbol", () => {
    it("returns token symbol", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue("TST");
      const svc = new TokenService(TEST_CONTRACT, pub);

      const result = await svc.symbol();

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceTokenAbi,
        functionName: "symbol",
      });
      expect(result).toBe("TST");
    });
  });

  describe("getVotes", () => {
    it("returns votes for account", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(500n);
      const svc = new TokenService(TEST_CONTRACT, pub);

      const result = await svc.getVotes(TEST_ADDRESS);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceTokenAbi,
        functionName: "getVotes",
        args: [TEST_ADDRESS],
      });
      expect(result).toBe(500n);
    });
  });

  describe("delegates", () => {
    it("returns delegate address", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(OTHER_ADDRESS);
      const svc = new TokenService(TEST_CONTRACT, pub);

      const result = await svc.delegates(TEST_ADDRESS);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceTokenAbi,
        functionName: "delegates",
        args: [TEST_ADDRESS],
      });
      expect(result).toBe(OTHER_ADDRESS);
    });
  });

  describe("allowance", () => {
    it("returns allowance", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(200n);
      const svc = new TokenService(TEST_CONTRACT, pub);

      const result = await svc.allowance(TEST_ADDRESS, OTHER_ADDRESS);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceTokenAbi,
        functionName: "allowance",
        args: [TEST_ADDRESS, OTHER_ADDRESS],
      });
      expect(result).toBe(200n);
    });
  });

  describe("approve", () => {
    it("calls writeContract", async () => {
      const pub = mockPublicClient();
      const wallet = mockWalletClient();
      (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
      const svc = new TokenService(TEST_CONTRACT, pub, wallet);

      const result = await svc.approve(OTHER_ADDRESS, 100n);

      expect(wallet.writeContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceTokenAbi,
        functionName: "approve",
        args: [OTHER_ADDRESS, 100n],
        chain: wallet.chain,
        account: wallet.account,
      });
      expect(result).toBe("0xhash");
    });

    it("throws when wallet not connected", async () => {
      const pub = mockPublicClient();
      const svc = new TokenService(TEST_CONTRACT, pub);

      await expect(svc.approve(OTHER_ADDRESS, 100n)).rejects.toThrow("Wallet not connected");
    });
  });

  describe("delegate", () => {
    it("calls writeContract", async () => {
      const pub = mockPublicClient();
      const wallet = mockWalletClient();
      (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
      const svc = new TokenService(TEST_CONTRACT, pub, wallet);

      const result = await svc.delegate(OTHER_ADDRESS);

      expect(wallet.writeContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceTokenAbi,
        functionName: "delegate",
        args: [OTHER_ADDRESS],
        chain: wallet.chain,
        account: wallet.account,
      });
      expect(result).toBe("0xhash");
    });

    it("throws when wallet not connected", async () => {
      const pub = mockPublicClient();
      const svc = new TokenService(TEST_CONTRACT, pub);

      await expect(svc.delegate(OTHER_ADDRESS)).rejects.toThrow("Wallet not connected");
    });
  });

  describe("transfer", () => {
    it("calls writeContract", async () => {
      const pub = mockPublicClient();
      const wallet = mockWalletClient();
      (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
      const svc = new TokenService(TEST_CONTRACT, pub, wallet);

      const result = await svc.transfer(OTHER_ADDRESS, 50n);

      expect(wallet.writeContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: spaceTokenAbi,
        functionName: "transfer",
        args: [OTHER_ADDRESS, 50n],
        chain: wallet.chain,
        account: wallet.account,
      });
      expect(result).toBe("0xhash");
    });

    it("throws when wallet not connected", async () => {
      const pub = mockPublicClient();
      const svc = new TokenService(TEST_CONTRACT, pub);

      await expect(svc.transfer(OTHER_ADDRESS, 50n)).rejects.toThrow("Wallet not connected");
    });
  });
});
