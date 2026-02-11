[← back to index](../index.md)

# web3 architecture

agora.fi's on-chain infrastructure turns NFT tiles into autonomous, income-generating smart wallets by composing four ERC standards on top of an isometric tile map.

## core standards

| Standard | Role | Spec | Section |
|----------|------|------|---------|
| [ERC-721](https://eips.ethereum.org/EIPS/eip-721) | Tile ownership | [EIP-721](https://eips.ethereum.org/EIPS/eip-721) | [tile NFT](./tile-nft.md) |
| [ERC-6551](https://eips.ethereum.org/EIPS/eip-6551) | Per-tile smart wallet | [EIP-6551](https://eips.ethereum.org/EIPS/eip-6551) | [token-bound accounts](./token-bound-accounts.md) |
| [ERC-4626](https://eips.ethereum.org/EIPS/eip-4626) | Yield & staking | [EIP-4626](https://eips.ethereum.org/EIPS/eip-4626) | [vaults](./vaults.md) |
| [ERC-4907](https://eips.ethereum.org/EIPS/eip-4907) | Time-limited rentals | [EIP-4907](https://eips.ethereum.org/EIPS/eip-4907) | [rentals](./rentals.md) |
| [ERC-2981](https://eips.ethereum.org/EIPS/eip-2981) | On-sale royalties | [EIP-2981](https://eips.ethereum.org/EIPS/eip-2981) | [royalties](./royalties.md) |

## economics

* [tokenomics & income model](./tokenomics.md)

## how they compose

```
ERC-721 (Tile NFT)
  └─ ERC-6551 (Token-Bound Account)
       ├─ holds ERC-20 tokens
       ├─ ERC-4626 vault position (staking / yield)
       ├─ ERC-4907 rental state (usage rights)
       └─ ERC-2981 royalty config (perpetual creator fee)
```

When a tile is sold, the buyer receives the NFT **and** the entire token-bound account — all assets, vault positions, active rentals, and future royalty streams transfer atomically in a single transaction.

## navigation

* [tile NFT (ERC-721)](./tile-nft.md)
* [token-bound accounts (ERC-6551)](./token-bound-accounts.md)
* [vaults (ERC-4626)](./vaults.md)
* [rentals (ERC-4907)](./rentals.md)
* [royalties (ERC-2981)](./royalties.md)
* [tokenomics & income model](./tokenomics.md)
