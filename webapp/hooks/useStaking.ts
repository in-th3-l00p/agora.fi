"use client";

import { useCallback, useMemo } from "react";
import { type Address } from "viem";
import { useWeb3 } from "./useWeb3";
import { StakingService } from "@/lib/web3/services";
import type { LockPeriod } from "@/lib/web3/types";

export function useStaking(stakingAddress: Address) {
  const { publicClient, walletClient } = useWeb3();

  const service = useMemo(
    () => new StakingService(stakingAddress, publicClient, walletClient ?? undefined),
    [stakingAddress, publicClient, walletClient],
  );

  const getStakeInfo = useCallback(
    (stakeId: bigint) => service.getStakeInfo(stakeId),
    [service],
  );

  const pendingReward = useCallback(
    (stakeId: bigint) => service.pendingReward(stakeId),
    [service],
  );

  const getUserStakeIds = useCallback(
    (user: Address) => service.getUserStakeIds(user),
    [service],
  );

  const totalWeight = useCallback(() => service.totalWeight(), [service]);

  const rewardRate = useCallback(() => service.rewardRate(), [service]);

  const rewardPool = useCallback(() => service.rewardPool(), [service]);

  const stake = useCallback(
    (amount: bigint, lockPeriod: LockPeriod, tileTokenId: bigint) =>
      service.stake(amount, lockPeriod, tileTokenId),
    [service],
  );

  const claimReward = useCallback(
    (stakeId: bigint) => service.claimReward(stakeId),
    [service],
  );

  const unstake = useCallback(
    (stakeId: bigint) => service.unstake(stakeId),
    [service],
  );

  return {
    getStakeInfo,
    pendingReward,
    getUserStakeIds,
    totalWeight,
    rewardRate,
    rewardPool,
    stake,
    claimReward,
    unstake,
  };
}
