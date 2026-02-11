// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin-contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin-contracts/access/Ownable.sol";
import {AgoraTile} from "./AgoraTile.sol";

/// @title SpaceStaking
/// @notice Stake a Space's governance tokens to earn rewards.
///
///         Reward weight = amount × lockMultiplier × tileMultiplier
///
///         Lock multipliers  (basis points, 10_000 = 1.0×):
///           3 months  → 1.0×   (10 000)
///           6 months  → 1.2×   (12 000)
///          12 months  → 1.5×   (15 000)
///          24 months  → 2.0×   (20 000)
///
///         Tile tier multipliers  (basis points):
///           No tile  → 1.0×   (10 000)
///           Tier 1   → 1.0×   (10 000)
///           Tier 2   → 1.2×   (12 000)
///           Tier 3   → 1.5×   (15 000)
///           Tier 4   → 2.0×   (20 000)
///           Tier 5   → 3.0×   (30 000)
///
///         Uses a global reward-per-weighted-token accumulator (Synthetix-style)
///         adapted for per-position weights.
contract SpaceStaking is Ownable {
    using SafeERC20 for IERC20;

    // ── Types ───────────────────────────────────────────────────────

    enum LockPeriod { THREE_MONTHS, SIX_MONTHS, TWELVE_MONTHS, TWENTY_FOUR_MONTHS }

    struct Stake {
        uint256 amount;             // tokens staked
        uint256 weight;             // amount × lockMult × tierMult (in base units)
        uint256 rewardDebt;         // snapshot of accRewardPerWeight at stake time
        uint64  startTime;
        uint64  unlockTime;
        uint256 tileTokenId;        // optional tile for boost (0 = none)
        LockPeriod lockPeriod;
        bool    active;
    }

    // ── Constants ───────────────────────────────────────────────────

    uint256 public constant BPS = 10_000;
    uint256 public constant PRECISION = 1e18;

    uint256 public constant MIN_STAKE = 100 ether; // 100 tokens (18 decimals)

    // ── Immutables ──────────────────────────────────────────────────

    IERC20 public immutable stakeToken;
    AgoraTile public immutable agoraTile;
    uint256 public immutable spaceId;

    // ── State ───────────────────────────────────────────────────────

    /// @notice Reward tokens emitted per second.
    uint256 public rewardRate;

    /// @notice Timestamp of last reward update.
    uint256 public lastUpdateTime;

    /// @notice Accumulated reward per unit of weight, scaled by PRECISION.
    uint256 public accRewardPerWeight;

    /// @notice Sum of all active position weights.
    uint256 public totalWeight;

    /// @notice Total reward tokens deposited into the contract.
    uint256 public rewardPool;

    /// @notice Total reward tokens already distributed (claimed).
    uint256 public rewardDistributed;

    /// @notice Auto-incrementing stake ID.
    uint256 public nextStakeId;

    /// @notice stakeId → Stake
    mapping(uint256 => Stake) public stakes;

    /// @notice stakeId → staker address
    mapping(uint256 => address) public stakeOwner;

    /// @notice user → list of their stakeIds
    mapping(address => uint256[]) public userStakeIds;

    // ── Lock multipliers (BPS) ──────────────────────────────────────

    mapping(LockPeriod => uint256) public lockMultiplier;
    mapping(LockPeriod => uint256) public lockDuration;

    // ── Tile tier multipliers (BPS) ─────────────────────────────────

    mapping(uint8 => uint256) public tierMultiplier;

    // ── Errors ──────────────────────────────────────────────────────

    error BelowMinStake();
    error StakeNotActive();
    error NotStakeOwner();
    error StillLocked(uint256 unlockTime);
    error TileNotInSpace(uint256 tokenId, uint256 expectedSpaceId);
    error NotTileOwner(uint256 tokenId);
    error ZeroRewardRate();

    // ── Events ──────────────────────────────────────────────────────

    event Staked(uint256 indexed stakeId, address indexed user, uint256 amount, LockPeriod lockPeriod, uint256 tileTokenId);
    event Unstaked(uint256 indexed stakeId, address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(uint256 indexed stakeId, address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    event RewardPoolFunded(uint256 amount);

    // ── Constructor ─────────────────────────────────────────────────

    constructor(
        address _stakeToken,
        address _agoraTile,
        uint256 _spaceId,
        uint256 _rewardRate
    ) Ownable(msg.sender) {
        stakeToken = IERC20(_stakeToken);
        agoraTile = AgoraTile(_agoraTile);
        spaceId = _spaceId;
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;

        // Lock periods
        lockDuration[LockPeriod.THREE_MONTHS]       = 90 days;
        lockDuration[LockPeriod.SIX_MONTHS]         = 180 days;
        lockDuration[LockPeriod.TWELVE_MONTHS]       = 365 days;
        lockDuration[LockPeriod.TWENTY_FOUR_MONTHS]  = 730 days;

        // Lock multipliers (BPS)
        lockMultiplier[LockPeriod.THREE_MONTHS]       = 10_000; // 1.0×
        lockMultiplier[LockPeriod.SIX_MONTHS]         = 12_000; // 1.2×
        lockMultiplier[LockPeriod.TWELVE_MONTHS]       = 15_000; // 1.5×
        lockMultiplier[LockPeriod.TWENTY_FOUR_MONTHS]  = 20_000; // 2.0×

        // Tile tier multipliers (BPS) — tier 0 means "no tile"
        tierMultiplier[0] = 10_000; // 1.0×
        tierMultiplier[1] = 10_000; // 1.0×
        tierMultiplier[2] = 12_000; // 1.2×
        tierMultiplier[3] = 15_000; // 1.5×
        tierMultiplier[4] = 20_000; // 2.0×
        tierMultiplier[5] = 30_000; // 3.0×
    }

    // ── External functions ──────────────────────────────────────────

    /// @notice Stake tokens with a lock period and optional tile boost.
    /// @param amount       Number of tokens to stake (must be ≥ MIN_STAKE).
    /// @param lock         Lock period enum.
    /// @param tileTokenId  Token ID of a tile in this space for a tier boost.
    ///                     Pass 0 for no tile boost.
    function stake(uint256 amount, LockPeriod lock, uint256 tileTokenId) external returns (uint256 stakeId) {
        if (amount < MIN_STAKE) revert BelowMinStake();

        _updateRewards();

        uint8 tier = 0;
        if (tileTokenId != 0) {
            // Verify caller owns the tile and it belongs to this space
            if (agoraTile.ownerOf(tileTokenId) != msg.sender) revert NotTileOwner(tileTokenId);
            (uint256 tileSpace,,, uint8 tileTier) = agoraTile.tiles(tileTokenId);
            if (tileSpace != spaceId) revert TileNotInSpace(tileTokenId, spaceId);
            tier = tileTier;
        }

        uint256 weight = amount * lockMultiplier[lock] / BPS * tierMultiplier[tier] / BPS;

        stakeId = nextStakeId++;
        stakes[stakeId] = Stake({
            amount: amount,
            weight: weight,
            rewardDebt: accRewardPerWeight,
            startTime: uint64(block.timestamp),
            unlockTime: uint64(block.timestamp + lockDuration[lock]),
            tileTokenId: tileTokenId,
            lockPeriod: lock,
            active: true
        });
        stakeOwner[stakeId] = msg.sender;
        userStakeIds[msg.sender].push(stakeId);

        totalWeight += weight;

        stakeToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(stakeId, msg.sender, amount, lock, tileTokenId);
    }

    /// @notice Claim accrued rewards without unstaking.
    function claimReward(uint256 stakeId) external returns (uint256 reward) {
        if (stakeOwner[stakeId] != msg.sender) revert NotStakeOwner();
        Stake storage s = stakes[stakeId];
        if (!s.active) revert StakeNotActive();

        _updateRewards();

        reward = _pendingReward(s);
        s.rewardDebt = accRewardPerWeight;

        if (reward > 0) {
            rewardDistributed += reward;
            stakeToken.safeTransfer(msg.sender, reward);
        }

        emit RewardClaimed(stakeId, msg.sender, reward);
    }

    /// @notice Unstake tokens and claim remaining rewards. Only after lock expires.
    function unstake(uint256 stakeId) external returns (uint256 reward) {
        if (stakeOwner[stakeId] != msg.sender) revert NotStakeOwner();
        Stake storage s = stakes[stakeId];
        if (!s.active) revert StakeNotActive();
        if (block.timestamp < s.unlockTime) revert StillLocked(s.unlockTime);

        _updateRewards();

        reward = _pendingReward(s);
        uint256 amount = s.amount;

        totalWeight -= s.weight;
        s.active = false;

        rewardDistributed += reward;
        stakeToken.safeTransfer(msg.sender, amount + reward);

        emit Unstaked(stakeId, msg.sender, amount, reward);
    }

    // ── Owner functions ─────────────────────────────────────────────

    /// @notice Fund the reward pool by transferring tokens into this contract.
    function fundRewardPool(uint256 amount) external {
        stakeToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardPoolFunded(amount);
    }

    /// @notice Update the reward emission rate. Owner only.
    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        _updateRewards();
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }

    // ── View functions ──────────────────────────────────────────────

    /// @notice Returns pending (unclaimed) reward for a stake position.
    function pendingReward(uint256 stakeId) external view returns (uint256) {
        Stake storage s = stakes[stakeId];
        if (!s.active) return 0;

        uint256 currentAcc = accRewardPerWeight;
        if (totalWeight > 0) {
            uint256 elapsed = block.timestamp - lastUpdateTime;
            currentAcc += elapsed * rewardRate * PRECISION / totalWeight;
        }
        return s.weight * (currentAcc - s.rewardDebt) / PRECISION;
    }

    /// @notice Returns all stake IDs for a user.
    function getUserStakeIds(address user) external view returns (uint256[] memory) {
        return userStakeIds[user];
    }

    // ── Internal ────────────────────────────────────────────────────

    function _updateRewards() internal {
        if (totalWeight > 0) {
            uint256 elapsed = block.timestamp - lastUpdateTime;
            accRewardPerWeight += elapsed * rewardRate * PRECISION / totalWeight;
        }
        lastUpdateTime = block.timestamp;
    }

    function _pendingReward(Stake storage s) internal view returns (uint256) {
        return s.weight * (accRewardPerWeight - s.rewardDebt) / PRECISION;
    }
}
