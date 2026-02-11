import { Router } from 'express';
import { randomUUID } from 'crypto';
import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { config } from '../config';

const router = Router();

// GET /auth/nonce?address=0x...
router.get('/nonce', async (req, res, next) => {
  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      res.status(400).json({ error: 'address query parameter required' });
      return;
    }

    const nonce = randomUUID();

    await pool.query(
      `INSERT INTO auth_nonces (address, nonce, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (address) DO UPDATE SET nonce = $2, created_at = NOW()`,
      [address.toLowerCase(), nonce],
    );

    res.json({ nonce });
  } catch (err) {
    next(err);
  }
});

// POST /auth/verify
router.post('/verify', async (req, res, next) => {
  try {
    const { address, signature } = req.body;

    if (!address || !signature) {
      res.status(400).json({ error: 'address and signature required' });
      return;
    }

    const result = await pool.query(
      'SELECT nonce FROM auth_nonces WHERE address = $1',
      [address.toLowerCase()],
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: 'No nonce found. Request a nonce first.' });
      return;
    }

    const { nonce } = result.rows[0];
    const message = `Sign this message to authenticate with AGORAFI.\n\nNonce: ${nonce}`;

    try {
      const recovered = verifyMessage(message, signature);
      if (recovered.toLowerCase() !== address.toLowerCase()) {
        res.status(401).json({ error: 'Signature verification failed' });
        return;
      }
    } catch {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    await pool.query('DELETE FROM auth_nonces WHERE address = $1', [
      address.toLowerCase(),
    ]);

    const token = jwt.sign(
      { address: address.toLowerCase() },
      config.jwtSecret,
      { expiresIn: '24h' },
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

export default router;
