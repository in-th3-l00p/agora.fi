# rentals (ERC-4907)

Tiles can be rented out for a fixed period, granting temporary usage rights while ownership and income remain with the tile holder.

## overview

[ERC-4907](https://eips.ethereum.org/EIPS/eip-4907) extends ERC-721 with a `user` role — a time-limited permission to use the NFT without owning it. In agora.fi, this lets tile owners rent their space to tenants who want to promote a business, display content, or participate in a community.

## roles

| Role | Rights |
|------|--------|
| **Owner** | Full control — set rental terms, withdraw income, manage vault, sell tile |
| **User (tenant)** | Use the tile on the map — display branding, interact with visitors — for the rental duration |

## rental flow

```
1. Owner sets rental terms (price, duration)
2. Tenant calls setUser() and pays rental fee
3. Rental fee flows to tile's wallet
4. Tenant gets usage rights for the agreed period
5. On expiry, user role auto-clears — no action needed
```

## key properties

- **Automatic expiration** — the `expires` timestamp is on-chain. After expiry, `userOf()` returns `address(0)`. No transaction needed to reclaim the tile.
- **Non-custodial** — the owner never loses the NFT. Rental only grants the `user` role.
- **Composable income** — rental payments land in the tile wallet and can be staked into vaults for additional yield.

## pricing

Rental pricing is set by the tile owner and can vary by:

- Space demand and location
- Tile tier
- Rental duration (weekly, monthly, quarterly)

Payments are made in the space's accepted token (stablecoin or native token).

## transfer behavior

If the tile is sold while a rental is active:

- The new owner inherits the active rental agreement.
- The tenant's usage rights remain valid until expiry.
- Future rental income flows to the new owner's control.
