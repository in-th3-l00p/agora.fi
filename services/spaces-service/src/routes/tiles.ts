import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authRequired } from '../middleware/auth';
import { broadcast } from '../ws';
import { AuthRequest } from '../types';

const router = Router();

const createTileSchema = z.object({
  tokenId: z.number().int().min(0),
  gridPosition: z.number().int().min(0),
  ownerWallet: z.string().max(42).optional(),
  tier: z.number().int().min(1).max(5).default(1),
  metadata: z.record(z.unknown()).default({}),
});

const updateTileSchema = z.object({
  ownerWallet: z.string().max(42).optional(),
  tier: z.number().int().min(1).max(5).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Helper: resolve space internal ID and verify ownership
async function resolveSpace(spaceId: string, wallet?: string) {
  const result = await pool.query(
    'SELECT id, owner_wallet FROM spaces WHERE space_id = $1',
    [spaceId],
  );

  if (result.rows.length === 0) return { error: 'Space not found', status: 404 };

  const space = result.rows[0];
  if (wallet && space.owner_wallet !== wallet) {
    return { error: 'Only the space owner can manage tiles', status: 403 };
  }

  return { spaceUuid: space.id as string };
}

// GET /spaces/:spaceId/tiles — list all tiles in a space
router.get('/:spaceId/tiles', async (req, res, next) => {
  try {
    const space = await resolveSpace(req.params.spaceId);
    if ('error' in space) { res.status(space.status).json({ error: space.error }); return; }

    const result = await pool.query(
      'SELECT * FROM tiles WHERE space_id = $1 ORDER BY grid_position ASC',
      [space.spaceUuid],
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /spaces/:spaceId/tiles/:tokenId — get a single tile
router.get('/:spaceId/tiles/:tokenId', async (req, res, next) => {
  try {
    const space = await resolveSpace(req.params.spaceId);
    if ('error' in space) { res.status(space.status).json({ error: space.error }); return; }

    const result = await pool.query(
      'SELECT * FROM tiles WHERE space_id = $1 AND token_id = $2',
      [space.spaceUuid, parseInt(req.params.tokenId, 10)],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tile not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /spaces/:spaceId/tiles — add a tile to the index (auth required, space owner)
router.post(
  '/:spaceId/tiles',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const space = await resolveSpace(req.params.spaceId, req.wallet);
      if ('error' in space) { res.status(space.status).json({ error: space.error }); return; }

      const parsed = createTileSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        return;
      }

      const { tokenId, gridPosition, ownerWallet, tier, metadata } = parsed.data;

      // Check tile count against max_tiles
      const countResult = await pool.query(
        'SELECT COUNT(*)::int AS count, s.max_tiles FROM tiles t RIGHT JOIN spaces s ON s.id = t.space_id WHERE s.id = $1 GROUP BY s.max_tiles',
        [space.spaceUuid],
      );

      if (countResult.rows.length > 0 && countResult.rows[0].count >= countResult.rows[0].max_tiles) {
        res.status(409).json({ error: 'Space has reached its maximum tile count' });
        return;
      }

      const result = await pool.query(
        `INSERT INTO tiles (space_id, token_id, grid_position, owner_wallet, tier, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [space.spaceUuid, tokenId, gridPosition, ownerWallet || null, tier, JSON.stringify(metadata)],
      );

      const tile = result.rows[0];
      broadcast('tile:created', tile, req.params.spaceId);
      res.status(201).json(tile);
    } catch (err: any) {
      if (err.code === '23505') {
        res.status(409).json({ error: 'A tile with this token_id or grid_position already exists in this space' });
        return;
      }
      next(err);
    }
  },
);

// PUT /spaces/:spaceId/tiles/:tokenId — update a tile (auth required, space owner)
router.put(
  '/:spaceId/tiles/:tokenId',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const space = await resolveSpace(req.params.spaceId, req.wallet);
      if ('error' in space) { res.status(space.status).json({ error: space.error }); return; }

      const parsed = updateTileSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        return;
      }

      const data = parsed.data;
      const sets: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (data.ownerWallet !== undefined) { sets.push(`owner_wallet = $${idx++}`); values.push(data.ownerWallet); }
      if (data.tier !== undefined) { sets.push(`tier = $${idx++}`); values.push(data.tier); }
      if (data.metadata !== undefined) { sets.push(`metadata = $${idx++}`); values.push(JSON.stringify(data.metadata)); }

      if (sets.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      sets.push(`updated_at = NOW()`);
      values.push(space.spaceUuid, parseInt(req.params.tokenId, 10));

      const result = await pool.query(
        `UPDATE tiles SET ${sets.join(', ')} WHERE space_id = $${idx++} AND token_id = $${idx} RETURNING *`,
        values,
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Tile not found' });
        return;
      }

      const tile = result.rows[0];
      broadcast('tile:updated', tile, req.params.spaceId);
      res.json(tile);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /spaces/:spaceId/tiles/:tokenId — remove a tile from the index (auth required, space owner)
router.delete(
  '/:spaceId/tiles/:tokenId',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const space = await resolveSpace(req.params.spaceId, req.wallet);
      if ('error' in space) { res.status(space.status).json({ error: space.error }); return; }

      const result = await pool.query(
        'DELETE FROM tiles WHERE space_id = $1 AND token_id = $2 RETURNING *',
        [space.spaceUuid, parseInt(req.params.tokenId, 10)],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Tile not found' });
        return;
      }

      broadcast('tile:deleted', { spaceId: req.params.spaceId, tokenId: req.params.tokenId });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;
