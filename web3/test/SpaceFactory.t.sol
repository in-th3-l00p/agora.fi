// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgoraTile} from "../src/AgoraTile.sol";
import {SpaceToken} from "../src/SpaceToken.sol";
import {SpaceFactory} from "../src/SpaceFactory.sol";
import {SpaceTokenDeployer} from "../src/SpaceTokenDeployer.sol";

contract SpaceFactoryTest is Test {
    AgoraTile public tile;
    SpaceFactory public factory;
    SpaceTokenDeployer public tokenDeployer;

    address public alice;
    address public bob;

    // Allocation addresses
    address public treasury;
    address public team;
    address public stakingRewards;
    address public liquidityPool;
    address public earlySupporters;
    address public platformReserve;

    uint256 constant SPACE_ID = 1;
    uint256 constant MINT_PRICE = 0.05 ether;
    uint256 constant SUPPLY = 100_000_000 ether;

    function setUp() public {
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        treasury = makeAddr("treasury");
        team = makeAddr("team");
        stakingRewards = makeAddr("stakingRewards");
        liquidityPool = makeAddr("liquidityPool");
        earlySupporters = makeAddr("earlySupporters");
        platformReserve = makeAddr("platformReserve");

        // Deploy tile, token deployer, and factory
        tile = new AgoraTile();
        tokenDeployer = new SpaceTokenDeployer();
        factory = new SpaceFactory(address(tile), address(tokenDeployer));

        // Authorize factory on AgoraTile
        tile.setFactory(address(factory));
    }

    function _defaultAlloc() internal view returns (SpaceFactory.TokenAllocation memory) {
        return SpaceFactory.TokenAllocation({
            treasury: treasury,
            team: team,
            stakingRewards: stakingRewards,
            liquidityPool: liquidityPool,
            earlySupporters: earlySupporters,
            platformReserve: platformReserve
        });
    }

    // ── createSpace ─────────────────────────────────────────────

    function test_CreateSpace() public {
        address token = factory.createSpace(
            SPACE_ID, "Romanian Tech Token", "ROTECH", MINT_PRICE, 0, _defaultAlloc()
        );

        // Token deployed
        assertTrue(token != address(0));

        // Space registered on AgoraTile
        (uint256 price, bool exists) = tile.spaces(SPACE_ID);
        assertEq(price, MINT_PRICE);
        assertTrue(exists);

        // Factory state
        assertEq(factory.tokenOf(SPACE_ID), token);
        assertEq(factory.spaceCount(), 1);
        assertEq(factory.spaceIds(0), SPACE_ID);
    }

    function test_CreateSpace_TokenMetadata() public {
        address token = factory.createSpace(
            SPACE_ID, "Romanian Tech Token", "ROTECH", MINT_PRICE, 0, _defaultAlloc()
        );

        SpaceToken st = SpaceToken(token);
        assertEq(st.name(), "Romanian Tech Token");
        assertEq(st.symbol(), "ROTECH");
        assertEq(st.spaceId(), SPACE_ID);
        assertEq(st.totalSupply(), SUPPLY);
    }

    function test_CreateSpace_TokenDistribution() public {
        address token = factory.createSpace(
            SPACE_ID, "Romanian Tech Token", "ROTECH", MINT_PRICE, 0, _defaultAlloc()
        );

        SpaceToken st = SpaceToken(token);

        assertEq(st.balanceOf(treasury),        SUPPLY * 40 / 100);
        assertEq(st.balanceOf(team),            SUPPLY * 20 / 100);
        assertEq(st.balanceOf(stakingRewards),  SUPPLY * 20 / 100);
        assertEq(st.balanceOf(liquidityPool),   SUPPLY * 10 / 100);
        assertEq(st.balanceOf(earlySupporters), SUPPLY *  5 / 100);
        assertEq(st.balanceOf(platformReserve), SUPPLY *  5 / 100);

        // Factory should hold nothing
        assertEq(st.balanceOf(address(factory)), 0);
    }

    function test_CreateSpace_CustomSupply() public {
        uint256 customSupply = 50_000_000 ether;

        address token = factory.createSpace(
            SPACE_ID, "Test Token", "TEST", MINT_PRICE, customSupply, _defaultAlloc()
        );

        SpaceToken st = SpaceToken(token);
        assertEq(st.totalSupply(), customSupply);
        assertEq(st.balanceOf(treasury), customSupply * 40 / 100);
    }

    function test_CreateSpace_EmitEvent() public {
        vm.expectEmit(true, false, true, false);
        emit SpaceFactory.SpaceTokenCreated(SPACE_ID, address(0), address(this), "Test", "TST", SUPPLY, MINT_PRICE);

        factory.createSpace(SPACE_ID, "Test", "TST", MINT_PRICE, 0, _defaultAlloc());
    }

    function test_CreateSpace_TilesMintableAfter() public {
        factory.createSpace(SPACE_ID, "Test", "TST", MINT_PRICE, 0, _defaultAlloc());

        vm.deal(alice, 1 ether);
        vm.prank(alice);
        tile.mint{value: MINT_PRICE}(SPACE_ID, 0, 0);

        uint256 tokenId = tile.tileId(SPACE_ID, 0, 0);
        assertEq(tile.ownerOf(tokenId), alice);
    }

    // ── Reverts ─────────────────────────────────────────────────

    function test_CreateSpace_RevertDuplicate() public {
        factory.createSpace(SPACE_ID, "Test", "TST", MINT_PRICE, 0, _defaultAlloc());

        vm.expectRevert(abi.encodeWithSelector(SpaceFactory.SpaceAlreadyCreated.selector, SPACE_ID));
        factory.createSpace(SPACE_ID, "Test2", "TST2", MINT_PRICE, 0, _defaultAlloc());
    }

    function test_CreateSpace_RevertZeroAddress() public {
        SpaceFactory.TokenAllocation memory alloc = _defaultAlloc();
        alloc.treasury = address(0);

        vm.expectRevert(SpaceFactory.ZeroAddress.selector);
        factory.createSpace(SPACE_ID, "Test", "TST", MINT_PRICE, 0, alloc);
    }

    // ── Multiple spaces ─────────────────────────────────────────

    function test_MultipleSpaces() public {
        factory.createSpace(1, "Space A", "SPA", 0.05 ether, 0, _defaultAlloc());
        factory.createSpace(2, "Space B", "SPB", 0.08 ether, 0, _defaultAlloc());
        factory.createSpace(3, "Space C", "SPC", 0.10 ether, 0, _defaultAlloc());

        assertEq(factory.spaceCount(), 3);

        // Each has a unique token
        address tokenA = factory.tokenOf(1);
        address tokenB = factory.tokenOf(2);
        address tokenC = factory.tokenOf(3);
        assertTrue(tokenA != tokenB);
        assertTrue(tokenB != tokenC);

        // Each space exists on AgoraTile
        (, bool existsA) = tile.spaces(1);
        (, bool existsB) = tile.spaces(2);
        (, bool existsC) = tile.spaces(3);
        assertTrue(existsA);
        assertTrue(existsB);
        assertTrue(existsC);
    }

    // ── SpaceInfo ───────────────────────────────────────────────

    function test_SpaceInfo() public {
        vm.prank(alice);
        address token = factory.createSpace(SPACE_ID, "Test", "TST", MINT_PRICE, 0, _defaultAlloc());

        (address infoToken, address creator, uint256 price) = factory.spaceInfo(SPACE_ID);
        assertEq(infoToken, token);
        assertEq(creator, alice);
        assertEq(price, MINT_PRICE);
    }

    // ── Constructor ─────────────────────────────────────────────

    function test_Constructor_RevertZeroTile() public {
        vm.expectRevert(SpaceFactory.ZeroAddress.selector);
        new SpaceFactory(address(0), address(tokenDeployer));
    }

    function test_Constructor_RevertZeroDeployer() public {
        vm.expectRevert(SpaceFactory.ZeroAddress.selector);
        new SpaceFactory(address(tile), address(0));
    }
}
