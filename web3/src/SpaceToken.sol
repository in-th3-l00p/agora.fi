// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin-contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin-contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin-contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin-contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin-contracts/utils/Nonces.sol";

/// @title SpaceToken
/// @notice ERC-20 governance and utility token deployed per AGORAFI Space.
///         Supports voting delegation (ERC20Votes), gasless approvals (ERC20Permit),
///         and token burning for the buyback-and-burn mechanism.
contract SpaceToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes {
    /// @notice The space ID this token belongs to on the AgoraTile contract.
    uint256 public immutable spaceId;

    /// @param _name     Token name (e.g. "Romanian Tech Space Token")
    /// @param _symbol   Token symbol (e.g. "ROTECH")
    /// @param _spaceId  The space ID on AgoraTile this token governs
    /// @param _supply   Total supply minted to `_recipient` (18 decimals)
    /// @param _recipient Address that receives the entire initial supply
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _spaceId,
        uint256 _supply,
        address _recipient
    ) ERC20(_name, _symbol) ERC20Permit(_name) {
        spaceId = _spaceId;
        _mint(_recipient, _supply);
    }

    // ── Overrides required by Solidity for diamond inheritance ──────

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
