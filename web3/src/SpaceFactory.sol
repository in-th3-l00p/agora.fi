// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin-contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin-contracts/access/Ownable.sol";
import {AgoraTile} from "./AgoraTile.sol";
import {SpaceToken} from "./SpaceToken.sol";

/// @title SpaceFactory
/// @notice Creates AGORAFI Spaces by deploying a governance token and registering
///         the space on the AgoraTile NFT contract in a single transaction.
///
///         Token distribution follows the documented allocation:
///           40 % → DAO Treasury
///           20 % → Team & Advisors
///           20 % → Staking Rewards pool
///           10 % → Liquidity Pool
///            5 % → Early Supporters
///            5 % → Platform Reserve
contract SpaceFactory is Ownable {
    using SafeERC20 for IERC20;

    // ── Types ───────────────────────────────────────────────────────

    struct TokenAllocation {
        address treasury;       // 40 %
        address team;           // 20 %
        address stakingRewards; // 20 %
        address liquidityPool;  // 10 %
        address earlySupporters;// 5 %
        address platformReserve;// 5 %
    }

    struct SpaceInfo {
        address token;
        address creator;
        uint256 mintPrice;
    }

    // ── Constants ───────────────────────────────────────────────────

    uint256 public constant DEFAULT_TOTAL_SUPPLY = 100_000_000 ether; // 100 M tokens

    uint256 public constant ALLOC_TREASURY        = 40;
    uint256 public constant ALLOC_TEAM            = 20;
    uint256 public constant ALLOC_STAKING         = 20;
    uint256 public constant ALLOC_LIQUIDITY       = 10;
    uint256 public constant ALLOC_EARLY           =  5;
    uint256 public constant ALLOC_PLATFORM        =  5;

    // ── State ───────────────────────────────────────────────────────

    AgoraTile public immutable agoraTile;

    /// @notice spaceId → deployed SpaceToken address
    mapping(uint256 => SpaceInfo) public spaceInfo;

    /// @notice Ordered list of space IDs created through this factory
    uint256[] public spaceIds;

    // ── Errors ──────────────────────────────────────────────────────

    error SpaceAlreadyCreated(uint256 spaceId);
    error ZeroAddress();
    error InvalidSupply();

    // ── Events ──────────────────────────────────────────────────────

    event SpaceTokenCreated(
        uint256 indexed spaceId,
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 mintPrice
    );

    // ── Constructor ─────────────────────────────────────────────────

    constructor(address _agoraTile) Ownable(msg.sender) {
        if (_agoraTile == address(0)) revert ZeroAddress();
        agoraTile = AgoraTile(_agoraTile);
    }

    // ── Public API ──────────────────────────────────────────────────

    /// @notice Create a Space: deploys an ERC-20 governance token, distributes
    ///         it according to the fixed allocation, and registers the space on
    ///         the AgoraTile NFT contract.
    /// @param spaceId    Unique space identifier (same ID used on AgoraTile)
    /// @param name       Token name (e.g. "Romanian Tech Space Token")
    /// @param symbol     Token symbol (e.g. "ROTECH")
    /// @param mintPrice  Price to mint a tile in this space (in wei)
    /// @param totalSupply Total token supply (pass 0 to use DEFAULT_TOTAL_SUPPLY)
    /// @param alloc      Addresses for each allocation bucket
    function createSpace(
        uint256 spaceId,
        string calldata name,
        string calldata symbol,
        uint256 mintPrice,
        uint256 totalSupply,
        TokenAllocation calldata alloc
    ) external returns (address token) {
        if (spaceInfo[spaceId].token != address(0)) revert SpaceAlreadyCreated(spaceId);
        _validateAllocation(alloc);

        uint256 supply = totalSupply == 0 ? DEFAULT_TOTAL_SUPPLY : totalSupply;

        // Deploy the governance token — entire supply minted to this factory
        SpaceToken spaceToken = new SpaceToken(name, symbol, spaceId, supply, address(this));
        token = address(spaceToken);

        // Distribute tokens using SafeERC20
        IERC20(token).safeTransfer(alloc.treasury,        supply * ALLOC_TREASURY  / 100);
        IERC20(token).safeTransfer(alloc.team,            supply * ALLOC_TEAM      / 100);
        IERC20(token).safeTransfer(alloc.stakingRewards,  supply * ALLOC_STAKING   / 100);
        IERC20(token).safeTransfer(alloc.liquidityPool,   supply * ALLOC_LIQUIDITY / 100);
        IERC20(token).safeTransfer(alloc.earlySupporters, supply * ALLOC_EARLY     / 100);
        IERC20(token).safeTransfer(alloc.platformReserve, supply * ALLOC_PLATFORM  / 100);

        // Register space on AgoraTile
        agoraTile.createSpace(spaceId, mintPrice);

        // Store space info
        spaceInfo[spaceId] = SpaceInfo({
            token: token,
            creator: msg.sender,
            mintPrice: mintPrice
        });
        spaceIds.push(spaceId);

        emit SpaceTokenCreated(spaceId, token, msg.sender, name, symbol, supply, mintPrice);
    }

    // ── View helpers ────────────────────────────────────────────────

    /// @notice Returns the total number of spaces created through this factory.
    function spaceCount() external view returns (uint256) {
        return spaceIds.length;
    }

    /// @notice Returns the governance token address for a space.
    function tokenOf(uint256 spaceId) external view returns (address) {
        return spaceInfo[spaceId].token;
    }

    // ── Internal ────────────────────────────────────────────────────

    function _validateAllocation(TokenAllocation calldata alloc) internal pure {
        if (alloc.treasury == address(0))        revert ZeroAddress();
        if (alloc.team == address(0))            revert ZeroAddress();
        if (alloc.stakingRewards == address(0))  revert ZeroAddress();
        if (alloc.liquidityPool == address(0))   revert ZeroAddress();
        if (alloc.earlySupporters == address(0)) revert ZeroAddress();
        if (alloc.platformReserve == address(0)) revert ZeroAddress();
    }
}
