-- Tile listings
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id VARCHAR(100) NOT NULL,
  token_id INTEGER NOT NULL,
  seller_wallet VARCHAR(42) NOT NULL,
  price NUMERIC(30, 18) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'ETH',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  buyer_wallet VARCHAR(42),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Offers on listings
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  space_id VARCHAR(100) NOT NULL,
  token_id INTEGER NOT NULL,
  offerer_wallet VARCHAR(42) NOT NULL,
  amount NUMERIC(30, 18) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'ETH',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auth nonces for wallet signing
CREATE TABLE IF NOT EXISTS auth_nonces (
  address VARCHAR(42) PRIMARY KEY,
  nonce VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_listings_space_id ON listings(space_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_wallet);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_space_token ON listings(space_id, token_id);
CREATE INDEX IF NOT EXISTS idx_offers_listing ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_offerer ON offers(offerer_wallet);
CREATE INDEX IF NOT EXISTS idx_offers_space_token ON offers(space_id, token_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
