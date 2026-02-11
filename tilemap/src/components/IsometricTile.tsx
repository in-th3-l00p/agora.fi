import { useCallback, useState } from "react";
import type { Graphics } from "pixi.js";
import { TILE_WIDTH, TILE_HEIGHT } from "@/lib/isometric";

interface IsometricTileProps {
  x: number;
  y: number;
  fillColor: number;
  strokeColor?: number;
}

export function IsometricTile({
  x,
  y,
  fillColor,
  strokeColor = 0x00f0ff,
}: IsometricTileProps) {
  const [hovered, setHovered] = useState(false);

  const draw = useCallback(
    (g: Graphics) => {
      const hw = TILE_WIDTH / 2;
      const hh = TILE_HEIGHT / 2;

      g.clear();

      // Fill
      g.poly([0, -hh, hw, 0, 0, hh, -hw, 0]);
      g.fill({ color: hovered ? 0x2a2a4a : fillColor, alpha: hovered ? 0.9 : 0.6 });

      // Stroke
      g.poly([0, -hh, hw, 0, 0, hh, -hw, 0]);
      g.stroke({ color: strokeColor, width: hovered ? 2 : 1, alpha: hovered ? 1 : 0.5 });
    },
    [fillColor, strokeColor, hovered],
  );

  return (
    <pixiGraphics
      x={x}
      y={y}
      draw={draw}
      eventMode="static"
      cursor="pointer"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    />
  );
}
