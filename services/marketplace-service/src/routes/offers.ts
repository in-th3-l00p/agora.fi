import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authRequired } from '../middleware/auth';
import { broadcast } from '../ws';
import { AuthRequest } from '../types';

const router = Router();

const createOfferSchema = z.object({
  listingId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid decimal number'),
  currency: z.string().max(10).default('ETH'),
  expiresAt: z.string().datetime(),
});

// GET /offers?listingId=...&status=...
router.get('/', async (req, res, next) => {
  try {
    const { listingId, status, offerer } = req.query;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (listingId) { conditions.push(`listing_id = $${idx++}`); values.push(listingId); }
    if (status) { conditions.push(`status = $${idx++}`); values.push(status); }
    if (offerer) { conditions.push(`offerer_wallet = $${idx++}`); values.push((offerer as string).toLowerCase()); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT * FROM offers ${where} ORDER BY amount DESC, created_at ASC`,
      values,
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /offers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM offers WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Offer not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /offers — make an offer on a listing (auth required)
router.post(
  '/',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = createOfferSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        return;
      }

      const { listingId, amount, currency, expiresAt } = parsed.data;

      // Verify listing exists and is active
      const listing = await pool.query('SELECT * FROM listings WHERE id = $1', [listingId]);

      if (listing.rows.length === 0) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }

      if (listing.rows[0].status !== 'active') {
        res.status(400).json({ error: 'Listing is not active' });
        return;
      }

      if (listing.rows[0].seller_wallet === req.wallet) {
        res.status(400).json({ error: 'Cannot make an offer on your own listing' });
        return;
      }

      const listingData = listing.rows[0];

      const result = await pool.query(
        `INSERT INTO offers (listing_id, space_id, token_id, offerer_wallet, amount, currency, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [listingId, listingData.space_id, listingData.token_id, req.wallet, amount, currency, expiresAt],
      );

      const offer = result.rows[0];
      broadcast('offer:created', offer, listingData.space_id);
      res.status(201).json(offer);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /offers/:id — cancel an offer (auth required, offerer only)
router.delete(
  '/:id',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const existing = await pool.query('SELECT * FROM offers WHERE id = $1', [req.params.id]);

      if (existing.rows.length === 0) {
        res.status(404).json({ error: 'Offer not found' });
        return;
      }

      if (existing.rows[0].offerer_wallet !== req.wallet) {
        res.status(403).json({ error: 'Only the offerer can cancel this offer' });
        return;
      }

      if (existing.rows[0].status !== 'pending') {
        res.status(400).json({ error: 'Can only cancel pending offers' });
        return;
      }

      const result = await pool.query(
        `UPDATE offers SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [req.params.id],
      );

      const cancelled = result.rows[0];
      broadcast('offer:cancelled', cancelled, cancelled.space_id);
      res.json(cancelled);
    } catch (err) {
      next(err);
    }
  },
);

// POST /offers/:id/accept — accept an offer (auth required, listing seller only)
router.post(
  '/:id/accept',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const offerResult = await pool.query('SELECT * FROM offers WHERE id = $1', [req.params.id]);

      if (offerResult.rows.length === 0) {
        res.status(404).json({ error: 'Offer not found' });
        return;
      }

      const offer = offerResult.rows[0];

      if (offer.status !== 'pending') {
        res.status(400).json({ error: 'Can only accept pending offers' });
        return;
      }

      // Verify caller is the listing seller
      const listing = await pool.query('SELECT * FROM listings WHERE id = $1', [offer.listing_id]);

      if (listing.rows.length === 0 || listing.rows[0].seller_wallet !== req.wallet) {
        res.status(403).json({ error: 'Only the listing seller can accept offers' });
        return;
      }

      if (listing.rows[0].status !== 'active') {
        res.status(400).json({ error: 'Listing is no longer active' });
        return;
      }

      // Mark listing as sold
      await pool.query(
        `UPDATE listings SET status = 'sold', buyer_wallet = $1, sold_at = NOW(), updated_at = NOW()
         WHERE id = $2`,
        [offer.offerer_wallet, offer.listing_id],
      );

      // Reject all other pending offers on this listing
      await pool.query(
        `UPDATE offers SET status = 'rejected', updated_at = NOW()
         WHERE listing_id = $1 AND id != $2 AND status = 'pending'`,
        [offer.listing_id, req.params.id],
      );

      // Accept this offer
      const result = await pool.query(
        `UPDATE offers SET status = 'accepted', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [req.params.id],
      );

      const accepted = result.rows[0];
      broadcast('offer:accepted', accepted, accepted.space_id);
      res.json(accepted);
    } catch (err) {
      next(err);
    }
  },
);

// POST /offers/:id/reject — reject an offer (auth required, listing seller only)
router.post(
  '/:id/reject',
  authRequired,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const offerResult = await pool.query('SELECT * FROM offers WHERE id = $1', [req.params.id]);

      if (offerResult.rows.length === 0) {
        res.status(404).json({ error: 'Offer not found' });
        return;
      }

      const offer = offerResult.rows[0];

      if (offer.status !== 'pending') {
        res.status(400).json({ error: 'Can only reject pending offers' });
        return;
      }

      const listing = await pool.query('SELECT * FROM listings WHERE id = $1', [offer.listing_id]);

      if (listing.rows.length === 0 || listing.rows[0].seller_wallet !== req.wallet) {
        res.status(403).json({ error: 'Only the listing seller can reject offers' });
        return;
      }

      const result = await pool.query(
        `UPDATE offers SET status = 'rejected', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [req.params.id],
      );

      const rejected = result.rows[0];
      broadcast('offer:rejected', rejected, rejected.space_id);
      res.json(rejected);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
