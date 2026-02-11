import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HUD() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <div className="pointer-events-auto flex items-center gap-3">
          <h1 className="text-xl font-bold text-cyan">AGORA.FI</h1>
          <Badge variant="outline" className="border-cyan/30 text-cyan">
            Tilemap
          </Badge>
        </div>
        <div className="pointer-events-auto">
          <Button size="sm" variant="outline" className="border-cyan/30 text-cyan hover:bg-cyan/10">
            Connect Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}
