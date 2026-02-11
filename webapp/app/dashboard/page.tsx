"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLATFORM_SPACES, type Space } from "@/lib/mock-data";
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
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "live")
    return (
      <Badge className="bg-matrix/20 text-matrix border-matrix/30">Live</Badge>
    );
  if (status === "launching")
    return (
      <Badge className="bg-laser/20 text-laser border-laser/30">
        Launching
      </Badge>
    );
  return (
    <Badge className="bg-quantum/20 text-quantum border-quantum/30">
      Upcoming
    </Badge>
  );
}

const CATEGORIES = [
  "Startup Ecosystem",
  "DeFi",
  "Gaming",
  "Creators",
  "Geographic",
  "Research",
  "DAO",
  "Education",
];

const GRID_SIZES = [
  { label: "Small (10x10 — 100 tiles)", value: "100" },
  { label: "Medium (20x20 — 400 tiles)", value: "400" },
  { label: "Large (30x30 — 900 tiles)", value: "900" },
  { label: "XL (50x50 — 2,500 tiles)", value: "2500" },
];

function CreateSpaceDialog({
  onCreateSpace,
}: {
  onCreateSpace: (space: Space) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [gridSize, setGridSize] = useState("");

  const handleCreate = () => {
    if (!name || !token || !description || !category || !gridSize) return;

    const newSpace: Space = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      token: `$${token.toUpperCase().replace(/[^A-Z]/g, "")}`,
      description,
      totalTiles: parseInt(gridSize),
      tilesSold: 0,
      owners: 0,
      floorPrice: "0.05 ETH",
      category,
      status: "upcoming",
      createdAt: new Date().toISOString().split("T")[0],
      creatorAddress: "0x...",
    };

    onCreateSpace(newSpace);
    setOpen(false);
    setName("");
    setToken("");
    setDescription("");
    setCategory("");
    setGridSize("");
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
            Launch an autonomous community space on AGORAFI. Configure your grid,
            token, and community details.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="space-name">Space Name</Label>
            <Input
              id="space-name"
              placeholder="e.g. Romanian Tech Space"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="token-symbol">Governance Token Symbol</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                id="token-symbol"
                placeholder="e.g. ROTECH"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="uppercase"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your community and what this Space is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Grid Size</Label>
              <Select value={gridSize} onValueChange={setGridSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {GRID_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name || !token || !description || !category || !gridSize}
          >
            Create Space
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SpaceCard({ space }: { space: Space }) {
  return (
    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-cyan/30 hover:shadow-[0_0_30px_rgba(0,240,255,0.08)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{space.name}</CardTitle>
            <span className="text-sm text-cyan font-mono">{space.token}</span>
          </div>
          <StatusBadge status={space.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {space.description}
        </p>
        <Separator className="mb-4" />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              <Grid3X3 className="h-3.5 w-3.5 text-cyan" />
              {space.tilesSold}/{space.totalTiles}
            </div>
            <p className="text-xs text-muted-foreground">Tiles</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              <Users className="h-3.5 w-3.5 text-magenta" />
              {space.owners}
            </div>
            <p className="text-xs text-muted-foreground">Owners</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-matrix" />
              {space.floorPrice}
            </div>
            <p className="text-xs text-muted-foreground">Floor</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Badge
            variant="outline"
            className="text-xs border-border/50 text-muted-foreground"
          >
            {space.category}
          </Badge>
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
  const [mySpaces, setMySpaces] = useState<Space[]>([]);

  const walletAddress = user?.wallet?.address;
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  const handleCreateSpace = (space: Space) => {
    setMySpaces((prev) => [...prev, space]);
  };

  const totalOwned = mySpaces.length;
  const totalTiles = mySpaces.reduce((sum, s) => sum + s.totalTiles, 0);

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

      {/* Main content — centered */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your Spaces and community economies.
            </p>
          </div>
          <CreateSpaceDialog onCreateSpace={handleCreateSpace} />
        </div>

        {/* Overview stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center py-6">
              <LayoutDashboard className="mb-2 h-5 w-5 text-cyan" />
              <span className="text-2xl font-bold">{totalOwned}</span>
              <span className="text-xs text-muted-foreground">My Spaces</span>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center py-6">
              <Grid3X3 className="mb-2 h-5 w-5 text-magenta" />
              <span className="text-2xl font-bold">{totalTiles}</span>
              <span className="text-xs text-muted-foreground">Total Tiles</span>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center py-6">
              <Globe className="mb-2 h-5 w-5 text-matrix" />
              <span className="text-2xl font-bold">
                {PLATFORM_SPACES.length}
              </span>
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
            {mySpaces.length === 0 ? (
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
                  <CreateSpaceDialog onCreateSpace={handleCreateSpace} />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mySpaces.map((space) => (
                  <SpaceCard key={space.id} space={space} />
                ))}
                {/* Create new card */}
                <Card className="flex items-center justify-center border-dashed border-border/50 bg-card/30 min-h-[240px] transition-all hover:border-cyan/30">
                  <CardContent className="flex flex-col items-center py-8">
                    <CreateSpaceDialog onCreateSpace={handleCreateSpace} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Explore tab */}
          <TabsContent value="explore">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PLATFORM_SPACES.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>
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
