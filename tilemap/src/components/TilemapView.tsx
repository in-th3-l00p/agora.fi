import { useRef } from "react";
import { Application } from "@pixi/react";
import { IsometricGrid } from "./IsometricGrid";
import type { TileData } from "@/lib/mock-data";

interface TilemapViewProps {
  tiles: TileData[];
}

export function TilemapView({ tiles }: TilemapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null!);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Application background={0x0a0a0f} resizeTo={containerRef}>
        <IsometricGrid tiles={tiles} />
      </Application>
    </div>
  );
}
