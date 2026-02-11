import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app';
import { createTestWallet, getAuthToken } from './helpers';

const request = supertest(app);

describe('Auth', () => {
  describe('GET /auth/nonce', () => {
    it('should return a nonce for a valid address', async () => {
      const wallet = createTestWallet();
      const res = await request
        .get(`/auth/nonce?address=${wallet.address}`)
        .expect(200);

      expect(res.body.nonce).toBeDefined();
      expect(typeof res.body.nonce).toBe('string');
    });

    it('should reject requests without an address', async () => {
      await request.get('/auth/nonce').expect(400);
    });

    it('should replace the nonce on repeated requests', async () => {
      const wallet = createTestWallet();

      const res1 = await request.get(`/auth/nonce?address=${wallet.address}`).expect(200);
      const res2 = await request.get(`/auth/nonce?address=${wallet.address}`).expect(200);

      expect(res1.body.nonce).not.toBe(res2.body.nonce);
    });
  });

  describe('POST /auth/verify', () => {
    it('should return a JWT for a valid signature', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });

    it('should reject a signature from a different wallet', async () => {
      const wallet = createTestWallet();
      const imposter = createTestWallet();

      const nonceRes = await request
        .get(`/auth/nonce?address=${wallet.address}`)
        .expect(200);

      const message = `Sign this message to authenticate with AGORAFI.\n\nNonce: ${nonceRes.body.nonce}`;
      const signature = await imposter.signMessage(message);

      await request
        .post('/auth/verify')
        .send({ address: wallet.address, signature })
        .expect(401);
    });

    it('should reject verification without a prior nonce', async () => {
      const wallet = createTestWallet();

      await request
        .post('/auth/verify')
        .send({ address: wallet.address, signature: '0xdead' })
        .expect(400);
    });

    it('should invalidate the nonce after use', async () => {
      const wallet = createTestWallet();

      // First auth succeeds
      const nonceRes = await request
        .get(`/auth/nonce?address=${wallet.address}`)
        .expect(200);

      const message = `Sign this message to authenticate with AGORAFI.\n\nNonce: ${nonceRes.body.nonce}`;
      const signature = await wallet.signMessage(message);

      await request
        .post('/auth/verify')
        .send({ address: wallet.address, signature })
        .expect(200);

      // Replaying the same signature fails (nonce was consumed)
      await request
        .post('/auth/verify')
        .send({ address: wallet.address, signature })
        .expect(400);
    });
  });

  describe('Protected routes', () => {
    it('should reject requests without a token', async () => {
      await request.post('/spaces').send({ spaceId: 'test' }).expect(401);
    });

    it('should reject requests with an invalid token', async () => {
      await request
        .post('/spaces')
        .set('Authorization', 'Bearer invalid-token')
        .send({ spaceId: 'test' })
        .expect(401);
    });
  });
});
