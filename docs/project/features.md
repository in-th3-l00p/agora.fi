[← back to project description](./index.md)

# features

## core features (MVP)

### 1. isometric Space view

An interactive 3D isometric city grid where users explore the Space. The default grid is 10x10 (100 tiles). Users can pan, zoom, and rotate the camera to navigate.

Tiles appear in three states:
- **Empty** — available for purchase, shown as wireframe/gray
- **Owned** — purchased and customized, fully rendered with a glow effect
- **Featured** — premium tiles with special highlighting

Sub-space landmarks occupy 2x2 tiles and stand taller than regular buildings — these house the News Factory, Marketplace, DAO Chamber, Analytics Tower, and other shared facilities.

### 2. tile purchase

Users click an empty tile to open a purchase modal showing:
- Tile preview and location (row, column, district)
- Tier information (1–5) with an explanation of each tier's benefits
- Price in ETH with USD equivalent
- Ownership benefits (staking multipliers, voting power, rental income potential)
- Transaction breakdown (tile price, platform fee, gas estimate, total)

After wallet approval and on-chain confirmation, a success animation plays and the tile updates to "owned" state on the grid.

### 3. tile customization

Once purchased, owners personalize their tile:
- **Company/project name** — displayed on the tile
- **Logo upload** — PNG/JPG, shown on the building
- **Description** — 280-character bio
- **Website URL & Twitter handle** — linked from the tile detail view
- **Industry category** — classifies the tile on the grid
- **Visual options** — choose from 6 brand colors, 3 building heights, and a glow toggle

Changes preview in real time before saving.

### 4. tile wallet (Token Bound Account)

Every tile has its own smart wallet. The tile detail view shows:
- The wallet address
- Current holdings: ETH balance, token balance, vault shares, other NFTs
- Total portfolio value
- Transaction history

The wallet acts autonomously:
- Auto-claims staking rewards
- Auto-compounds earnings
- Receives rental payments directly
- Participates in governance votes

### 5. staking

A dedicated staking dashboard displays:
- **Overview stats** — total staked value, pending rewards, average APR, number of staked tiles
- **Active stakes** — each stake shows the tile preview, staked amount, current APR (with tier and lock multipliers), pending rewards, lock period progress, and claim/unstake actions

A **staking calculator** lets users simulate returns:
- Enter an amount, select a lock period (3, 6, 12, or 24 months), optionally attach a tile for a boost
- See estimated returns and effective APR in real time

### 6. rental marketplace

Tile owners can rent out their tiles to other users:
- Toggle rental on/off and set a monthly rate
- Renters browse available tiles, select a duration, and pay upfront
- The renter gets time-limited usage rights: they can customize the tile's appearance, post in the News Factory, and use it for branding
- Renters **cannot** sell or transfer the tile
- When the rental period ends, rights automatically revert to the owner — no transaction required
- Rental income flows directly into the tile's wallet

### 7. secondary marketplace

A built-in marketplace for trading tiles:
- **Browse & filter** — by tier, price, recency, or time remaining on listing
- **Listing cards** — isometric preview, tier badge, price (ETH + USD), location
- **List a tile** — set a price, preview, and publish
- **Make offers** — bid on any tile with an expiration date; owners accept or reject
- **Royalties** — 5% of every secondary sale automatically flows to the tile's own wallet

### 8. DAO governance

Each Space has on-chain governance:
- **Dashboard** — your voting power, active proposal count, treasury balance, participation rate
- **Proposals** — title, description, status (Active / Passed / Failed), voting bars with percentages, time remaining, vote buttons
- **Create proposals** — any token holder can submit proposals for community vote
- **Voting history** — track past votes and outcomes

### 9. News Factory

An AI-powered news feed for the Space:
- Automatically generated headlines and articles about Space activity (funding rounds, launches, partnerships, events, awards)
- Filterable by category
- Tile owners can also post their own news manually
- Each article shows its headline, summary, AI-generated badge, timestamp, and related tile
- Trending topics sidebar

### 10. Analytics Tower

A data hub for the Space:
- **Space metrics** — total tiles, tiles owned, unique owners, floor price, 24h volume, total volume, most active categories
- **Visualizations** — ownership distribution (donut chart), tiles by industry (bar chart), volume over time (line chart), activity heatmap
- Real-time updates (30-second refresh)

---

## advanced features (post-MVP)

### multi-Space support
- Space creation wizard for launching new communities
- Custom branding per Space
- Cross-space tile ownership
- Space discovery page

### mobile application
- Native app with core features optimized for mobile
- Push notifications for rental income, governance votes, marketplace offers, and staking rewards

### advanced AI
- Personalized news feeds per user
- Predictive analytics for tile values
- Sentiment analysis on Space activity
- Automated Space reports

### DeFi integrations
- Lending against staked tiles
- Cross-protocol composability
- Yield aggregation
- Derivatives (futures, options on tile values)

### social features
- User profiles and tile owner directories
- Direct messaging between owners
- Community events calendar
- Achievement badges (soulbound NFTs)
