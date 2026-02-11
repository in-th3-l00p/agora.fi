# token-bound accounts (ERC-6551)

Every tile NFT owns a smart wallet. This is the core innovation that turns a static NFT into an autonomous business.

## overview

[ERC-6551](https://eips.ethereum.org/EIPS/eip-6551) defines **token-bound accounts** — smart contract wallets owned and controlled by an NFT. The tile holder controls the account; the account holds and manages all on-chain assets for that tile.

```
Tile Owner (EOA / multisig)
  └─ controls ─▶ Tile NFT (ERC-721)
                   └─ owns ─▶ Token-Bound Account (ERC-6551)
                                ├─ ERC-20 balances
                                ├─ vault shares (ERC-4626)
                                ├─ rental state (ERC-4907)
                                └─ arbitrary contract calls
```

## account creation

The account address is deterministically computed from:

- The ERC-721 contract address
- The token ID
- The chain ID
- A salt value
- The account implementation address

This means the account address is known **before** deployment and is permanently bound to the NFT — it cannot be reassigned.

## capabilities

A tile's token-bound account can:

| Capability | How |
|------------|-----|
| Hold ETH and ERC-20 tokens | Native wallet functionality |
| Deposit into yield vaults | Calls ERC-4626 `deposit()` |
| Receive rental payments | Incoming transfers from rental contracts |
| Execute arbitrary calls | Owner-gated `execute()` function |
| Receive royalties | Marketplace forwards ERC-2981 fees |

## autonomy

The account operates 24/7 without owner intervention:

- **Rental income** flows in automatically when tenants pay.
- **Vault yield** compounds according to the vault strategy.
- **Royalties** arrive whenever the tile is resold on any ERC-2981-compliant marketplace.

The owner only needs to act when changing configuration — e.g. adjusting vault allocation, setting rental terms, or withdrawing funds.

## transfer semantics

When the tile NFT is transferred, the new owner gains full control of the token-bound account. No migration is needed — the account is the same contract at the same address, now governed by whoever holds the NFT.
