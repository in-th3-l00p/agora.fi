"use client";

import { usePrivy } from "@privy-io/react-auth";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function DashboardContent() {
  const { user, logout } = usePrivy();

  const walletAddress = user?.wallet?.address;
  const email = user?.email?.address;
  const userId = user?.id;
  const linkedAccounts = user?.linkedAccounts ?? [];

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-4 py-16">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {walletAddress ? walletAddress.slice(2, 4).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>User Profile</CardTitle>
              <p className="text-sm text-muted-foreground">{userId}</p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {walletAddress && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Wallet Address
                </p>
                <p className="font-mono text-sm break-all">{walletAddress}</p>
              </div>
            )}
            {email && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-sm">{email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {linkedAccounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Linked Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {linkedAccounts.map((account, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border px-4 py-2 text-sm"
                  >
                    <span className="font-medium capitalize">
                      {account.type}
                    </span>
                    <span className="text-muted-foreground">
                      {"address" in account
                        ? account.address
                        : "email" in account
                          ? account.email
                          : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
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
