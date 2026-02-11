"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { parseEther, formatEther, type Address } from "viem";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeb3, useSpaceFactory, useTile } from "@agora.fi/web3/react";
import type { SpaceInfo, TokenAllocation } from "@agora.fi/web3";
import { AGORA_TILE_ADDRESS, SPACE_FACTORY_ADDRESS } from "@/lib/addresses";
import {
  Plus,
  Grid3X3,
  Users,
  TrendingUp,
  LogOut,
  Wallet,
  LayoutDashboard,
  Globe,
  Settings,
  Eye,
  Loader2,
} from "lucide-react";

interface OnChainSpace {
  spaceId: bigint;
  info: SpaceInfo;
}

function CreateSpaceDialog({ onCreated }: { onCreated: () => void }) {
  const { address } = useWeb3();
  const { createSpace } = useSpaceFactory(SPACE_FACTORY_ADDRESS);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [mintPrice, setMintPrice] = useState("0.05");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name || !symbol || !address) return;
    setLoading(true);
    setError("");

    try {
      const spaceId = BigInt(Date.now());
      const alloc: TokenAllocation = {
        treasury: address,
        team: address,
        stakingRewards: address,
        liquidityPool: address,
        earlySupporters: address,
        platformReserve: address,
      };

      await createSpace(
        spaceId,
        name,
        symbol.toUpperCase(),
        parseEther(mintPrice || "0"),
        0n,
        alloc,
      );

      setOpen(false);
      setName("");
      setSymbol("");
      setDescription("");
      setMintPrice("0.05");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Space
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a New Space</DialogTitle>
          <DialogDescription>
            Launch an autonomous community space on AGORAFI. This will deploy a
            governance token and register the space on-chain.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="space-name">Space Name / Token Name</Label>
            <Input
              id="space-name"
              placeholder="e.g. Romanian Tech Space Token"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="token-symbol">Token Symbol</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                id="token-symbol"
                placeholder="e.g. ROTECH"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="uppercase"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description (off-chain)</Label>
            <Textarea
              id="description"
              placeholder="Describe your community..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="mint-price">Tile Mint Price (ETH)</Label>
            <Input
              id="mint-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.05"
              value={mintPrice}
              onChange={(e) => setMintPrice(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name || !symbol || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creating..." : "Create Space"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SpaceCard({ space }: { space: OnChainSpace }) {
  const tokenShort = space.info.token
    ? `${space.info.token.slice(0, 6)}...${space.info.token.slice(-4)}`
    : "—";
  const creatorShort = space.info.creator
    ? `${space.info.creator.slice(0, 6)}...${space.info.creator.slice(-4)}`
    : "—";

  return (
    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-cyan/30 hover:shadow-[0_0_30px_rgba(0,240,255,0.08)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              Space #{space.spaceId.toString()}
            </CardTitle>
            <span className="text-sm text-cyan font-mono">{tokenShort}</span>
          </div>
          <Badge className="bg-matrix/20 text-matrix border-matrix/30">
            On-chain
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="mb-4" />
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-matrix" />
              {formatEther(space.info.mintPrice)} ETH
            </div>
            <p className="text-xs text-muted-foreground">Mint Price</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              <Users className="h-3.5 w-3.5 text-magenta" />
              {creatorShort}
            </div>
            <p className="text-xs text-muted-foreground">Creator</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon-xs">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-xs">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { user, logout } = usePrivy();
  const { address } = useWeb3();
  const { spaceCount, spaceIdByIndex, getSpaceInfo } = useSpaceFactory(SPACE_FACTORY_ADDRESS);
  const { totalSupply: tileTotalSupply } = useTile(AGORA_TILE_ADDRESS);

  const [allSpaces, setAllSpaces] = useState<OnChainSpace[]>([]);
  const [totalTiles, setTotalTiles] = useState(0n);
  const [loading, setLoading] = useState(true);

  const walletAddress = user?.wallet?.address;
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const count = await spaceCount();
      const spaces: OnChainSpace[] = [];
      for (let i = 0n; i < count; i++) {
        const id = await spaceIdByIndex(i);
        const info = await getSpaceInfo(id);
        spaces.push({ spaceId: id, info });
      }
      setAllSpaces(spaces);

      const tiles = await tileTotalSupply();
      setTotalTiles(tiles);
    } catch {
      // Contract not deployed or no spaces yet — that's fine
    } finally {
      setLoading(false);
    }
  }, [spaceCount, spaceIdByIndex, getSpaceInfo, tileTotalSupply]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const mySpaces = allSpaces.filter(
    (s) => address && s.info.creator.toLowerCase() === address.toLowerCase(),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <a href="/" className="text-xl font-bold tracking-wider text-cyan">
            AGORAFI
          </a>
          <div className="flex items-center gap-3">
            {walletAddress && (
              <Badge variant="outline" className="gap-1.5 font-mono text-xs">
                <Wallet className="h-3 w-3" />
                {shortAddress}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your Spaces and community economies.
            </p>
          </div>
          <CreateSpaceDialog onCreated={fetchSpaces} />
        </div>

        {/* Overview stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center py-6">
              <LayoutDashboard className="mb-2 h-5 w-5 text-cyan" />
              <span className="text-2xl font-bold">{mySpaces.length}</span>
              <span className="text-xs text-muted-foreground">My Spaces</span>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center py-6">
              <Grid3X3 className="mb-2 h-5 w-5 text-magenta" />
              <span className="text-2xl font-bold">
                {totalTiles.toString()}
              </span>
              <span className="text-xs text-muted-foreground">Total Tiles</span>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center py-6">
              <Globe className="mb-2 h-5 w-5 text-matrix" />
              <span className="text-2xl font-bold">{allSpaces.length}</span>
              <span className="text-xs text-muted-foreground">
                Platform Spaces
              </span>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center py-6">
              <TrendingUp className="mb-2 h-5 w-5 text-quantum" />
              <span className="text-2xl font-bold">0 ETH</span>
              <span className="text-xs text-muted-foreground">
                Total Volume
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-spaces">
          <TabsList className="mb-6">
            <TabsTrigger value="my-spaces">My Spaces</TabsTrigger>
            <TabsTrigger value="explore">Explore All</TabsTrigger>
          </TabsList>

          {/* My Spaces tab */}
          <TabsContent value="my-spaces">
            {loading ? (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="flex flex-col items-center py-16">
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-cyan" />
                  <CardDescription>Loading spaces from chain...</CardDescription>
                </CardContent>
              </Card>
            ) : mySpaces.length === 0 ? (
              <Card className="border-border/50 bg-card/50 border-dashed">
                <CardContent className="flex flex-col items-center py-16">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan/10">
                    <Plus className="h-8 w-8 text-cyan" />
                  </div>
                  <CardTitle className="mb-2 text-lg">
                    No Spaces Yet
                  </CardTitle>
                  <CardDescription className="mb-6 text-center max-w-sm">
                    Create your first Space to launch an autonomous community
                    with its own economy, governance, and tile grid.
                  </CardDescription>
                  <CreateSpaceDialog onCreated={fetchSpaces} />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mySpaces.map((space) => (
                  <SpaceCard key={space.spaceId.toString()} space={space} />
                ))}
                <Card className="flex items-center justify-center border-dashed border-border/50 bg-card/30 min-h-[240px] transition-all hover:border-cyan/30">
                  <CardContent className="flex flex-col items-center py-8">
                    <CreateSpaceDialog onCreated={fetchSpaces} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Explore tab */}
          <TabsContent value="explore">
            {loading ? (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="flex flex-col items-center py-16">
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-cyan" />
                  <CardDescription>Loading spaces from chain...</CardDescription>
                </CardContent>
              </Card>
            ) : allSpaces.length === 0 ? (
              <Card className="border-border/50 bg-card/50 border-dashed">
                <CardContent className="flex flex-col items-center py-16">
                  <CardTitle className="mb-2 text-lg">
                    No Spaces Yet
                  </CardTitle>
                  <CardDescription className="text-center max-w-sm">
                    Be the first to create a Space on the platform.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allSpaces.map((space) => (
                  <SpaceCard key={space.spaceId.toString()} space={space} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
