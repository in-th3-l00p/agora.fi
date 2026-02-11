// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgoraTile} from "../src/AgoraTile.sol";

contract AgoraTileTest is Test {
    AgoraTile public tile;
    address public owner;
    address public alice;
    address public bob;

    uint256 constant SPACE_ID = 1;
    uint256 constant MINT_PRICE = 0.01 ether;

    function setUp() public {
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        tile = new AgoraTile();

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    // ── createSpace ──────────────────────────────────────────────

    function test_CreateSpace() public {
        tile.createSpace(SPACE_ID, MINT_PRICE);
        (uint256 price, bool exists) = tile.spaces(SPACE_ID);
        assertEq(price, MINT_PRICE);
        assertTrue(exists);
    }

    function test_CreateSpace_RevertNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        tile.createSpace(SPACE_ID, MINT_PRICE);
    }

    // ── factory ─────────────────────────────────────────────────

    function test_SetFactory() public {
        address factoryAddr = makeAddr("factory");
        tile.setFactory(factoryAddr);
        assertEq(tile.factory(), factoryAddr);
    }

    function test_SetFactory_RevertNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        tile.setFactory(alice);
    }

    function test_CreateSpace_ViaFactory() public {
        address factoryAddr = makeAddr("factory");
        tile.setFactory(factoryAddr);

        vm.prank(factoryAddr);
        tile.createSpace(SPACE_ID, MINT_PRICE);

        (uint256 price, bool exists) = tile.spaces(SPACE_ID);
        assertEq(price, MINT_PRICE);
        assertTrue(exists);
    }

    function test_CreateSpace_RevertNotOwnerNorFactory() public {
        address factoryAddr = makeAddr("factory");
        tile.setFactory(factoryAddr);

        vm.prank(alice);
        vm.expectRevert(AgoraTile.NotOwnerOrFactory.selector);
        tile.createSpace(SPACE_ID, MINT_PRICE);
    }

    // ── mint ─────────────────────────────────────────────────────

    function test_Mint() public {
        tile.createSpace(SPACE_ID, MINT_PRICE);

        uint16 x = 5;
        uint16 y = 10;
        uint256 tokenId = tile.tileId(SPACE_ID, x, y);

        vm.prank(alice);
        tile.mint{value: MINT_PRICE}(SPACE_ID, x, y);

        assertEq(tile.ownerOf(tokenId), alice);

        (uint256 spaceId, uint16 tx_, uint16 ty, uint8 tier) = tile.tiles(tokenId);
        assertEq(spaceId, SPACE_ID);
        assertEq(tx_, x);
        assertEq(ty, y);
        assertEq(tier, 1);
    }

    function test_Mint_DeterministicId() public {
        tile.createSpace(SPACE_ID, MINT_PRICE);

        uint16 x = 3;
        uint16 y = 7;
        uint256 expected = uint256(keccak256(abi.encodePacked(SPACE_ID, x, y)));
        uint256 actual = tile.tileId(SPACE_ID, x, y);
        assertEq(actual, expected);

        vm.prank(alice);
        tile.mint{value: MINT_PRICE}(SPACE_ID, x, y);
        assertEq(tile.ownerOf(expected), alice);
    }

    function test_Mint_RevertDuplicate() public {
        tile.createSpace(SPACE_ID, MINT_PRICE);

        vm.prank(alice);
        tile.mint{value: MINT_PRICE}(SPACE_ID, 1, 1);

        vm.prank(bob);
        vm.expectRevert();
        tile.mint{value: MINT_PRICE}(SPACE_ID, 1, 1);
    }

    function test_Mint_RevertWrongPrice() public {
        tile.createSpace(SPACE_ID, MINT_PRICE);

        vm.prank(alice);
        vm.expectRevert();
        tile.mint{value: 0.005 ether}(SPACE_ID, 1, 1);
    }

    function test_Mint_RevertInvalidSpace() public {
        vm.prank(alice);
        vm.expectRevert();
        tile.mint{value: MINT_PRICE}(999, 1, 1);
    }

    // ── tokenURI ─────────────────────────────────────────────────

    function test_TokenURI() public {
        tile.createSpace(SPACE_ID, MINT_PRICE);
        tile.setBaseURI("https://api.agora.fi/tiles/");

        uint16 x = 2;
        uint16 y = 4;
        uint256 tokenId = tile.tileId(SPACE_ID, x, y);

        vm.prank(alice);
        tile.mint{value: MINT_PRICE}(SPACE_ID, x, y);

        string memory uri = tile.tokenURI(tokenId);
        string memory expected = string.concat("https://api.agora.fi/tiles/", vm.toString(tokenId));
        assertEq(uri, expected);
    }

    // ── transfer ─────────────────────────────────────────────────

    function test_Transfer() public {
        tile.createSpace(SPACE_ID, MINT_PRICE);

        uint256 tokenId = tile.tileId(SPACE_ID, 0, 0);

        vm.prank(alice);
        tile.mint{value: MINT_PRICE}(SPACE_ID, 0, 0);

        vm.prank(alice);
        tile.transferFrom(alice, bob, tokenId);

        assertEq(tile.ownerOf(tokenId), bob);
    }

    // ── enumerable ───────────────────────────────────────────────

    function test_Enumerable() public {
        tile.createSpace(SPACE_ID, MINT_PRICE);

        vm.prank(alice);
        tile.mint{value: MINT_PRICE}(SPACE_ID, 0, 0);

        vm.prank(alice);
        tile.mint{value: MINT_PRICE}(SPACE_ID, 1, 0);

        vm.prank(bob);
        tile.mint{value: MINT_PRICE}(SPACE_ID, 2, 0);

        assertEq(tile.totalSupply(), 3);
        assertEq(tile.tokenByIndex(0), tile.tileId(SPACE_ID, 0, 0));
        assertEq(tile.tokenOfOwnerByIndex(alice, 0), tile.tileId(SPACE_ID, 0, 0));
        assertEq(tile.tokenOfOwnerByIndex(alice, 1), tile.tileId(SPACE_ID, 1, 0));
        assertEq(tile.tokenOfOwnerByIndex(bob, 0), tile.tileId(SPACE_ID, 2, 0));
    }

    // ── setBaseURI ───────────────────────────────────────────────

    function test_SetBaseURI() public {
        tile.setBaseURI("https://v1.agora.fi/");
        tile.setBaseURI("https://v2.agora.fi/");

        tile.createSpace(SPACE_ID, MINT_PRICE);
        uint256 tokenId = tile.tileId(SPACE_ID, 0, 0);

        vm.prank(alice);
        tile.mint{value: MINT_PRICE}(SPACE_ID, 0, 0);

        string memory uri = tile.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0);
        assertEq(uri, string.concat("https://v2.agora.fi/", vm.toString(tokenId)));
    }

    function test_SetBaseURI_RevertNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        tile.setBaseURI("https://evil.com/");
    }
}
