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

// ── Marketplace Service ─────────────────────────────────────────────

export type ListingStatus = "active" | "sold" | "cancelled" | "expired";

/** Listing as returned by the marketplace-service API. */
export interface Listing {
  id: string;
  space_id: string;
  token_id: number;
  seller_wallet: string;
  price: string;
  currency: string;
  status: ListingStatus;
  expires_at: string | null;
  sold_at: string | null;
  buyer_wallet: string | null;
  created_at: string;
  updated_at: string;
}

/** Body for POST /listings. */
export interface CreateListingInput {
  spaceId: string;
  tokenId: number;
  price: string;
  currency?: string;
  expiresAt?: string;
}

/** Body for PATCH /listings/:id. */
export interface UpdateListingInput {
  price?: string;
  expiresAt?: string | null;
}

/** Query params for GET /listings. */
export interface ListListingsQuery {
  spaceId?: string;
  status?: ListingStatus;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc";
  limit?: number;
  offset?: number;
}

export type OfferStatus = "pending" | "accepted" | "rejected" | "cancelled" | "expired";

/** Offer as returned by the marketplace-service API. */
export interface Offer {
  id: string;
  listing_id: string;
  space_id: string;
  token_id: number;
  offerer_wallet: string;
  amount: string;
  currency: string;
  status: OfferStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

/** Body for POST /offers. */
export interface CreateOfferInput {
  listingId: string;
  amount: string;
  currency?: string;
  expiresAt: string;
}

/** Query params for GET /offers. */
export interface ListOffersQuery {
  listingId?: string;
  status?: OfferStatus;
  offerer?: string;
}
