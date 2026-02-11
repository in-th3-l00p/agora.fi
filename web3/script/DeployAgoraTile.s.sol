// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AgoraTile} from "../src/AgoraTile.sol";
import {SpaceFactory} from "../src/SpaceFactory.sol";

contract DeployAgoraTile is Script {
    function run() external returns (AgoraTile, SpaceFactory) {
        vm.startBroadcast();

        AgoraTile tile = new AgoraTile();
        console.log("AgoraTile deployed to:", address(tile));

        SpaceFactory factory = new SpaceFactory(address(tile));
        console.log("SpaceFactory deployed to:", address(factory));

        tile.setFactory(address(factory));
        console.log("Factory authorized on AgoraTile");

        vm.stopBroadcast();

        return (tile, factory);
    }
}
