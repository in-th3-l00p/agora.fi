// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin-contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin-contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin-contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin-contracts/utils/Strings.sol";

contract AgoraTile is ERC721Enumerable, Ownable {
    using Strings for uint256;

    struct Tile {
        uint256 spaceId;
        uint16 x;
        uint16 y;
        uint8 tier;
    }

    struct Space {
        uint256 mintPrice;
        bool exists;
    }

    mapping(uint256 => Tile) public tiles;
    mapping(uint256 => Space) public spaces;

    string private _baseTokenURI;

    /// @notice Authorized factory contract that may also create spaces.
    address public factory;

    error SpaceAlreadyExists(uint256 spaceId);
    error SpaceDoesNotExist(uint256 spaceId);
    error TileAlreadyMinted(uint256 tokenId);
    error IncorrectPayment(uint256 sent, uint256 required);
    error NotOwnerOrFactory();

    event SpaceCreated(uint256 indexed spaceId, uint256 mintPrice);
    event TileMinted(uint256 indexed tokenId, uint256 indexed spaceId, uint16 x, uint16 y, address owner);
    event FactoryUpdated(address indexed factory);

    constructor() ERC721("AgoraTile", "AGORA") Ownable(msg.sender) {}

    /// @notice Set the authorized factory address. Only callable by owner.
    function setFactory(address _factory) external onlyOwner {
        factory = _factory;
        emit FactoryUpdated(_factory);
    }

    /// @notice Create a new space. Callable by owner or the authorized factory.
    function createSpace(uint256 spaceId, uint256 mintPrice) external {
        if (msg.sender != owner() && msg.sender != factory) revert NotOwnerOrFactory();
        if (spaces[spaceId].exists) revert SpaceAlreadyExists(spaceId);
        spaces[spaceId] = Space({mintPrice: mintPrice, exists: true});
        emit SpaceCreated(spaceId, mintPrice);
    }

    function mint(uint256 spaceId, uint16 x, uint16 y) external payable {
        Space storage space = spaces[spaceId];
        if (!space.exists) revert SpaceDoesNotExist(spaceId);
        if (msg.value != space.mintPrice) revert IncorrectPayment(msg.value, space.mintPrice);

        uint256 tokenId = tileId(spaceId, x, y);
        if (_ownerOf(tokenId) != address(0)) revert TileAlreadyMinted(tokenId);

        tiles[tokenId] = Tile({spaceId: spaceId, x: x, y: y, tier: 1});
        _safeMint(msg.sender, tokenId);

        emit TileMinted(tokenId, spaceId, x, y, msg.sender);
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_baseTokenURI, tokenId.toString());
    }

    function tileId(uint256 spaceId, uint16 x, uint16 y) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(spaceId, x, y)));
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
