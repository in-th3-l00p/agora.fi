[← blockchain](./index.md)

# SpaceToken

ERC-20 governance token deployed once per space by SpaceFactory. One space = one unique token with its own name and symbol.

## features

- **ERC20Votes** — on-chain voting weight with delegation. Token holders delegate to themselves or others to activate voting power.
- **ERC20Permit** — gasless approvals via EIP-2612 signed messages.
- **ERC20Burnable** — any holder can burn their own tokens.

## immutables

- `spaceId` — the AgoraTile space this token governs.

## supply

Total supply is minted once at deployment to the SpaceFactory, which immediately distributes it to the allocation addresses. No further minting is possible.
