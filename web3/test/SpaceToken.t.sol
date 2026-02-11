// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SpaceToken} from "../src/SpaceToken.sol";

contract SpaceTokenTest is Test {
    SpaceToken public token;
    address public alice;
    address public bob;

    uint256 constant SPACE_ID = 1;
    uint256 constant SUPPLY = 100_000_000 ether;

    function setUp() public {
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        token = new SpaceToken("Romanian Tech Token", "ROTECH", SPACE_ID, SUPPLY, alice);
    }

    // ── Basics ──────────────────────────────────────────────────

    function test_Name() public view {
        assertEq(token.name(), "Romanian Tech Token");
    }

    function test_Symbol() public view {
        assertEq(token.symbol(), "ROTECH");
    }

    function test_SpaceId() public view {
        assertEq(token.spaceId(), SPACE_ID);
    }

    function test_TotalSupply() public view {
        assertEq(token.totalSupply(), SUPPLY);
    }

    function test_RecipientBalance() public view {
        assertEq(token.balanceOf(alice), SUPPLY);
    }

    function test_Decimals() public view {
        assertEq(token.decimals(), 18);
    }

    // ── Transfer ────────────────────────────────────────────────

    function test_Transfer() public {
        uint256 amount = 1000 ether;

        vm.prank(alice);
        token.transfer(bob, amount);

        assertEq(token.balanceOf(alice), SUPPLY - amount);
        assertEq(token.balanceOf(bob), amount);
    }

    // ── Burn ────────────────────────────────────────────────────

    function test_Burn() public {
        uint256 burnAmount = 500 ether;

        vm.prank(alice);
        token.burn(burnAmount);

        assertEq(token.totalSupply(), SUPPLY - burnAmount);
        assertEq(token.balanceOf(alice), SUPPLY - burnAmount);
    }

    function test_BurnFrom() public {
        uint256 burnAmount = 500 ether;

        vm.prank(alice);
        token.approve(bob, burnAmount);

        vm.prank(bob);
        token.burnFrom(alice, burnAmount);

        assertEq(token.totalSupply(), SUPPLY - burnAmount);
    }

    // ── Votes ───────────────────────────────────────────────────

    function test_Delegate() public {
        vm.prank(alice);
        token.delegate(alice);

        assertEq(token.getVotes(alice), SUPPLY);
    }

    function test_DelegateToOther() public {
        vm.prank(alice);
        token.delegate(bob);

        assertEq(token.getVotes(alice), 0);
        assertEq(token.getVotes(bob), SUPPLY);
    }

    function test_VotesTrackTransfers() public {
        vm.prank(alice);
        token.delegate(alice);

        uint256 amount = 1000 ether;
        vm.prank(alice);
        token.transfer(bob, amount);

        vm.prank(bob);
        token.delegate(bob);

        assertEq(token.getVotes(alice), SUPPLY - amount);
        assertEq(token.getVotes(bob), amount);
    }

    // ── Permit ──────────────────────────────────────────────────

    function test_PermitDomainSeparator() public view {
        // Just verify DOMAIN_SEPARATOR is set (non-zero)
        bytes32 ds = token.DOMAIN_SEPARATOR();
        assertTrue(ds != bytes32(0));
    }

    function test_Nonces() public view {
        assertEq(token.nonces(alice), 0);
    }
}
