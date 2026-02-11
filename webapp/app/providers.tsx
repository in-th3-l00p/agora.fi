"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { Web3Provider } from "@/lib/web3/Web3Provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: "dark",
        },
      }}
    >
      <Web3Provider>{children}</Web3Provider>
    </PrivyProvider>
  );
}
