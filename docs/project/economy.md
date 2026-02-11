[← back to project description](./index.md)

# economy & tokenomics

## revenue model

AGORAFI generates revenue at two levels: the **platform** (AGORAFI itself) and each individual **Space** (its community DAO).

### platform revenue

| Source | Fee | Description |
|--------|-----|-------------|
| Primary tile sales | 2.5% | Charged when a tile is first minted and sold |
| Secondary sales | 2.5% | Charged on every marketplace resale |
| Premium features (future) | Subscription | Advanced analytics, custom branding, whitelabel Spaces, priority support |
| Space creation (future) | One-time | Fee for launching a new Space on the platform |

### Space revenue (DAO treasury)

| Source | Amount | Description |
|--------|--------|-------------|
| Primary tile sales | 97.5% of sale price | The vast majority of initial sales fund the Space treasury |
| Marketplace royalties | 5% of secondary sales | Flows to the individual tile's wallet, then distributed per Space rules |
| Governance-approved | Varies | Event sponsorships, brand partnerships, premium News Factory listings |

Rental income goes directly to tile owners — the Space takes no cut. This incentivizes owners to rent out tiles, which drives activity and tile value appreciation.

### how Space revenue is distributed

Revenue that enters the DAO treasury is split by governance:

| Allocation | Share | Purpose |
|------------|-------|---------|
| DAO Treasury | 50% | Grants, operations, partnerships, events |
| Staking Rewards Pool | 30% | Distributed to stakers as yield |
| Token Buyback & Burn | 20% | Deflationary mechanism — tokens are bought from the market and burned |

---

## Space token

Each Space has its own governance and utility token. The first Space (Romanian Tech Space) uses **$ROTECH** as an example.

### token distribution

| Allocation | Share | Details |
|------------|-------|---------|
| DAO Treasury | 40% | Controlled by governance; used for grants, events, partnerships, operations |
| Team & Advisors | 20% | 2-year vesting with 6-month cliff, then linear unlock over 18 months |
| Staking Rewards | 20% | Distributed over 5 years with decreasing emissions |
| Liquidity Pool | 10% | Paired with ETH; LP tokens locked for minimum 1 year |
| Early Supporters | 5% | Genesis tile buyers and contributors; 6-month vesting |
| Platform Reserve | 5% | Cross-space incentives and protocol development |

### staking rewards emission schedule

| Year | Tokens distributed | Share of staking pool |
|------|-------------------|----------------------|
| 1 | 8,000,000 | 40% |
| 2 | 6,000,000 | 30% |
| 3 | 4,000,000 | 20% |
| 4 | 1,500,000 | 7.5% |
| 5 | 500,000 | 2.5% |

---

## staking mechanics

### base rate

Staking earns a **base APR of 15%**, which is then multiplied by the tile's tier and the chosen lock duration.

### tier multipliers

Higher-tier tiles earn more from staking:

| Tier | Multiplier | Effective APR |
|------|-----------|---------------|
| Tier 1 | 1.0x | 15.0% |
| Tier 2 | 1.2x | 18.0% |
| Tier 3 | 1.5x | 22.5% |
| Tier 4 | 2.0x | 30.0% |
| Tier 5 | 3.0x | 45.0% |

### lock multipliers

Longer lock periods earn more:

| Lock period | Multiplier |
|-------------|-----------|
| 3 months | 1.0x |
| 6 months | 1.2x |
| 12 months | 1.5x |
| 24 months | 2.0x |

### example calculation

A **Tier 3** tile with a **12-month lock**:
- Base: 15%
- Tier 3 multiplier: 1.5x → 22.5%
- 12-month lock multiplier: 1.5x → **33.75% effective APR**

Minimum stake: **100 tokens**. Rewards auto-compound through the vault — no manual claiming needed for compounding.

---

## revenue flow per sale type

### primary sale (new tile mint)

```
Buyer pays 0.08 ETH
  ├─ 2.5% → Platform Treasury (0.002 ETH)
  └─ 97.5% → Space DAO Treasury (0.078 ETH)
```

### secondary sale (marketplace resale)

```
Buyer pays 1.00 ETH
  ├─ 2.5% → Platform Treasury (0.025 ETH)
  ├─ 5.0% → Tile's Own Wallet (0.050 ETH) — royalty
  └─ 92.5% → Seller (0.925 ETH)
```

### rental payment

```
Renter pays 0.1 ETH/month
  └─ 100% → Tile Owner's Wallet (0.1 ETH)
```

---

## projected economics (Romanian Tech Space, Year 1)

### months 1–3 (launch)

- ~50 tiles sold at 0.08 ETH = 4 ETH total
- Platform revenue: ~0.1 ETH
- Space treasury: ~3.9 ETH

### months 4–12 (growth)

- ~10 new tiles/month at 0.08 ETH
- Secondary market volume: ~2 ETH/month
- Rental income: ~1 ETH/month

### year 2+ (mature)

- Primary sales slow as grid fills
- Secondary market becomes the main driver (5–10 ETH/month volume)
- Rental market thriving with 10–20 tiles actively rented
