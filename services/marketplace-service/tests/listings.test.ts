import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app';
import { createTestWallet, getAuthToken, createListing } from './helpers';

const request = supertest(app);

describe('Listings', () => {
  describe('POST /listings', () => {
    it('should create a listing', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      const listing = await createListing(request, token, {
        spaceId: 'romania',
        tokenId: 42,
        price: '0.15',
      });

      expect(listing.space_id).toBe('romania');
      expect(listing.token_id).toBe(42);
      expect(listing.price).toBe('0.150000000000000000');
      expect(listing.seller_wallet).toBe(wallet.address.toLowerCase());
      expect(listing.status).toBe('active');
    });

    it('should reject duplicate active listings for the same tile', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await createListing(request, token, { spaceId: 'romania', tokenId: 1 });

      await request
        .post('/listings')
        .set('Authorization', `Bearer ${token}`)
        .send({ spaceId: 'romania', tokenId: 1, price: '0.1' })
        .expect(409);
    });

    it('should allow listings for the same tile in different spaces', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await createListing(request, token, { spaceId: 'space-a', tokenId: 1 });
      await createListing(request, token, { spaceId: 'space-b', tokenId: 1 });

      const res = await request.get('/listings').expect(200);
      expect(res.body).toHaveLength(2);
    });

    it('should reject creation without auth', async () => {
      await request
        .post('/listings')
        .send({ spaceId: 'romania', tokenId: 1, price: '0.1' })
        .expect(401);
    });
  });

  describe('GET /listings', () => {
    it('should list active listings', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await createListing(request, token, { spaceId: 'romania', tokenId: 1 });
      await createListing(request, token, { spaceId: 'romania', tokenId: 2 });

      const res = await request.get('/listings').expect(200);
      expect(res.body).toHaveLength(2);
    });

    it('should filter by spaceId', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await createListing(request, token, { spaceId: 'romania', tokenId: 1 });
      await createListing(request, token, { spaceId: 'defi', tokenId: 1 });

      const res = await request.get('/listings?spaceId=romania').expect(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].space_id).toBe('romania');
    });

    it('should sort by price ascending', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await createListing(request, token, { spaceId: 'romania', tokenId: 1, price: '0.5' });
      await createListing(request, token, { spaceId: 'romania', tokenId: 2, price: '0.1' });

      const res = await request.get('/listings?sort=price_asc').expect(200);
      expect(parseFloat(res.body[0].price)).toBeLessThan(parseFloat(res.body[1].price));
    });
  });

  describe('GET /listings/:id', () => {
    it('should return a single listing', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      const listing = await createListing(request, token);

      const res = await request.get(`/listings/${listing.id}`).expect(200);
      expect(res.body.id).toBe(listing.id);
    });

    it('should return 404 for non-existent listing', async () => {
      await request.get('/listings/00000000-0000-0000-0000-000000000000').expect(404);
    });
  });

  describe('PATCH /listings/:id', () => {
    it('should update the price', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      const listing = await createListing(request, token, { price: '0.08' });

      const res = await request
        .patch(`/listings/${listing.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: '0.12' })
        .expect(200);

      expect(res.body.price).toBe('0.120000000000000000');
    });

    it('should reject updates from non-seller', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);

      const stranger = createTestWallet();
      const strangerToken = await getAuthToken(request, stranger);

      const listing = await createListing(request, sellerToken);

      await request
        .patch(`/listings/${listing.id}`)
        .set('Authorization', `Bearer ${strangerToken}`)
        .send({ price: '0.01' })
        .expect(403);
    });
  });

  describe('DELETE /listings/:id', () => {
    it('should cancel a listing', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      const listing = await createListing(request, token);

      const res = await request
        .delete(`/listings/${listing.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('cancelled');
    });

    it('should reject cancellation from non-seller', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);

      const stranger = createTestWallet();
      const strangerToken = await getAuthToken(request, stranger);

      const listing = await createListing(request, sellerToken);

      await request
        .delete(`/listings/${listing.id}`)
        .set('Authorization', `Bearer ${strangerToken}`)
        .expect(403);
    });
  });

  describe('POST /listings/:id/purchase', () => {
    it('should purchase a listing', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);

      const buyer = createTestWallet();
      const buyerToken = await getAuthToken(request, buyer);

      const listing = await createListing(request, sellerToken);

      const res = await request
        .post(`/listings/${listing.id}/purchase`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.status).toBe('sold');
      expect(res.body.buyer_wallet).toBe(buyer.address.toLowerCase());
      expect(res.body.sold_at).toBeDefined();
    });

    it('should prevent self-purchase', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      const listing = await createListing(request, token);

      await request
        .post(`/listings/${listing.id}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('should prevent purchasing a sold listing', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);

      const buyer1 = createTestWallet();
      const buyer1Token = await getAuthToken(request, buyer1);

      const buyer2 = createTestWallet();
      const buyer2Token = await getAuthToken(request, buyer2);

      const listing = await createListing(request, sellerToken);

      // First purchase succeeds
      await request
        .post(`/listings/${listing.id}/purchase`)
        .set('Authorization', `Bearer ${buyer1Token}`)
        .expect(200);

      // Second purchase fails
      await request
        .post(`/listings/${listing.id}/purchase`)
        .set('Authorization', `Bearer ${buyer2Token}`)
        .expect(400);
    });
  });
});
