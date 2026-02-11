/** Space as returned by the spaces-service API. */
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

/** Body for POST /spaces. */
export interface CreateSpaceInput {
  spaceId: string;
  name: string;
  description?: string;
  maxTiles?: number;
  tokenName?: string;
  tokenSymbol?: string;
  settings?: Record<string, unknown>;
}

/** Body for PUT /spaces/:spaceId. */
export interface UpdateSpaceInput {
  name?: string;
  description?: string;
  maxTiles?: number;
  tokenName?: string;
  tokenSymbol?: string;
  settings?: Record<string, unknown>;
}

/** Tile as returned by the spaces-service API. */
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

/** Body for POST /spaces/:spaceId/tiles. */
export interface CreateTileInput {
  tokenId: number;
  gridPosition: number;
  ownerWallet?: string;
  tier?: number;
  metadata?: Record<string, unknown>;
}

/** Body for PUT /spaces/:spaceId/tiles/:tokenId. */
export interface UpdateTileInput {
  ownerWallet?: string;
  tier?: number;
  metadata?: Record<string, unknown>;
}

/** Response from GET /auth/nonce. */
export interface NonceResponse {
  nonce: string;
}

/** Response from POST /auth/verify. */
export interface VerifyResponse {
  token: string;
}

/** Standard API error shape. */
export interface ApiError {
  error: string;
  details?: unknown;
}
