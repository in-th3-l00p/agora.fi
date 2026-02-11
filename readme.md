# agora.fi

Tile-based NFT marketplace built with Solidity (Foundry) and Next.js.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (includes `forge`, `anvil`, `cast`)
- [Node.js](https://nodejs.org/) v18+
- Python 3 (ships with macOS/Linux)
- GNU Make

## Project Structure

```
agora.fi/
├── web3/            # Foundry — Solidity contracts
├── webapp/          # Next.js — frontend application
├── scripts/         # Helper scripts (deploy artifacts, etc.)
├── deployments/     # Generated contract addresses (per network)
├── docs/            # Project documentation
├── Makefile         # Dev orchestration
└── testnet.conf     # Local testnet parameters
```

## Quick Start

Start the full local stack (anvil testnet + contract deploy + webapp dev server) with a single command:

```bash
make dev
```

This will:
1. Start an Anvil local testnet on `http://127.0.0.1:8545`
2. Deploy the AgoraTile contract using the deterministic deployer account
3. Write contract addresses to `deployments/local.json`
4. Start the Next.js dev server at `http://localhost:3000`

## Setup

### 1. Install dependencies

```bash
# Solidity dependencies (Soldeer)
cd web3 && forge soldeer install && cd ..

# Webapp dependencies
cd webapp && npm install && cd ..
```

### 2. Configure environment

```bash
# Webapp — copy and fill in your Privy app ID
cp webapp/.env.example webapp/.env.local
```

The local testnet values are pre-filled. You only need to set `NEXT_PUBLIC_PRIVY_APP_ID`.

### 3. Run

```bash
make dev
```

## Make Targets

| Command | Description |
|---------|-------------|
| `make dev` | Start everything (anvil + deploy + webapp) |
| `make chain` | Start chain only (anvil + deploy, no webapp) |
| `make anvil` | Start Anvil local testnet only |
| `make deploy` | Deploy contracts to local testnet |
| `make dev-webapp` | Start Next.js dev server only |
| `make stop` | Stop Anvil |
| `make clean` | Stop Anvil and wipe all local state |

## Local Testnet

The local testnet uses Anvil with deterministic accounts derived from the standard test mnemonic:

```
test test test test test test test test test test test junk
```

| Account | Address | Use |
|---------|---------|-----|
| #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | Deployer |
| #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | Test user |
| #2–#9 | — | Additional test accounts |

Each account is funded with 10,000 ETH. Private keys can be found in `testnet.conf`.

State persists across restarts in `.anvil/state.json`. Run `make clean` to reset.

### Verify deployment

```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "name()" --rpc-url http://127.0.0.1:8545
# Returns: "AgoraTile"
```

## Smart Contracts

Located in `web3/src/`.

| Contract | Description |
|----------|-------------|
| `AgoraTile.sol` | ERC-721 — mintable tile NFTs with coordinates and spaces |

### Build and test

```bash
cd web3
forge build
forge test
```

### Deploy to a live network

```bash
cp web3/.env.example web3/.env
# Fill in PRIVATE_KEY, RPC_URL, and ETHERSCAN_API_KEY

cd web3
source .env
forge script script/DeployAgoraTile.s.sol:DeployAgoraTile \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

## Webapp

Next.js app located in `webapp/`. Uses Privy for wallet authentication and Tailwind CSS + Radix UI for the interface.

### Run standalone

```bash
cd webapp
npm run dev       # development
npm run build     # production build
npm start         # serve production build
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy application ID |
| `NEXT_PUBLIC_CHAIN_ID` | Target chain ID (default: `31337`) |
| `NEXT_PUBLIC_RPC_URL` | RPC endpoint (default: `http://127.0.0.1:8545`) |
| `NEXT_PUBLIC_AGORA_TILE_ADDRESS` | Deployed AgoraTile contract address |
