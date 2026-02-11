# tile NFT

Each tile in the agora.fi isometric map is an ERC-721 non-fungible token. Owning the NFT grants full control over the tile and the smart wallet bound to it.

## what a tile represents

A tile is a coordinate in a themed virtual space (e.g. "Romanian Tech Space"). Unlike traditional NFTs that are static images, a tile is a **living asset** — an autonomous on-chain entity that holds value, generates income, and manages itself.

| Property | Description |
|----------|-------------|
| Token standard | ERC-721 |
| Identity | Unique tile ID + space coordinates |
| Bound account | ERC-6551 smart wallet (created on mint) |
| Transferability | Fully transferable; account transfers with it |

## minting

When a tile is minted:

1. An ERC-721 token is created and assigned to the buyer.
2. An ERC-6551 token-bound account is deployed for that token.
3. The tile appears on the isometric map at its designated coordinates.

The token-bound account is deterministically derived from the NFT's contract address and token ID, so it is inseparable from the tile.

## what transfers with the NFT

Selling or transferring the tile NFT atomically transfers ownership of:

- The NFT itself (map position, metadata, visual identity)
- The token-bound account and **all** assets it holds
- Active vault positions and accrued yield
- Active rental agreements and future rental income
- Royalty configuration and future royalty revenue

This is analogous to selling a rental property with tenants, a bank account, and an investment portfolio — in a single transaction.

## metadata

Tile metadata includes:

- `spaceId` — the virtual space the tile belongs to
- `x`, `y` — isometric grid coordinates
- `tier` — tile tier affecting base yield and visibility
- `imageURI` — visual representation on the map
