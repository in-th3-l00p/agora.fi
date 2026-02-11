"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { Web3Provider } from "@/components/Web3Provider";
import { BackendProvider } from "@/components/BackendProvider";

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
      <Web3Provider>
        <BackendProvider>{children}</BackendProvider>
      </Web3Provider>
    </PrivyProvider>
  );
}
