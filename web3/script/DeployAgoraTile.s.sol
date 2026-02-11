// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {AgoraTile} from "../src/AgoraTile.sol";

contract DeployAgoraTile is Script {
    function run() external returns (AgoraTile) {
        vm.startBroadcast();
        AgoraTile tile = new AgoraTile();
        vm.stopBroadcast();
        return tile;
    }
}
