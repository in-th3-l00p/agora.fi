# tokenomics & income model

A tile is not a speculative collectible — it is a productive asset with multiple compounding income streams.

## income streams

Each tile generates revenue from three independent sources:

### 1. rental income

Tenants pay to use a tile for a fixed period. Payments flow directly into the tile's token-bound account.

- Typical rate: ~$300/month
- Occupancy assumption: ~8 months/year
- Annual estimate: **~$2,400/year**

See [rentals](./rentals.md) for the technical mechanism.

### 2. vault yield (staking)

Tokens held in the tile's TBA can be deposited into ERC-4626 vaults to earn yield.

- Typical principal: ~$3,000 staked
- Typical APY: 15–45% depending on strategy
- At 20% APY: **~$600/year**

See [vaults](./vaults.md) for the technical mechanism.

### 3. royalties

Every secondary sale of the tile generates a 5% royalty paid to the tile's TBA.

- Assumes ~2 resales/year in active markets
- At average sale price of $3,000: **~$300/year**

See [royalties](./royalties.md) for the technical mechanism.

## example: tile #042

| Metric | Value |
|--------|-------|
| Purchase price | $250 |
| Rental income | $2,400/year |
| Vault yield (20% on $3k) | $600/year |
| Royalty income (2 sales) | $300/year |
| **Total annual income** | **~$3,300/year** |
| **ROI** | **~1,320%** |

All income is passive after initial configuration.

## value composition

When a tile is sold, its price reflects the sum of:

1. **NFT floor value** — base price for the map position and space membership.
2. **TBA balance** — liquid tokens held in the wallet.
3. **Vault position** — staked principal + accrued yield.
4. **Rental contract value** — present value of remaining rental income.
5. **Royalty stream** — expected future royalty cashflow.

This makes tile pricing more akin to business valuation than NFT speculation.

## comparison

| Attribute | Traditional NFT | agora.fi tile |
|-----------|----------------|---------------|
| Income | None | Rental + yield + royalties |
| Asset holdings | None | Token portfolio + vault positions |
| Management | Manual speculation | Autonomous operation |
| Value driver | Hype / rarity | Cashflow + productive assets |
| Transfer | Image only | Entire business in one tx |
