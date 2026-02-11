import { type PublicClient, type WalletClient, type Address } from "viem";
import { spaceStakingAbi } from "../abis";
import type { StakeInfo, LockPeriod } from "../types";

export class StakingService {
  constructor(
    private stakingAddress: Address,
    private publicClient: PublicClient,
    private walletClient?: WalletClient,
  ) {}

  async getStakeInfo(stakeId: bigint): Promise<StakeInfo> {
    const [amount, weight, rewardDebt, startTime, unlockTime, tileTokenId, lockPeriod, active] =
      await this.publicClient.readContract({
        address: this.stakingAddress,
        abi: spaceStakingAbi,
        functionName: "stakes",
        args: [stakeId],
      });
    return {
      amount,
      weight,
      rewardDebt,
      startTime: BigInt(startTime),
      unlockTime: BigInt(unlockTime),
      tileTokenId,
      lockPeriod: lockPeriod as LockPeriod,
      active,
    };
  }

  async pendingReward(stakeId: bigint): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.stakingAddress,
      abi: spaceStakingAbi,
      functionName: "pendingReward",
      args: [stakeId],
    });
  }

  async getUserStakeIds(user: Address): Promise<readonly bigint[]> {
    return this.publicClient.readContract({
      address: this.stakingAddress,
      abi: spaceStakingAbi,
      functionName: "getUserStakeIds",
      args: [user],
    });
  }

  async totalWeight(): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.stakingAddress,
      abi: spaceStakingAbi,
      functionName: "totalWeight",
    });
  }

  async rewardRate(): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.stakingAddress,
      abi: spaceStakingAbi,
      functionName: "rewardRate",
    });
  }

  async rewardPool(): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.stakingAddress,
      abi: spaceStakingAbi,
      functionName: "rewardPool",
    });
  }

  async stake(
    amount: bigint,
    lockPeriod: LockPeriod,
    tileTokenId: bigint,
  ): Promise<`0x${string}`> {
    if (!this.walletClient?.account) throw new Error("Wallet not connected");
    return this.walletClient.writeContract({
      address: this.stakingAddress,
      abi: spaceStakingAbi,
      functionName: "stake",
      args: [amount, lockPeriod, tileTokenId],
      chain: this.walletClient.chain,
      account: this.walletClient.account,
    });
  }

  async claimReward(stakeId: bigint): Promise<`0x${string}`> {
    if (!this.walletClient?.account) throw new Error("Wallet not connected");
    return this.walletClient.writeContract({
      address: this.stakingAddress,
      abi: spaceStakingAbi,
      functionName: "claimReward",
      args: [stakeId],
      chain: this.walletClient.chain,
      account: this.walletClient.account,
    });
  }

  async unstake(stakeId: bigint): Promise<`0x${string}`> {
    if (!this.walletClient?.account) throw new Error("Wallet not connected");
    return this.walletClient.writeContract({
      address: this.stakingAddress,
      abi: spaceStakingAbi,
      functionName: "unstake",
      args: [stakeId],
      chain: this.walletClient.chain,
      account: this.walletClient.account,
    });
  }
}
