// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgoraTile} from "../src/AgoraTile.sol";
import {SpaceToken} from "../src/SpaceToken.sol";
import {SpaceStaking} from "../src/SpaceStaking.sol";

contract SpaceStakingTest is Test {
    AgoraTile public tile;
    SpaceToken public token;
    SpaceStaking public staking;

    address public alice;
    address public bob;

    uint256 constant SPACE_ID = 1;
    uint256 constant MINT_PRICE = 0.01 ether;
    uint256 constant SUPPLY = 100_000_000 ether;
    uint256 constant REWARD_RATE = 1 ether; // 1 token/second for easy math

    function setUp() public {
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        tile = new AgoraTile();
        tile.createSpace(SPACE_ID, MINT_PRICE);

        // Mint token supply to this test contract, then distribute
        token = new SpaceToken("Test Token", "TST", SPACE_ID, SUPPLY, address(this));

        staking = new SpaceStaking(address(token), address(tile), SPACE_ID, REWARD_RATE);

        // Give alice and bob tokens
        token.transfer(alice, 10_000_000 ether);
        token.transfer(bob, 10_000_000 ether);

        // Fund reward pool (20M tokens)
        token.approve(address(staking), 20_000_000 ether);
        staking.fundRewardPool(20_000_000 ether);

        // Give alice and bob ETH for tile minting
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    // ── Helpers ─────────────────────────────────────────────────

    function _stakeAsAlice(uint256 amount, SpaceStaking.LockPeriod lock) internal returns (uint256) {
        vm.startPrank(alice);
        token.approve(address(staking), amount);
        uint256 id = staking.stake(amount, lock, 0);
        vm.stopPrank();
        return id;
    }

    function _mintTileForAlice(uint16 x, uint16 y) internal returns (uint256 tokenId) {
        vm.prank(alice);
        tile.mint{value: MINT_PRICE}(SPACE_ID, x, y);
        tokenId = tile.tileId(SPACE_ID, x, y);
    }

    // ── Stake basics ────────────────────────────────────────────

    function test_Stake() public {
        uint256 amount = 1000 ether;
        uint256 id = _stakeAsAlice(amount, SpaceStaking.LockPeriod.THREE_MONTHS);

        (uint256 sAmount, uint256 sWeight,,,,,,bool active) = staking.stakes(id);
        assertEq(sAmount, amount);
        assertTrue(active);
        // 3-month lock = 1.0× lock mult, no tile = 1.0× tier mult → weight = amount
        assertEq(sWeight, amount);
        assertEq(staking.totalWeight(), amount);
    }

    function test_Stake_LockMultiplier() public {
        uint256 amount = 1000 ether;

        vm.startPrank(alice);
        token.approve(address(staking), amount);
        uint256 id = staking.stake(amount, SpaceStaking.LockPeriod.TWENTY_FOUR_MONTHS, 0);
        vm.stopPrank();

        (,uint256 weight,,,,,,) = staking.stakes(id);
        // 24-month lock = 2.0× → weight = 1000 * 2 = 2000
        assertEq(weight, amount * 2);
    }

    function test_Stake_TileBoost() public {
        // Mint a tile for alice (tier 1 by default = 1.0× — same as no tile)
        uint256 tokenId = _mintTileForAlice(0, 0);

        uint256 amount = 1000 ether;
        vm.startPrank(alice);
        token.approve(address(staking), amount);
        uint256 id = staking.stake(amount, SpaceStaking.LockPeriod.THREE_MONTHS, tokenId);
        vm.stopPrank();

        (,uint256 weight,,,,,,) = staking.stakes(id);
        // tier 1 = 1.0×, 3 months = 1.0× → weight = amount
        assertEq(weight, amount);
    }

    function test_Stake_RevertBelowMinimum() public {
        uint256 amount = 50 ether; // below 100 minimum

        vm.startPrank(alice);
        token.approve(address(staking), amount);
        vm.expectRevert(SpaceStaking.BelowMinStake.selector);
        staking.stake(amount, SpaceStaking.LockPeriod.THREE_MONTHS, 0);
        vm.stopPrank();
    }

    function test_Stake_RevertNotTileOwner() public {
        // Mint tile to alice
        uint256 tokenId = _mintTileForAlice(0, 0);

        // Bob tries to stake with alice's tile
        vm.startPrank(bob);
        token.approve(address(staking), 1000 ether);
        vm.expectRevert(abi.encodeWithSelector(SpaceStaking.NotTileOwner.selector, tokenId));
        staking.stake(1000 ether, SpaceStaking.LockPeriod.THREE_MONTHS, tokenId);
        vm.stopPrank();
    }

    function test_Stake_RevertTileWrongSpace() public {
        // Create a different space and mint tile there
        tile.createSpace(99, MINT_PRICE);
        vm.prank(alice);
        tile.mint{value: MINT_PRICE}(99, 0, 0);
        uint256 wrongTileId = tile.tileId(99, 0, 0);

        vm.startPrank(alice);
        token.approve(address(staking), 1000 ether);
        vm.expectRevert(abi.encodeWithSelector(SpaceStaking.TileNotInSpace.selector, wrongTileId, SPACE_ID));
        staking.stake(1000 ether, SpaceStaking.LockPeriod.THREE_MONTHS, wrongTileId);
        vm.stopPrank();
    }

    // ── Rewards ─────────────────────────────────────────────────

    function test_RewardAccrual() public {
        uint256 amount = 1000 ether;
        uint256 id = _stakeAsAlice(amount, SpaceStaking.LockPeriod.THREE_MONTHS);

        // Advance 100 seconds
        vm.warp(block.timestamp + 100);

        // With 1 token/second reward rate, 100 seconds → 100 tokens
        uint256 pending = staking.pendingReward(id);
        assertEq(pending, 100 ether);
    }

    function test_ClaimReward() public {
        uint256 amount = 1000 ether;
        uint256 id = _stakeAsAlice(amount, SpaceStaking.LockPeriod.THREE_MONTHS);

        vm.warp(block.timestamp + 100);

        uint256 balBefore = token.balanceOf(alice);

        vm.prank(alice);
        uint256 reward = staking.claimReward(id);

        assertEq(reward, 100 ether);
        assertEq(token.balanceOf(alice), balBefore + 100 ether);
    }

    function test_ClaimReward_RevertNotOwner() public {
        uint256 id = _stakeAsAlice(1000 ether, SpaceStaking.LockPeriod.THREE_MONTHS);

        vm.warp(block.timestamp + 100);

        vm.prank(bob);
        vm.expectRevert(SpaceStaking.NotStakeOwner.selector);
        staking.claimReward(id);
    }

    function test_MultipleStakers_ProportionalRewards() public {
        // Alice stakes 1000 (weight 1000)
        uint256 idA = _stakeAsAlice(1000 ether, SpaceStaking.LockPeriod.THREE_MONTHS);

        // Bob stakes 3000 (weight 3000)
        vm.startPrank(bob);
        token.approve(address(staking), 3000 ether);
        uint256 idB = staking.stake(3000 ether, SpaceStaking.LockPeriod.THREE_MONTHS, 0);
        vm.stopPrank();

        // Advance 100 seconds → 100 tokens distributed
        vm.warp(block.timestamp + 100);

        uint256 pendingA = staking.pendingReward(idA);
        uint256 pendingB = staking.pendingReward(idB);

        // Alice has 1/4 weight, Bob has 3/4
        assertEq(pendingA, 25 ether);
        assertEq(pendingB, 75 ether);
    }

    // ── Unstake ─────────────────────────────────────────────────

    function test_Unstake() public {
        uint256 amount = 1000 ether;
        uint256 id = _stakeAsAlice(amount, SpaceStaking.LockPeriod.THREE_MONTHS);

        // Advance past lock period (90 days)
        vm.warp(block.timestamp + 91 days);

        uint256 balBefore = token.balanceOf(alice);

        vm.prank(alice);
        uint256 reward = staking.unstake(id);

        // Should get principal + rewards
        uint256 balAfter = token.balanceOf(alice);
        assertEq(balAfter, balBefore + amount + reward);

        // Stake should be inactive
        (,,,,,,, bool active) = staking.stakes(id);
        assertFalse(active);
        assertEq(staking.totalWeight(), 0);
    }

    function test_Unstake_RevertStillLocked() public {
        uint256 id = _stakeAsAlice(1000 ether, SpaceStaking.LockPeriod.THREE_MONTHS);

        // Try to unstake before lock expires
        vm.warp(block.timestamp + 30 days);

        vm.prank(alice);
        vm.expectRevert();
        staking.unstake(id);
    }

    function test_Unstake_RevertNotOwner() public {
        uint256 id = _stakeAsAlice(1000 ether, SpaceStaking.LockPeriod.THREE_MONTHS);
        vm.warp(block.timestamp + 91 days);

        vm.prank(bob);
        vm.expectRevert(SpaceStaking.NotStakeOwner.selector);
        staking.unstake(id);
    }

    function test_Unstake_RevertAlreadyUnstaked() public {
        uint256 id = _stakeAsAlice(1000 ether, SpaceStaking.LockPeriod.THREE_MONTHS);
        vm.warp(block.timestamp + 91 days);

        vm.prank(alice);
        staking.unstake(id);

        vm.prank(alice);
        vm.expectRevert(SpaceStaking.StakeNotActive.selector);
        staking.unstake(id);
    }

    // ── Fund & Rate ─────────────────────────────────────────────

    function test_FundRewardPool() public {
        uint256 amount = 1_000_000 ether;
        token.approve(address(staking), amount);
        staking.fundRewardPool(amount);

        assertEq(staking.rewardPool(), 20_000_000 ether + amount);
    }

    function test_SetRewardRate() public {
        staking.setRewardRate(2 ether);
        assertEq(staking.rewardRate(), 2 ether);
    }

    function test_SetRewardRate_RevertNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        staking.setRewardRate(2 ether);
    }

    // ── User view ───────────────────────────────────────────────

    function test_GetUserStakeIds() public {
        uint256 id1 = _stakeAsAlice(1000 ether, SpaceStaking.LockPeriod.THREE_MONTHS);

        vm.startPrank(alice);
        token.approve(address(staking), 2000 ether);
        uint256 id2 = staking.stake(2000 ether, SpaceStaking.LockPeriod.SIX_MONTHS, 0);
        vm.stopPrank();

        uint256[] memory ids = staking.getUserStakeIds(alice);
        assertEq(ids.length, 2);
        assertEq(ids[0], id1);
        assertEq(ids[1], id2);
    }
}
