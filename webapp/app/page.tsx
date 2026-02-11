"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FEATURES } from "@/lib/mock-data";
import { useWeb3, useSpaceFactory, useTile } from "@agora.fi/web3/react";
import type { SpaceInfo } from "@agora.fi/web3";
import { AGORA_TILE_ADDRESS, SPACE_FACTORY_ADDRESS } from "@/lib/addresses";
import {
  Blocks,
  Wallet,
  Vote,
  Key,
  Newspaper,
  ArrowRightLeft,
  Users,
  TrendingUp,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

const iconMap = {
  Blocks,
  Wallet,
  Vote,
  Key,
  Newspaper,
  ArrowRightLeft,
} as const;

interface OnChainSpace {
  spaceId: bigint;
  info: SpaceInfo;
}

export default function Home() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();
  const { spaceCount, spaceIdByIndex, getSpaceInfo } = useSpaceFactory(SPACE_FACTORY_ADDRESS);
  const { totalSupply: tileTotalSupply } = useTile(AGORA_TILE_ADDRESS);
  const { address } = useWeb3();

  const [spaces, setSpaces] = useState<OnChainSpace[]>([]);
  const [stats, setStats] = useState({ spaces: "0", tiles: "0" });

  const fetchData = useCallback(async () => {
    try {
      const count = await spaceCount();
      const fetched: OnChainSpace[] = [];
      for (let i = 0n; i < count; i++) {
        const id = await spaceIdByIndex(i);
        const info = await getSpaceInfo(id);
        fetched.push({ spaceId: id, info });
      }
      setSpaces(fetched);

      const tiles = await tileTotalSupply();
      setStats({ spaces: count.toString(), tiles: tiles.toString() });
    } catch {
      // Contracts not deployed yet
    }
  }, [spaceCount, spaceIdByIndex, getSpaceInfo, tileTotalSupply]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
    }
  }, [ready, authenticated, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-wider text-cyan">
              AGORAFI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#spaces"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Spaces
            </a>
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <Button onClick={login} disabled={!ready} size="sm">
              {!ready ? "Loading..." : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        {/* Background grid effect */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-cyan/5 blur-[120px]" />
          <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-magenta/5 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 text-center">
          <Badge variant="outline" className="border-cyan/30 text-cyan">
            Decentralized Community Economies
          </Badge>

          <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
            Where Communities
            <br />
            <span className="text-cyan">Build Economies</span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            AGORAFI is a decentralized platform for creating autonomous virtual
            spaces. Own Living Tiles — NFT properties that earn yield, collect
            rent, and govern themselves 24/7.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={login}
              disabled={!ready}
              className="px-8 text-base"
            >
              {!ready ? "Loading..." : "Launch App"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#spaces">Explore Spaces</a>
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-cyan sm:text-3xl">
                {stats.spaces}
              </span>
              <span className="text-sm text-muted-foreground">
                Spaces Created
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-cyan sm:text-3xl">
                {stats.tiles}
              </span>
              <span className="text-sm text-muted-foreground">
                Tiles Minted
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-cyan sm:text-3xl">
                {address ? "Connected" : "---"}
              </span>
              <span className="text-sm text-muted-foreground">
                Wallet Status
              </span>
            </div>
          </div>
        </div>

        <a
          href="#spaces"
          className="absolute bottom-8 animate-bounce text-muted-foreground"
        >
          <ChevronDown className="h-6 w-6" />
        </a>
      </section>

      {/* Spaces Section */}
      <section id="spaces" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4 border-magenta/30 text-magenta">
              Community Spaces
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Explore Active Spaces
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover autonomous communities building their own economies on
              AGORAFI.
            </p>
          </div>

          {spaces.length === 0 ? (
            <Card className="border-border/50 bg-card/50 border-dashed">
              <CardContent className="flex flex-col items-center py-16">
                <CardTitle className="mb-2 text-lg">
                  No Spaces Yet
                </CardTitle>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Connect your wallet and create the first Space on the platform.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {spaces.map((space) => {
                const tokenShort = `${space.info.token.slice(0, 6)}...${space.info.token.slice(-4)}`;
                const creatorShort = `${space.info.creator.slice(0, 6)}...${space.info.creator.slice(-4)}`;
                return (
                  <Card
                    key={space.spaceId.toString()}
                    className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-cyan/30 hover:shadow-[0_0_30px_rgba(0,240,255,0.08)]"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Space #{space.spaceId.toString()}
                          </CardTitle>
                          <span className="text-sm text-cyan font-mono">
                            {tokenShort}
                          </span>
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4 border-cyan/30 text-cyan">
              Platform Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Living Tiles, Living Economies
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Not just NFTs — autonomous economic entities that work for you
              around the clock.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = iconMap[feature.icon];
              return (
                <Card
                  key={feature.title}
                  className="border-border/50 bg-card/50 backdrop-blur-sm"
                >
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10">
                      <Icon className="h-5 w-5 text-cyan" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Makes It Different
            </h2>
          </div>
          <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 text-sm">
                <div className="border-b border-r border-border/50 bg-muted/30 p-4 font-medium">
                  Traditional NFT Platforms
                </div>
                <div className="border-b border-border/50 bg-cyan/5 p-4 font-medium text-cyan">
                  AGORAFI
                </div>
                {[
                  [
                    "NFTs are static collectibles",
                    "Tiles are autonomous economic entities",
                  ],
                  [
                    "Value comes only from resale",
                    "Value from yield, rent, royalties & governance",
                  ],
                  [
                    "Communities live on Discord",
                    "Communities own governed virtual spaces",
                  ],
                  [
                    "Revenue goes to platform",
                    "Revenue goes to tile owners & community DAO",
                  ],
                  [
                    "No built-in governance",
                    "Full on-chain DAO governance per Space",
                  ],
                ].map(([left, right], i) => (
                  <div key={i} className="contents">
                    <div className="border-b border-r border-border/50 p-4 text-muted-foreground">
                      {left}
                    </div>
                    <div className="border-b border-border/50 p-4">{right}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Your Space. Your Economy.{" "}
            <span className="text-cyan">Your Rules.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Connect your wallet to create your own Space or explore existing
            communities.
          </p>
          <Button
            size="lg"
            onClick={login}
            disabled={!ready}
            className="mt-8 px-8 text-base"
          >
            {!ready ? "Loading..." : "Get Started"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm font-bold tracking-wider text-cyan">
            AGORAFI
          </span>
          <p className="text-sm text-muted-foreground">
            Where Communities Build Economies
          </p>
        </div>
      </footer>
    </div>
  );
}
