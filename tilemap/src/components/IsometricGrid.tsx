import { useMemo } from "react";
import { IsometricTile } from "./IsometricTile";
import { gridToScreen } from "@/lib/isometric";
import { useScreenSize } from "@/hooks/useScreenSize";
import type { TileData } from "@/lib/mock-data";

interface IsometricGridProps {
  tiles: TileData[];
}

export function IsometricGrid({ tiles }: IsometricGridProps) {
  const { width, height } = useScreenSize();

  const renderedTiles = useMemo(
    () =>
      tiles.map((tile) => {
        const { x, y } = gridToScreen(tile.col, tile.row);
        return (
          <IsometricTile
            key={`${tile.col}-${tile.row}`}
            x={x}
            y={y}
            fillColor={tile.color}
          />
        );
      }),
    [tiles],
  );

  return (
    <pixiContainer x={width / 2} y={height / 2}>
      {renderedTiles}
    </pixiContainer>
  );
}
