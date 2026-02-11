# vaults (ERC-4626)

Tiles earn yield by depositing tokens from their smart wallet into tokenized vaults.

## overview

[ERC-4626](https://eips.ethereum.org/EIPS/eip-4626) is the standard interface for tokenized yield-bearing vaults. A vault accepts deposits of an underlying token and issues shares representing a proportional claim on the vault's growing balance.

In agora.fi, each tile's token-bound account can deposit into one or more ERC-4626 vaults to earn passive yield.

## how it works

```
Tile TBA ──deposit()──▶ ERC-4626 Vault
  │                        │
  │◀── vault shares ───────┘
  │
  │  (time passes, vault accrues yield)
  │
  │──redeem()──▶ Vault
  │◀── underlying + yield ──┘
```

1. The tile owner calls `deposit()` on a vault through the token-bound account.
2. The vault accepts the underlying tokens and mints shares to the TBA.
3. The vault deploys deposited tokens into a yield strategy (lending, LP, etc.).
4. Shares appreciate in value as yield accrues.
5. The owner can `redeem()` shares for underlying tokens + earned yield at any time.

## yield sources

| Strategy | Typical APY | Risk |
|----------|-------------|------|
| Lending (Aave, Compound) | 5–15% | Low |
| Liquidity provision | 15–30% | Medium |
| Leveraged strategies | 30–45%+ | High |

Vault selection is configurable per tile. The platform may offer curated vault options per space.

## auto-compounding

Vaults can be configured to auto-compound — earned yield is re-deposited into the vault without owner action. This maximizes returns through compound interest.

## transfer behavior

Vault shares are held by the token-bound account. When the tile NFT is sold:

- All vault shares transfer with the account.
- The buyer inherits the full staked position and all accrued yield.
- No unstaking or re-staking is required.
