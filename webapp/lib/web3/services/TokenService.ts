import { type PublicClient, type WalletClient, type Address } from "viem";
import { spaceTokenAbi } from "../abis";

export class TokenService {
  constructor(
    private tokenAddress: Address,
    private publicClient: PublicClient,
    private walletClient?: WalletClient,
  ) {}

  async balanceOf(account: Address): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.tokenAddress,
      abi: spaceTokenAbi,
      functionName: "balanceOf",
      args: [account],
    });
  }

  async totalSupply(): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.tokenAddress,
      abi: spaceTokenAbi,
      functionName: "totalSupply",
    });
  }

  async name(): Promise<string> {
    return this.publicClient.readContract({
      address: this.tokenAddress,
      abi: spaceTokenAbi,
      functionName: "name",
    });
  }

  async symbol(): Promise<string> {
    return this.publicClient.readContract({
      address: this.tokenAddress,
      abi: spaceTokenAbi,
      functionName: "symbol",
    });
  }

  async getVotes(account: Address): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.tokenAddress,
      abi: spaceTokenAbi,
      functionName: "getVotes",
      args: [account],
    });
  }

  async delegates(account: Address): Promise<Address> {
    return this.publicClient.readContract({
      address: this.tokenAddress,
      abi: spaceTokenAbi,
      functionName: "delegates",
      args: [account],
    });
  }

  async allowance(owner: Address, spender: Address): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.tokenAddress,
      abi: spaceTokenAbi,
      functionName: "allowance",
      args: [owner, spender],
    });
  }

  async approve(spender: Address, amount: bigint): Promise<`0x${string}`> {
    if (!this.walletClient?.account) throw new Error("Wallet not connected");
    return this.walletClient.writeContract({
      address: this.tokenAddress,
      abi: spaceTokenAbi,
      functionName: "approve",
      args: [spender, amount],
      chain: this.walletClient.chain,
      account: this.walletClient.account,
    });
  }

  async delegate(delegatee: Address): Promise<`0x${string}`> {
    if (!this.walletClient?.account) throw new Error("Wallet not connected");
    return this.walletClient.writeContract({
      address: this.tokenAddress,
      abi: spaceTokenAbi,
      functionName: "delegate",
      args: [delegatee],
      chain: this.walletClient.chain,
      account: this.walletClient.account,
    });
  }

  async transfer(to: Address, amount: bigint): Promise<`0x${string}`> {
    if (!this.walletClient?.account) throw new Error("Wallet not connected");
    return this.walletClient.writeContract({
      address: this.tokenAddress,
      abi: spaceTokenAbi,
      functionName: "transfer",
      args: [to, amount],
      chain: this.walletClient.chain,
      account: this.walletClient.account,
    });
  }
}
