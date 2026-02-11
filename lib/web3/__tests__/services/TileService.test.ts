import { describe, it, expect, vi } from "vitest";
import { TileService } from "../../src/services/TileService";
import { agoraTileAbi } from "../../src/abis";
import { mockPublicClient, mockWalletClient, TEST_ADDRESS, TEST_CONTRACT } from "../helpers";

describe("TileService", () => {
  describe("getSpaceInfo", () => {
    it("calls readContract with correct params and maps result", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue([100n, true]);
      const svc = new TileService(TEST_CONTRACT, pub);

      const result = await svc.getSpaceInfo(1n);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: agoraTileAbi,
        functionName: "spaces",
        args: [1n],
      });
      expect(result).toEqual({ mintPrice: 100n, exists: true });
    });
  });

  describe("getTileInfo", () => {
    it("calls readContract and maps result to TileInfo", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue([1n, 5, 10, 2]);
      const svc = new TileService(TEST_CONTRACT, pub);

      const result = await svc.getTileInfo(42n);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: agoraTileAbi,
        functionName: "tiles",
        args: [42n],
      });
      expect(result).toEqual({ spaceId: 1n, x: 5, y: 10, tier: 2 });
    });
  });

  describe("ownerOf", () => {
    it("returns owner address", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(TEST_ADDRESS);
      const svc = new TileService(TEST_CONTRACT, pub);

      const result = await svc.ownerOf(1n);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: agoraTileAbi,
        functionName: "ownerOf",
        args: [1n],
      });
      expect(result).toBe(TEST_ADDRESS);
    });
  });

  describe("tileId", () => {
    it("calls readContract with spaceId, x, y", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(999n);
      const svc = new TileService(TEST_CONTRACT, pub);

      const result = await svc.tileId(1n, 5, 10);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: agoraTileAbi,
        functionName: "tileId",
        args: [1n, 5, 10],
      });
      expect(result).toBe(999n);
    });
  });

  describe("balanceOf", () => {
    it("returns balance", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(3n);
      const svc = new TileService(TEST_CONTRACT, pub);

      const result = await svc.balanceOf(TEST_ADDRESS);

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: agoraTileAbi,
        functionName: "balanceOf",
        args: [TEST_ADDRESS],
      });
      expect(result).toBe(3n);
    });
  });

  describe("getUserTiles", () => {
    it("fetches all tiles for owner", async () => {
      const pub = mockPublicClient();
      const readContract = pub.readContract as ReturnType<typeof vi.fn>;
      readContract
        .mockResolvedValueOnce(2n) // balanceOf
        .mockResolvedValueOnce(10n) // tokenOfOwnerByIndex(0)
        .mockResolvedValueOnce(20n); // tokenOfOwnerByIndex(1)
      const svc = new TileService(TEST_CONTRACT, pub);

      const result = await svc.getUserTiles(TEST_ADDRESS);

      expect(result).toEqual([10n, 20n]);
    });
  });

  describe("totalSupply", () => {
    it("returns total supply", async () => {
      const pub = mockPublicClient();
      (pub.readContract as ReturnType<typeof vi.fn>).mockResolvedValue(50n);
      const svc = new TileService(TEST_CONTRACT, pub);

      const result = await svc.totalSupply();

      expect(pub.readContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: agoraTileAbi,
        functionName: "totalSupply",
      });
      expect(result).toBe(50n);
    });
  });

  describe("mint", () => {
    it("calls writeContract with correct params", async () => {
      const pub = mockPublicClient();
      const wallet = mockWalletClient();
      (wallet.writeContract as ReturnType<typeof vi.fn>).mockResolvedValue("0xhash");
      const svc = new TileService(TEST_CONTRACT, pub, wallet);

      const result = await svc.mint(1n, 5, 10, 100n);

      expect(wallet.writeContract).toHaveBeenCalledWith({
        address: TEST_CONTRACT,
        abi: agoraTileAbi,
        functionName: "mint",
        args: [1n, 5, 10],
        value: 100n,
        chain: wallet.chain,
        account: wallet.account,
      });
      expect(result).toBe("0xhash");
    });

    it("throws when wallet not connected", async () => {
      const pub = mockPublicClient();
      const svc = new TileService(TEST_CONTRACT, pub);

      await expect(svc.mint(1n, 5, 10, 100n)).rejects.toThrow("Wallet not connected");
    });
  });
});
