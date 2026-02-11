import { Request } from 'express';

export interface AuthRequest extends Request {
  wallet?: string;
}

export interface Space {
  id: string;
  space_id: string;
  name: string;
  description: string | null;
  owner_wallet: string;
  max_tiles: number;
  token_name: string | null;
  token_symbol: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  tile_count?: number;
}

export interface Tile {
  id: string;
  space_id: string;
  token_id: number;
  grid_position: number;
  owner_wallet: string | null;
  tier: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
