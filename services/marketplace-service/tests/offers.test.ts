import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app';
import { createTestWallet, getAuthToken, createListing, createOffer } from './helpers';

const request = supertest(app);

describe('Offers', () => {
  describe('POST /offers', () => {
    it('should create an offer on a listing', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);
      const listing = await createListing(request, sellerToken);

      const buyer = createTestWallet();
      const buyerToken = await getAuthToken(request, buyer);
      const offer = await createOffer(request, buyerToken, listing.id, { amount: '0.06' });

      expect(offer.listing_id).toBe(listing.id);
      expect(offer.offerer_wallet).toBe(buyer.address.toLowerCase());
      expect(offer.status).toBe('pending');
      expect(offer.space_id).toBe(listing.space_id);
      expect(offer.token_id).toBe(listing.token_id);
    });

    it('should reject offers on own listing', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);
      const listing = await createListing(request, token);

      await request
        .post('/offers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          listingId: listing.id,
          amount: '0.05',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(400);
    });

    it('should reject offers on non-existent listing', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await request
        .post('/offers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          listingId: '00000000-0000-0000-0000-000000000000',
          amount: '0.05',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(404);
    });
  });

  describe('GET /offers', () => {
    it('should list offers filtered by listingId', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);
      const listing = await createListing(request, sellerToken);

      const buyer1 = createTestWallet();
      const buyer1Token = await getAuthToken(request, buyer1);
      await createOffer(request, buyer1Token, listing.id, { amount: '0.05' });

      const buyer2 = createTestWallet();
      const buyer2Token = await getAuthToken(request, buyer2);
      await createOffer(request, buyer2Token, listing.id, { amount: '0.07' });

      const res = await request.get(`/offers?listingId=${listing.id}`).expect(200);

      expect(res.body).toHaveLength(2);
      // Sorted by amount DESC
      expect(parseFloat(res.body[0].amount)).toBeGreaterThan(parseFloat(res.body[1].amount));
    });
  });

  describe('GET /offers/:id', () => {
    it('should return a single offer', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);
      const listing = await createListing(request, sellerToken);

      const buyer = createTestWallet();
      const buyerToken = await getAuthToken(request, buyer);
      const offer = await createOffer(request, buyerToken, listing.id);

      const res = await request.get(`/offers/${offer.id}`).expect(200);
      expect(res.body.id).toBe(offer.id);
    });

    it('should return 404 for non-existent offer', async () => {
      await request.get('/offers/00000000-0000-0000-0000-000000000000').expect(404);
    });
  });

  describe('DELETE /offers/:id', () => {
    it('should cancel own offer', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);
      const listing = await createListing(request, sellerToken);

      const buyer = createTestWallet();
      const buyerToken = await getAuthToken(request, buyer);
      const offer = await createOffer(request, buyerToken, listing.id);

      const res = await request
        .delete(`/offers/${offer.id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.status).toBe('cancelled');
    });

    it('should reject cancellation from non-offerer', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);
      const listing = await createListing(request, sellerToken);

      const buyer = createTestWallet();
      const buyerToken = await getAuthToken(request, buyer);
      const offer = await createOffer(request, buyerToken, listing.id);

      const stranger = createTestWallet();
      const strangerToken = await getAuthToken(request, stranger);

      await request
        .delete(`/offers/${offer.id}`)
        .set('Authorization', `Bearer ${strangerToken}`)
        .expect(403);
    });
  });

  describe('POST /offers/:id/accept', () => {
    it('should accept an offer and mark listing as sold', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);
      const listing = await createListing(request, sellerToken);

      const buyer = createTestWallet();
      const buyerToken = await getAuthToken(request, buyer);
      const offer = await createOffer(request, buyerToken, listing.id);

      const res = await request
        .post(`/offers/${offer.id}/accept`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body.status).toBe('accepted');

      // Listing should now be sold
      const listingRes = await request.get(`/listings/${listing.id}`).expect(200);
      expect(listingRes.body.status).toBe('sold');
      expect(listingRes.body.buyer_wallet).toBe(buyer.address.toLowerCase());
    });

    it('should reject other pending offers when one is accepted', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);
      const listing = await createListing(request, sellerToken);

      const buyer1 = createTestWallet();
      const buyer1Token = await getAuthToken(request, buyer1);
      const offer1 = await createOffer(request, buyer1Token, listing.id, { amount: '0.05' });

      const buyer2 = createTestWallet();
      const buyer2Token = await getAuthToken(request, buyer2);
      const offer2 = await createOffer(request, buyer2Token, listing.id, { amount: '0.06' });

      // Accept offer1
      await request
        .post(`/offers/${offer1.id}/accept`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      // offer2 should be rejected
      const offer2Res = await request.get(`/offers/${offer2.id}`).expect(200);
      expect(offer2Res.body.status).toBe('rejected');
    });

    it('should reject acceptance from non-seller', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);
      const listing = await createListing(request, sellerToken);

      const buyer = createTestWallet();
      const buyerToken = await getAuthToken(request, buyer);
      const offer = await createOffer(request, buyerToken, listing.id);

      const stranger = createTestWallet();
      const strangerToken = await getAuthToken(request, stranger);

      await request
        .post(`/offers/${offer.id}/accept`)
        .set('Authorization', `Bearer ${strangerToken}`)
        .expect(403);
    });
  });

  describe('POST /offers/:id/reject', () => {
    it('should reject an offer', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);
      const listing = await createListing(request, sellerToken);

      const buyer = createTestWallet();
      const buyerToken = await getAuthToken(request, buyer);
      const offer = await createOffer(request, buyerToken, listing.id);

      const res = await request
        .post(`/offers/${offer.id}/reject`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body.status).toBe('rejected');
    });

    it('should reject rejection from non-seller', async () => {
      const seller = createTestWallet();
      const sellerToken = await getAuthToken(request, seller);
      const listing = await createListing(request, sellerToken);

      const buyer = createTestWallet();
      const buyerToken = await getAuthToken(request, buyer);
      const offer = await createOffer(request, buyerToken, listing.id);

      await request
        .post(`/offers/${offer.id}/reject`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });
  });
});
