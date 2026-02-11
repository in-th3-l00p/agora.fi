export type TileState = "empty" | "owned" | "listed" | "active";

export interface TileData {
  col: number;
  row: number;
  state: TileState;
  color: number;
}

const STATE_COLORS: Record<TileState, number> = {
  empty: 0x0a0a1a,
  owned: 0x1a0b2e,
  listed: 0x00f0ff,
  active: 0x00ff88,
};

const STATES: TileState[] = ["empty", "owned", "listed", "active"];
const WEIGHTS = [0.5, 0.25, 0.15, 0.1]; // probability weights

function weightedRandom(): TileState {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < STATES.length; i++) {
    cumulative += WEIGHTS[i];
    if (r < cumulative) return STATES[i];
  }
  return "empty";
}

export const GRID_SIZE = 10;

export function generateMockGrid(): TileData[] {
  const tiles: TileData[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const state = weightedRandom();
      tiles.push({
        col,
        row,
        state,
        color: STATE_COLORS[state],
      });
    }
  }
  return tiles;
}
