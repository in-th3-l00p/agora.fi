[← back to blockchain](./index.md)

# MVP — ERC-721 only

A minimal first version of agora.fi that ships with a single smart contract: an ERC-721 tile NFT. No wallets, no vaults, no rentals. Just ownable tiles on an isometric map.

## what's included

| Feature | Details |
|---------|---------|
| Tile minting | Users mint tiles at fixed coordinates in a space |
| Ownership | Standard ERC-721 — transfer, approve, list on marketplaces |
| Metadata | On-chain coordinates + off-chain image URI |
| Map rendering | Tiles appear on the isometric map, owned tiles show owner info |

## what's NOT included (deferred to full version)

| Feature | Standard | Why deferred |
|---------|----------|-------------|
| Tile wallets | Custom | Adds contract complexity; not needed for core loop |
| Yield / staking | ERC-4626 | Requires DeFi integrations and vault strategies |
| Rentals | ERC-4907 | Requires rental market and pricing logic |
| Royalties | ERC-2981 | Can be added later without breaking existing tiles |

## contract

A single `AgoraTile` contract:

```solidity
contract AgoraTile is ERC721, ERC721Enumerable, Ownable {
    struct Tile {
        uint256 spaceId;
        uint16 x;
        uint16 y;
        uint8 tier;
    }

    mapping(uint256 => Tile) public tiles;

    function mint(uint256 spaceId, uint16 x, uint16 y) external payable;
    function tokenURI(uint256 tokenId) public view returns (string memory);
}
```

Key properties:
- One contract per deployment (all spaces share it, distinguished by `spaceId`)
- Tile ID is deterministic: `keccak256(spaceId, x, y)`
- Each coordinate can only be minted once
- Mint price is set per space by the contract owner

## user flow

```
1. User picks a tile on the isometric map
2. User calls mint() and pays the mint price
3. Tile NFT is created → user owns that coordinate
4. Tile appears as owned on the map (shows branding / owner info)
5. User can sell or transfer on any ERC-721 marketplace
```

## metadata

```json
{
  "name": "Tile #042 — Romanian Tech Space",
  "description": "Coordinate (12, 7) in Romanian Tech Space",
  "image": "https://api.agora.fi/tiles/42/image.png",
  "attributes": [
    { "trait_type": "Space", "value": "Romanian Tech Space" },
    { "trait_type": "X", "value": 12 },
    { "trait_type": "Y", "value": 7 },
    { "trait_type": "Tier", "value": 1 }
  ]
}
```

Metadata is compatible with OpenSea, Blur, and other major marketplaces out of the box.

## upgrade path

The MVP is designed so that every future feature can be layered on without redeploying the base NFT:

| Step | Addition | Dependency |
|------|----------|------------|
| 1 | **MVP** (this) | — |
| 2 | Tile wallets | Deploy wallet factory, bind to existing token IDs |
| 3 | Royalties (ERC-2981) | Add royalty extension or wrap in a new contract |
| 4 | Rentals (ERC-4907) | Extend NFT or deploy rental manager contract |
| 5 | Vaults (ERC-4626) | Tile wallets deposit into external vaults |

No existing tiles need to be reminted. The NFT stays the same; features attach to it.
