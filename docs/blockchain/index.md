[← back to index](../index.md)

# blockchain

Solidity ^0.8.24 contracts built with Foundry. Dependencies managed by Soldeer (OpenZeppelin 5.2.0, forge-std 1.14.0).

## contracts

| Contract | Standard | Purpose |
|----------|----------|---------|
| [AgoraTile](./agora-tile.md) | ERC-721 | Tile NFT ownership within spaces |
| [SpaceFactory](./space-factory.md) | Ownable | Creates spaces with a governance token |
| [SpaceToken](./space-token.md) | ERC-20 | Per-space governance token |
| [SpaceTokenDeployer](./space-factory.md#spacetokendeployer) | — | Deploys SpaceToken instances for the factory |
| [SpaceStaking](./space-staking.md) | Ownable | Stake governance tokens for rewards |

## deployment

The deploy script (`script/DeployAgoraTile.s.sol`) deploys three contracts in order:

1. **AgoraTile** — the NFT contract
2. **SpaceTokenDeployer** — token creation helper
3. **SpaceFactory** — initialized with references to both, then authorized on AgoraTile

After deployment, SpaceFactory can create spaces which register on AgoraTile and deploy a SpaceToken. SpaceStaking is deployed separately per space.

## how they connect

```
SpaceFactory
  ├─ calls SpaceTokenDeployer to create a SpaceToken
  ├─ distributes tokens to allocation addresses
  └─ registers the space on AgoraTile (sets mint price)

AgoraTile
  └─ users mint tile NFTs in registered spaces

SpaceStaking (one per space)
  ├─ accepts SpaceToken stakes with lock periods
  ├─ reads tile tier from AgoraTile for boost multipliers
  └─ distributes reward tokens over time
```
