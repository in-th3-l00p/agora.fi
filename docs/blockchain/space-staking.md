[← blockchain](./index.md)

# SpaceStaking

Deployed separately per space. Users stake that space's governance token to earn rewards distributed over time. Uses a Synthetix-style reward accumulator adapted for per-position weights.

## staking

Users lock tokens for a chosen period and optionally attach a tile NFT for a boost. The position's reward weight is:

**weight = amount x lock multiplier x tile tier multiplier**

Minimum stake is 100 tokens.

## lock periods

| Period | Duration | Multiplier |
|--------|----------|------------|
| 3 months | 90 days | 1.0x |
| 6 months | 180 days | 1.2x |
| 12 months | 365 days | 1.5x |
| 24 months | 730 days | 2.0x |

## tile tier boosts

Stakers can attach a tile NFT they own in the same space. The tile's tier determines the boost. Tier is checked at stake time.

| Tier | Multiplier |
|------|------------|
| None / Tier 1 | 1.0x |
| Tier 2 | 1.2x |
| Tier 3 | 1.5x |
| Tier 4 | 2.0x |
| Tier 5 | 3.0x |

## rewards

Rewards are emitted at a configurable rate (tokens per second) and split proportionally across all active positions by weight. Anyone can fund the reward pool. The owner can update the emission rate.

## key functions

| Function | Who | Description |
|----------|-----|-------------|
| `stake(amount, lock, tileTokenId)` | Anyone | Create a staking position |
| `claimReward(stakeId)` | Stake owner | Claim accrued rewards without unstaking |
| `unstake(stakeId)` | Stake owner | Withdraw principal + rewards after lock expires |
| `fundRewardPool(amount)` | Anyone | Deposit tokens into the reward pool |
| `setRewardRate(rate)` | Contract owner | Update the emission rate |
| `pendingReward(stakeId)` | View | Check unclaimed rewards for a position |
