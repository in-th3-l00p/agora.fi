export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

/** Convert grid coordinates to screen (pixel) coordinates. */
export function gridToScreen(col: number, row: number) {
  return {
    x: (col - row) * (TILE_WIDTH / 2),
    y: (col + row) * (TILE_HEIGHT / 2),
  };
}

/** Convert screen coordinates back to grid coordinates. */
export function screenToGrid(screenX: number, screenY: number) {
  return {
    col: Math.round(screenX / TILE_WIDTH + screenY / TILE_HEIGHT),
    row: Math.round(screenY / TILE_HEIGHT - screenX / TILE_WIDTH),
  };
}
