# royalties (ERC-2981)

Every tile sale on a secondary marketplace generates a royalty payment back to the tile's token-bound account, creating a perpetual revenue stream.

## overview

[ERC-2981](https://eips.ethereum.org/EIPS/eip-2981) is the NFT royalty standard. It exposes a `royaltyInfo()` function that marketplaces query to determine how much of a sale price should be forwarded as a royalty, and to whom.

In agora.fi, royalties are directed to the tile's own token-bound account — meaning **the tile pays itself** on every resale.

## how it works

```
Buyer pays 1 ETH on marketplace
  ├─ 0.95 ETH ──▶ Seller
  └─ 0.05 ETH ──▶ Tile's Token-Bound Account (5% royalty)
```

1. A tile is listed and sold on any ERC-2981-compliant marketplace.
2. The marketplace calls `royaltyInfo(tokenId, salePrice)`.
3. The contract returns the tile's TBA address and the royalty amount (default 5%).
4. The marketplace forwards the royalty to the TBA.

## perpetual income

Royalties accrue **every time the tile changes hands**, regardless of who currently owns it. The royalty receiver is the TBA, not a specific wallet — so every owner benefits from secondary sales that happen during their ownership.

If a tile is resold frequently, royalty income compounds alongside rental and vault yield.

## royalty rate

| Parameter | Value |
|-----------|-------|
| Default rate | 5% of sale price |
| Receiver | Tile's token-bound account |
| Standard | ERC-2981 |
| Enforcement | Marketplace-dependent (honoured by OpenSea, Blur, etc.) |

## transfer behavior

When the tile is sold:

- The royalty configuration stays with the NFT.
- The new owner controls the TBA that receives future royalties.
- Past royalty income already in the TBA transfers with it.
