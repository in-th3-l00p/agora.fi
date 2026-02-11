[← blockchain](./index.md)

# AgoraTile

ERC-721 Enumerable NFT contract. Each token represents a tile at a specific coordinate within a space.

## spaces

A space is a named region with a fixed mint price. Spaces are created by the contract owner or the authorized SpaceFactory. Each space ID can only be registered once.

## tiles

A tile is identified by a deterministic token ID derived from `keccak256(spaceId, x, y)`. Minting requires paying the space's exact mint price in native currency. All tiles start at tier 1.

Each tile stores: space ID, x coordinate, y coordinate, and tier.

## access control

- **Owner** can create spaces, set the base URI, set the factory address, and transfer ownership.
- **Factory** can create spaces.
- **Anyone** can mint tiles in existing spaces by paying the mint price.

## key functions

| Function | Who | Description |
|----------|-----|-------------|
| `createSpace(spaceId, mintPrice)` | Owner / Factory | Register a new space |
| `mint(spaceId, x, y)` | Anyone (payable) | Mint a tile NFT at the given coordinates |
| `setFactory(address)` | Owner | Authorize a factory contract |
| `setBaseURI(string)` | Owner | Set the metadata base URI |
| `tileId(spaceId, x, y)` | View | Compute the deterministic token ID |
