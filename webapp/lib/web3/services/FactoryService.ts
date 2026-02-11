import { type PublicClient, type WalletClient, type Address } from "viem";
import { spaceFactoryAbi } from "../abis";
import { SPACE_FACTORY_ADDRESS } from "../addresses";
import type { SpaceInfo, TokenAllocation } from "../types";

export class FactoryService {
  constructor(
    private publicClient: PublicClient,
    private walletClient?: WalletClient,
  ) {}

  private get address(): Address {
    return SPACE_FACTORY_ADDRESS;
  }

  async getSpaceInfo(spaceId: bigint): Promise<SpaceInfo> {
    const [token, creator, mintPrice] = await this.publicClient.readContract({
      address: this.address,
      abi: spaceFactoryAbi,
      functionName: "spaceInfo",
      args: [spaceId],
    });
    return { token, creator, mintPrice };
  }

  async spaceCount(): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.address,
      abi: spaceFactoryAbi,
      functionName: "spaceCount",
    });
  }

  async tokenOf(spaceId: bigint): Promise<Address> {
    return this.publicClient.readContract({
      address: this.address,
      abi: spaceFactoryAbi,
      functionName: "tokenOf",
      args: [spaceId],
    });
  }

  async spaceIdByIndex(index: bigint): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.address,
      abi: spaceFactoryAbi,
      functionName: "spaceIds",
      args: [index],
    });
  }

  async createSpace(
    spaceId: bigint,
    name: string,
    symbol: string,
    mintPrice: bigint,
    totalSupply: bigint,
    alloc: TokenAllocation,
  ): Promise<`0x${string}`> {
    if (!this.walletClient?.account) throw new Error("Wallet not connected");
    return this.walletClient.writeContract({
      address: this.address,
      abi: spaceFactoryAbi,
      functionName: "createSpace",
      args: [spaceId, name, symbol, mintPrice, totalSupply, alloc],
      chain: this.walletClient.chain,
      account: this.walletClient.account,
    });
  }
}
