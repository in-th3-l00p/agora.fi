[← back to project description](./index.md)

# user flows

## first tile purchase

The primary journey for a new user — from discovery to becoming a tile owner.

### 1. discovery

- User lands on the AGORAFI homepage
- Reads the value proposition and sees featured Spaces
- Clicks "Explore" on a Space (e.g., Romanian Tech Space)

### 2. exploration

- Enters the isometric city grid
- Pans, zooms, and rotates to explore the Space
- Sees owned tiles (glowing, customized buildings) and empty tiles (wireframe)
- Clicks on an empty tile to learn more

### 3. wallet connection

- Clicks "Connect Wallet" in the header
- Selects their wallet (MetaMask, WalletConnect, etc.)
- Approves the connection
- Wallet address appears in the header

### 4. purchase

- Reviews the tile details modal: location, tier, price (ETH + USD), ownership benefits
- Sees the transaction breakdown: tile price + platform fee + estimated gas = total
- Clicks "Purchase Tile"
- Approves the transaction in their wallet
- Waits for on-chain confirmation (~10–30 seconds)
- Success animation plays

### 5. customization

- Redirected to the customization modal
- Enters company name, uploads logo, writes a description
- Sets website URL and Twitter handle
- Selects industry category
- Chooses building color, height, and glow effect
- Previews changes in real time on the isometric model
- Clicks "Save Changes" and confirms the metadata transaction

### 6. post-purchase

- Tile updates on the grid — now rendered as an owned, customized building
- "My Tiles" counter appears in the header
- User can now access: staking dashboard, rental settings, governance voting
- Receives welcome guidance with next steps

---

## staking a tile

How a tile owner earns yield through staking.

1. Navigate to the **Staking** tab
2. See an overview of potential earnings based on owned tiles
3. Click **"Stake"** on a tile
4. The staking modal opens:
   - Enter the amount to stake (minimum 100 tokens)
   - Select a lock period: 3, 6, 12, or 24 months
   - Watch the APR and estimated rewards update in real time as you adjust
5. Click **"Stake Now"**
6. Approve the token transfer (first time only)
7. Confirm the staking transaction
8. The tile is marked as staked on the grid
9. Rewards begin accruing immediately and auto-compound
10. At any time: view pending rewards, claim without unstaking, or unstake after the lock period ends

---

## renting out a tile

How a tile owner earns passive income by renting to another user.

### owner's side (Alice)

1. Alice owns Tile #042
2. She navigates to tile details and clicks **"Enable Rental"**
3. Sets a monthly rate (e.g., 0.1 ETH)
4. Her tile appears in the rental marketplace

### renter's side (Bob)

5. Bob browses the rental marketplace
6. Finds Tile #042, reviews the rate and location
7. Selects a duration (e.g., 30 days) and sees the total cost
8. Pays the rental fee

### during the rental

9. Payment flows: Bob → Tile's Wallet → Alice
10. Bob gets usage rights for 30 days:
    - Can customize the tile's appearance
    - Can post in the News Factory
    - Can use the tile for branding
    - **Cannot** sell or transfer the tile
11. After 30 days, rights automatically revert to Alice — no transaction needed

---

## participating in governance

How token holders shape their Space through proposals and voting.

1. Navigate to the **Governance** tab
2. See your voting power (based on token balance), active proposals, and treasury balance
3. Browse active proposals — each shows:
   - Title and description
   - Current voting breakdown (For / Against with percentages)
   - Time remaining
   - Who created the proposal
4. Click **"Vote For"** or **"Vote Against"** on a proposal
5. Confirm the vote transaction
6. To create a proposal: click **"New Proposal"**, write a title and description, submit for community vote

---

## buying a tile on the secondary market

How a user purchases a tile from another owner.

1. Navigate to the **Marketplace** tab
2. Browse listed tiles — filter by tier, sort by price or recency
3. Click on a tile to see its full details: location, tier, current holdings in its wallet, staking positions, rental status
4. Either:
   - **Buy now** at the listed price, or
   - **Make an offer** with a custom price and expiration date
5. If buying now: confirm the transaction. The tile, its wallet, and all assets inside transfer atomically
6. If making an offer: wait for the owner to accept or reject. If accepted, the transfer executes automatically
7. 5% royalty is automatically paid to the tile's wallet; 2.5% platform fee is deducted
