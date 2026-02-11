# tile wallets

Every tile NFT owns a smart wallet. This is the core innovation that turns a static NFT into an autonomous business.

## overview

Each tile has a dedicated **tile wallet** — a smart contract wallet deployed alongside the NFT at mint time. The tile holder controls the wallet; the wallet holds and manages all on-chain assets for that tile.

```
Tile Owner (EOA / multisig)
  └─ controls ─▶ Tile NFT (ERC-721)
                   └─ owns ─▶ Tile Wallet (smart contract)
                                ├─ ERC-20 balances
                                ├─ vault shares (ERC-4626)
                                ├─ rental state (ERC-4907)
                                └─ arbitrary contract calls
```

## wallet creation

When a tile is minted, a corresponding tile wallet contract is deployed. The wallet address is deterministically computed from:

- The tile NFT contract address
- The token ID
- The chain ID

This means the wallet address is known **before** deployment and is permanently bound to the NFT — it cannot be reassigned.

## capabilities

A tile wallet can:

| Capability | How |
|------------|-----|
| Hold ETH and ERC-20 tokens | Native wallet functionality |
| Deposit into yield vaults | Calls ERC-4626 `deposit()` |
| Receive rental payments | Incoming transfers from rental contracts |
| Execute arbitrary calls | Owner-gated `execute()` function |
| Receive royalties | Marketplace forwards ERC-2981 fees |

## autonomy

The wallet operates 24/7 without owner intervention:

- **Rental income** flows in automatically when tenants pay.
- **Vault yield** compounds according to the vault strategy.
- **Royalties** arrive whenever the tile is resold on any ERC-2981-compliant marketplace.

The owner only needs to act when changing configuration — e.g. adjusting vault allocation, setting rental terms, or withdrawing funds.

## transfer semantics

When the tile NFT is transferred, the new owner gains full control of the tile wallet. No migration is needed — the wallet is the same contract at the same address, now governed by whoever holds the NFT.

## future: ERC-6551 migration

[ERC-6551](https://eips.ethereum.org/EIPS/eip-6551) (Token Bound Accounts) is a draft standard that formalizes NFT-owned wallets. It is not yet finalized and may undergo breaking changes before reaching Final status.

agora.fi's tile wallet fulfils the same role that ERC-6551 aims to standardize. Once ERC-6551 is finalized, the tile wallet implementation may be migrated to conform to the standard, gaining ecosystem-wide interoperability (marketplace support, block explorer recognition, third-party tooling).

Until then, the custom implementation avoids depending on a spec that could change in an immutable contract environment.
