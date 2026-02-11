"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
    }
  }, [ready, authenticated, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Agora.fi</h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Decentralized finance, simplified. Connect your wallet to get started.
        </p>
      </div>
      <Button size="lg" onClick={login} disabled={!ready}>
        {!ready ? "Loading..." : "Login"}
      </Button>
    </div>
  );
}
