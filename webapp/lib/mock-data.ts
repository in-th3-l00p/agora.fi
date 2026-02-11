export interface Space {
  id: string;
  name: string;
  description: string;
  token: string;
  totalTiles: number;
  tilesSold: number;
  owners: number;
  floorPrice: string;
  category: string;
  status: "live" | "launching" | "upcoming";
  createdAt: string;
  creatorAddress: string;
}

export const PLATFORM_SPACES: Space[] = [
  {
    id: "romania",
    name: "Romanian Tech Space",
    description:
      "The Romanian startup ecosystem — from Bucharest to Cluj, Timișoara, and Iași — in a single governed virtual environment.",
    token: "$ROTECH",
    totalTiles: 1000,
    tilesSold: 247,
    owners: 52,
    floorPrice: "0.05 ETH",
    category: "Startup Ecosystem",
    status: "live",
    createdAt: "2025-12-01",
    creatorAddress: "0x1a2b...3c4d",
  },
  {
    id: "defi-builders",
    name: "DeFi Builders Hub",
    description:
      "A collaborative space for DeFi protocol teams, auditors, and liquidity providers to build the future of finance.",
    token: "$DEFIB",
    totalTiles: 500,
    tilesSold: 189,
    owners: 78,
    floorPrice: "0.08 ETH",
    category: "DeFi",
    status: "live",
    createdAt: "2026-01-15",
    creatorAddress: "0x5e6f...7a8b",
  },
  {
    id: "gaming-guild",
    name: "Pixel Legends Guild",
    description:
      "A gaming guild space where players own virtual headquarters, coordinate raids, and share loot.",
    token: "$PIXEL",
    totalTiles: 2000,
    tilesSold: 412,
    owners: 156,
    floorPrice: "0.03 ETH",
    category: "Gaming",
    status: "live",
    createdAt: "2026-01-20",
    creatorAddress: "0x9c0d...1e2f",
  },
  {
    id: "creator-collective",
    name: "Creator Collective",
    description:
      "Digital artists, musicians, and content creators sharing a virtual studio space with built-in royalty streams.",
    token: "$CREATE",
    totalTiles: 750,
    tilesSold: 95,
    owners: 41,
    floorPrice: "0.04 ETH",
    category: "Creators",
    status: "launching",
    createdAt: "2026-02-01",
    creatorAddress: "0x3a4b...5c6d",
  },
  {
    id: "eth-berlin",
    name: "ETH Berlin Community",
    description:
      "Berlin's Ethereum community hub — hackathon teams, local meetups, and co-working spaces in one virtual city.",
    token: "$ETHBLN",
    totalTiles: 400,
    tilesSold: 0,
    owners: 0,
    floorPrice: "0.06 ETH",
    category: "Geographic",
    status: "upcoming",
    createdAt: "2026-02-10",
    creatorAddress: "0x7e8f...9a0b",
  },
  {
    id: "ai-research",
    name: "AI Research Collective",
    description:
      "Open-source AI researchers and labs collaborating on frontier models, datasets, and safety research.",
    token: "$AIRC",
    totalTiles: 600,
    tilesSold: 0,
    owners: 0,
    floorPrice: "0.10 ETH",
    category: "Research",
    status: "upcoming",
    createdAt: "2026-02-08",
    creatorAddress: "0xbc1d...2e3f",
  },
];

export const FEATURES = [
  {
    title: "Living Tiles",
    description:
      "NFT properties that own assets, generate yield, earn rental income, and govern themselves autonomously.",
    icon: "Blocks" as const,
  },
  {
    title: "Autonomous Wallets",
    description:
      "Every tile has its own smart wallet — auto-claims rewards, auto-compounds, receives payments 24/7.",
    icon: "Wallet" as const,
  },
  {
    title: "DAO Governance",
    description:
      "Each Space is self-governing. Token holders propose and vote on treasury spending and partnerships.",
    icon: "Vote" as const,
  },
  {
    title: "Rental Marketplace",
    description:
      "Rent out your tiles for passive income. Renters get usage rights; owners keep ownership.",
    icon: "Key" as const,
  },
  {
    title: "AI News Factory",
    description:
      "AI-generated news feed tracking activity, funding rounds, launches, and events in each Space.",
    icon: "Newspaper" as const,
  },
  {
    title: "Atomic Transfers",
    description:
      "Sell a tile and the buyer gets everything — NFT, wallet, assets, income streams — in one transaction.",
    icon: "ArrowRightLeft" as const,
  },
];

export const STATS = [
  { label: "Spaces Created", value: "6" },
  { label: "Tiles Minted", value: "943" },
  { label: "Unique Owners", value: "327" },
  { label: "Total Volume", value: "84.2 ETH" },
];
