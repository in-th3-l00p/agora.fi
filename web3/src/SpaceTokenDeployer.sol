// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SpaceToken} from "./SpaceToken.sol";

/// @title SpaceTokenDeployer
/// @notice Deploys SpaceToken instances on behalf of SpaceFactory.
///         Extracting the `new SpaceToken(...)` call into a separate contract
///         keeps SpaceFactory under the EIP-170 contract size limit.
contract SpaceTokenDeployer {
    function deploy(
        string calldata name,
        string calldata symbol,
        uint256 spaceId,
        uint256 supply,
        address recipient
    ) external returns (address) {
        SpaceToken token = new SpaceToken(name, symbol, spaceId, supply, recipient);
        return address(token);
    }
}
