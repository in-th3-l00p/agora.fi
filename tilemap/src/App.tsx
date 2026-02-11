import { useMemo } from "react";
import { TilemapView } from "@/components/TilemapView";
import { HUD } from "@/components/HUD";
import { generateMockGrid } from "@/lib/mock-data";

export default function App() {
  const tiles = useMemo(() => generateMockGrid(), []);

  return (
    <div className="relative w-screen h-screen bg-void">
      <TilemapView tiles={tiles} />
      <HUD />
    </div>
  );
}
