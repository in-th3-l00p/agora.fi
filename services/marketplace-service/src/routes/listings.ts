import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authRequired } from '../middleware/auth';
import { broadcast } from '../ws';
import { AuthRequest } from '../types';

const router = Router();

const createListingSchema = z.object({
  spaceId: z.string().min(1).max(100),
  tokenId: z.number().int().min(0),
  price: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid decimal number'),
  currency: z.string().max(10).default('ETH'),
  expiresAt: z.string().datetime().optional(),
});

const updateListingSchema = z.object({
  price: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid decimal number').optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

// GET /listings
router.get('/', async (req, res, next) => {
  try {
    const { spaceId, status = 'active', sort = 'newest', limit = '50', offset = '0' } = req.query;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (spaceId) {
      conditions.push(`space_id = $${idx++}`);
      values.push(spaceId);
    }

    if (status) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'created_at DESC';
    switch (sort) {
      case 'price_asc': orderBy = 'price ASC'; break;
      case 'price_desc': orderBy = 'price DESC'; break;
      case 'oldest': orderBy = 'created_at ASC'; break;
    }

    const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);
    const offsetNum = parseInt(offset as string, 10) || 0;

    values.push(limitNum, offsetNum);

    const result = await pool.query(
      `SELECT * FROM listings ${where} ORDER BY ${orderBy} LIMIT $${idx++} OFFSET $${idx}`,
      values,
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /listings/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /listings — create a listing (auth required)
router.post(
  '/',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = createListingSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        return;
      }

      const { spaceId, tokenId, price, currency, expiresAt } = parsed.data;

      // Prevent duplicate active listings for the same tile
      const existing = await pool.query(
        `SELECT id FROM listings WHERE space_id = $1 AND token_id = $2 AND status = 'active'`,
        [spaceId, tokenId],
      );

      if (existing.rows.length > 0) {
        res.status(409).json({ error: 'An active listing already exists for this tile' });
        return;
      }

      const result = await pool.query(
        `INSERT INTO listings (space_id, token_id, seller_wallet, price, currency, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [spaceId, tokenId, req.wallet, price, currency, expiresAt || null],
      );

      const listing = result.rows[0];
      broadcast('listing:created', listing, spaceId);
      res.status(201).json(listing);
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /listings/:id — update price or expiration (auth required, seller only)
router.patch(
  '/:id',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = updateListingSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        return;
      }

      const existing = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);

      if (existing.rows.length === 0) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }

      const listing = existing.rows[0];

      if (listing.seller_wallet !== req.wallet) {
        res.status(403).json({ error: 'Only the seller can update this listing' });
        return;
      }

      if (listing.status !== 'active') {
        res.status(400).json({ error: 'Can only update active listings' });
        return;
      }

      const data = parsed.data;
      const sets: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (data.price !== undefined) { sets.push(`price = $${idx++}`); values.push(data.price); }
      if (data.expiresAt !== undefined) { sets.push(`expires_at = $${idx++}`); values.push(data.expiresAt); }

      if (sets.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      sets.push('updated_at = NOW()');
      values.push(req.params.id);

      const result = await pool.query(
        `UPDATE listings SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
        values,
      );

      const updated = result.rows[0];
      broadcast('listing:updated', updated, updated.space_id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /listings/:id — cancel a listing (auth required, seller only)
router.delete(
  '/:id',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const existing = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);

      if (existing.rows.length === 0) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }

      if (existing.rows[0].seller_wallet !== req.wallet) {
        res.status(403).json({ error: 'Only the seller can cancel this listing' });
        return;
      }

      if (existing.rows[0].status !== 'active') {
        res.status(400).json({ error: 'Can only cancel active listings' });
        return;
      }

      // Reject all pending offers on this listing
      await pool.query(
        `UPDATE offers SET status = 'rejected', updated_at = NOW()
         WHERE listing_id = $1 AND status = 'pending'`,
        [req.params.id],
      );

      const result = await pool.query(
        `UPDATE listings SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [req.params.id],
      );

      const cancelled = result.rows[0];
      broadcast('listing:cancelled', cancelled, cancelled.space_id);
      res.json(cancelled);
    } catch (err) {
      next(err);
    }
  },
);

// POST /listings/:id/purchase — buy now (auth required)
router.post(
  '/:id/purchase',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const existing = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);

      if (existing.rows.length === 0) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }

      const listing = existing.rows[0];

      if (listing.status !== 'active') {
        res.status(400).json({ error: 'This listing is no longer active' });
        return;
      }

      if (listing.seller_wallet === req.wallet) {
        res.status(400).json({ error: 'Cannot purchase your own listing' });
        return;
      }

      if (listing.expires_at && new Date(listing.expires_at) < new Date()) {
        await pool.query(
          `UPDATE listings SET status = 'expired', updated_at = NOW() WHERE id = $1`,
          [req.params.id],
        );
        res.status(400).json({ error: 'This listing has expired' });
        return;
      }

      // Reject all pending offers on this listing
      await pool.query(
        `UPDATE offers SET status = 'rejected', updated_at = NOW()
         WHERE listing_id = $1 AND status = 'pending'`,
        [req.params.id],
      );

      const result = await pool.query(
        `UPDATE listings SET status = 'sold', buyer_wallet = $1, sold_at = NOW(), updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [req.wallet, req.params.id],
      );

      const sold = result.rows[0];
      broadcast('listing:sold', sold, sold.space_id);
      res.json(sold);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
