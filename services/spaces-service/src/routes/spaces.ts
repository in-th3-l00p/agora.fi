import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authRequired } from '../middleware/auth';
import { broadcast } from '../ws';
import { AuthRequest } from '../types';

const router = Router();

const createSpaceSchema = z.object({
  spaceId: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  maxTiles: z.number().int().min(1).max(10000).default(100),
  tokenName: z.string().max(100).optional(),
  tokenSymbol: z.string().max(20).optional(),
  settings: z.record(z.unknown()).default({}),
});

const updateSpaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  maxTiles: z.number().int().min(1).max(10000).optional(),
  tokenName: z.string().max(100).optional(),
  tokenSymbol: z.string().max(20).optional(),
  settings: z.record(z.unknown()).optional(),
});

// GET /spaces — list all spaces
router.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT s.*, COUNT(t.id)::int AS tile_count
       FROM spaces s
       LEFT JOIN tiles t ON t.space_id = s.id
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /spaces/:spaceId — get a single space
router.get('/:spaceId', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT s.*, COUNT(t.id)::int AS tile_count
       FROM spaces s
       LEFT JOIN tiles t ON t.space_id = s.id
       WHERE s.space_id = $1
       GROUP BY s.id`,
      [req.params.spaceId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Space not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /spaces — create a space (auth required)
router.post(
  '/',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = createSpaceSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        return;
      }

      const { spaceId, name, description, maxTiles, tokenName, tokenSymbol, settings } = parsed.data;

      const result = await pool.query(
        `INSERT INTO spaces (space_id, name, description, owner_wallet, max_tiles, token_name, token_symbol, settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [spaceId, name, description || null, req.wallet, maxTiles, tokenName || null, tokenSymbol || null, JSON.stringify(settings)],
      );

      const space = result.rows[0];
      broadcast('space:created', space);
      res.status(201).json(space);
    } catch (err: any) {
      if (err.code === '23505') {
        res.status(409).json({ error: 'A space with this ID already exists' });
        return;
      }
      next(err);
    }
  },
);

// PUT /spaces/:spaceId — update a space (auth required, owner only)
router.put(
  '/:spaceId',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = updateSpaceSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        return;
      }

      // Check ownership
      const existing = await pool.query(
        'SELECT id, owner_wallet FROM spaces WHERE space_id = $1',
        [req.params.spaceId],
      );

      if (existing.rows.length === 0) {
        res.status(404).json({ error: 'Space not found' });
        return;
      }

      if (existing.rows[0].owner_wallet !== req.wallet) {
        res.status(403).json({ error: 'Only the space owner can update this space' });
        return;
      }

      const data = parsed.data;
      const sets: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (data.name !== undefined) { sets.push(`name = $${idx++}`); values.push(data.name); }
      if (data.description !== undefined) { sets.push(`description = $${idx++}`); values.push(data.description); }
      if (data.maxTiles !== undefined) { sets.push(`max_tiles = $${idx++}`); values.push(data.maxTiles); }
      if (data.tokenName !== undefined) { sets.push(`token_name = $${idx++}`); values.push(data.tokenName); }
      if (data.tokenSymbol !== undefined) { sets.push(`token_symbol = $${idx++}`); values.push(data.tokenSymbol); }
      if (data.settings !== undefined) { sets.push(`settings = $${idx++}`); values.push(JSON.stringify(data.settings)); }

      if (sets.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      sets.push(`updated_at = NOW()`);
      values.push(req.params.spaceId);

      const result = await pool.query(
        `UPDATE spaces SET ${sets.join(', ')} WHERE space_id = $${idx} RETURNING *`,
        values,
      );

      const space = result.rows[0];
      broadcast('space:updated', space, space.space_id);
      res.json(space);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /spaces/:spaceId — delete a space (auth required, owner only)
router.delete(
  '/:spaceId',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const existing = await pool.query(
        'SELECT id, owner_wallet, space_id FROM spaces WHERE space_id = $1',
        [req.params.spaceId],
      );

      if (existing.rows.length === 0) {
        res.status(404).json({ error: 'Space not found' });
        return;
      }

      if (existing.rows[0].owner_wallet !== req.wallet) {
        res.status(403).json({ error: 'Only the space owner can delete this space' });
        return;
      }

      await pool.query('DELETE FROM spaces WHERE space_id = $1', [req.params.spaceId]);

      broadcast('space:deleted', { spaceId: req.params.spaceId });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;
