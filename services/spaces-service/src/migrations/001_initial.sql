-- Spaces
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_wallet VARCHAR(42) NOT NULL,
  max_tiles INTEGER NOT NULL DEFAULT 100,
  token_name VARCHAR(100),
  token_symbol VARCHAR(20),
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tile index
CREATE TABLE IF NOT EXISTS tiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  token_id INTEGER NOT NULL,
  grid_position INTEGER NOT NULL,
  owner_wallet VARCHAR(42),
  tier INTEGER NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(space_id, token_id),
  UNIQUE(space_id, grid_position)
);

-- Auth nonces for wallet signing
CREATE TABLE IF NOT EXISTS auth_nonces (
  address VARCHAR(42) PRIMARY KEY,
  nonce VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tiles_space_id ON tiles(space_id);
CREATE INDEX IF NOT EXISTS idx_tiles_owner_wallet ON tiles(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_spaces_owner_wallet ON spaces(owner_wallet);
