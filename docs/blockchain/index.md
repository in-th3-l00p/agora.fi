[← back to index](../index.md)

# web3 architecture

agora.fi's on-chain infrastructure turns NFT tiles into autonomous, income-generating smart wallets by composing three finalized ERC standards with a custom tile wallet on top of an isometric tile map.

## core standards

| Standard | Role | Spec | Section |
|----------|------|------|---------|
| [ERC-721](https://eips.ethereum.org/EIPS/eip-721) | Tile ownership | [EIP-721](https://eips.ethereum.org/EIPS/eip-721) | [tile NFT](./tile-nft.md) |
| [ERC-4626](https://eips.ethereum.org/EIPS/eip-4626) | Yield & staking | [EIP-4626](https://eips.ethereum.org/EIPS/eip-4626) | [vaults](./vaults.md) |
| [ERC-4907](https://eips.ethereum.org/EIPS/eip-4907) | Time-limited rentals | [EIP-4907](https://eips.ethereum.org/EIPS/eip-4907) | [rentals](./rentals.md) |
| [ERC-2981](https://eips.ethereum.org/EIPS/eip-2981) | On-sale royalties | [EIP-2981](https://eips.ethereum.org/EIPS/eip-2981) | [royalties](./royalties.md) |

## tile wallets

Each tile has a custom **[tile wallet](./tile-wallet.md)** — a per-tile smart contract that holds assets, receives income, and executes calls on behalf of the tile owner.

## economics

* [tokenomics & income model](./tokenomics.md)

## how they compose

```
ERC-721 (Tile NFT)
  └─ Tile Wallet (custom smart contract)
       ├─ holds ERC-20 tokens
       ├─ ERC-4626 vault position (staking / yield)
       ├─ ERC-4907 rental state (usage rights)
       └─ ERC-2981 royalty config (perpetual creator fee)
```

When a tile is sold, the buyer receives the NFT **and** the entire tile wallet — all assets, vault positions, active rentals, and future royalty streams transfer atomically in a single transaction.

## future plans

| Standard | Status | Purpose |
|----------|--------|---------|
| [ERC-6551](https://eips.ethereum.org/EIPS/eip-6551) | Draft | Token Bound Accounts — once finalized, the tile wallet may be migrated to this standard for ecosystem interoperability |

## navigation

* [tile NFT (ERC-721)](./tile-nft.md)
* [tile wallets](./tile-wallet.md)
* [vaults (ERC-4626)](./vaults.md)
* [rentals (ERC-4907)](./rentals.md)
* [royalties (ERC-2981)](./royalties.md)
* [tokenomics & income model](./tokenomics.md)
