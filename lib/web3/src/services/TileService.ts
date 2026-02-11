import { type PublicClient, type WalletClient, type Address } from "viem";
import { agoraTileAbi } from "../abis";
import type { TileInfo } from "../types";

export class TileService {
  constructor(
    private contractAddress: Address,
    private publicClient: PublicClient,
    private walletClient?: WalletClient,
  ) {}

  async getSpaceInfo(spaceId: bigint): Promise<{ mintPrice: bigint; exists: boolean }> {
    const [mintPrice, exists] = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: agoraTileAbi,
      functionName: "spaces",
      args: [spaceId],
    });
    return { mintPrice, exists };
  }

  async getTileInfo(tokenId: bigint): Promise<TileInfo> {
    const [spaceId, x, y, tier] = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: agoraTileAbi,
      functionName: "tiles",
      args: [tokenId],
    });
    return { spaceId, x, y, tier };
  }

  async ownerOf(tokenId: bigint): Promise<Address> {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: agoraTileAbi,
      functionName: "ownerOf",
      args: [tokenId],
    });
  }

  async tileId(spaceId: bigint, x: number, y: number): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: agoraTileAbi,
      functionName: "tileId",
      args: [spaceId, x, y],
    });
  }

  async balanceOf(owner: Address): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: agoraTileAbi,
      functionName: "balanceOf",
      args: [owner],
    });
  }

  async tokenOfOwnerByIndex(owner: Address, index: bigint): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: agoraTileAbi,
      functionName: "tokenOfOwnerByIndex",
      args: [owner, index],
    });
  }

  async getUserTiles(owner: Address): Promise<bigint[]> {
    const balance = await this.balanceOf(owner);
    const tiles: bigint[] = [];
    for (let i = 0n; i < balance; i++) {
      tiles.push(await this.tokenOfOwnerByIndex(owner, i));
    }
    return tiles;
  }

  async totalSupply(): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: agoraTileAbi,
      functionName: "totalSupply",
    });
  }

  async mint(spaceId: bigint, x: number, y: number, value: bigint): Promise<`0x${string}`> {
    if (!this.walletClient?.account) throw new Error("Wallet not connected");
    return this.walletClient.writeContract({
      address: this.contractAddress,
      abi: agoraTileAbi,
      functionName: "mint",
      args: [spaceId, x, y],
      value,
      chain: this.walletClient.chain,
      account: this.walletClient.account,
    });
  }
}
