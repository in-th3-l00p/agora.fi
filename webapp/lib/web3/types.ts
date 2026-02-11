import { type Address } from "viem";

export interface TileInfo {
  spaceId: bigint;
  x: number;
  y: number;
  tier: number;
}

export interface SpaceInfo {
  token: Address;
  creator: Address;
  mintPrice: bigint;
}

export interface TokenAllocation {
  treasury: Address;
  team: Address;
  stakingRewards: Address;
  liquidityPool: Address;
  earlySupporters: Address;
  platformReserve: Address;
}

export interface StakeInfo {
  amount: bigint;
  weight: bigint;
  rewardDebt: bigint;
  startTime: bigint;
  unlockTime: bigint;
  tileTokenId: bigint;
  lockPeriod: LockPeriod;
  active: boolean;
}

export enum LockPeriod {
  THREE_MONTHS = 0,
  SIX_MONTHS = 1,
  TWELVE_MONTHS = 2,
  TWENTY_FOUR_MONTHS = 3,
}
