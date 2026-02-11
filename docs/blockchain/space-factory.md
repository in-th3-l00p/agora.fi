[← blockchain](./index.md)

# SpaceFactory

Creates spaces in a single transaction: deploys a governance token, distributes it, and registers the space on AgoraTile.

## creating a space

Caller provides: space ID, token name, token symbol, tile mint price, total supply (0 for default 100M), and six allocation addresses.

The factory then:

1. Deploys a new SpaceToken via SpaceTokenDeployer
2. Distributes the full supply to the allocation addresses
3. Registers the space on AgoraTile with the given mint price
4. Stores the space info (token address, creator, mint price)

Each space ID can only be created once.

## token allocation

| Bucket | Share |
|--------|-------|
| DAO Treasury | 40% |
| Team & Advisors | 20% |
| Staking Rewards | 20% |
| Liquidity Pool | 10% |
| Early Supporters | 5% |
| Platform Reserve | 5% |

All six allocation addresses are required and validated to be non-zero.

## key functions

| Function | Who | Description |
|----------|-----|-------------|
| `createSpace(...)` | Anyone | Deploy token, distribute, register space |
| `tokenOf(spaceId)` | View | Get the governance token address for a space |
| `spaceCount()` | View | Total number of spaces created |
| `spaceInfo(spaceId)` | View | Token address, creator, and mint price |

## SpaceTokenDeployer

A helper contract that holds SpaceToken's creation bytecode. Extracted from SpaceFactory to keep it under the EIP-170 contract size limit (24,576 bytes). It exposes a single `deploy(...)` function called only by the factory.
