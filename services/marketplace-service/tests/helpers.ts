import { ethers } from 'ethers';
import supertest from 'supertest';

export function createTestWallet() {
  return ethers.Wallet.createRandom();
}

export async function getAuthToken(
  request: supertest.Agent,
  wallet: ethers.HDNodeWallet,
): Promise<string> {
  const nonceRes = await request
    .get(`/auth/nonce?address=${wallet.address}`)
    .expect(200);

  const { nonce } = nonceRes.body;
  const message = `Sign this message to authenticate with AGORAFI.\n\nNonce: ${nonce}`;
  const signature = await wallet.signMessage(message);

  const verifyRes = await request
    .post('/auth/verify')
    .send({ address: wallet.address, signature })
    .expect(200);

  return verifyRes.body.token;
}

export async function createListing(
  request: supertest.Agent,
  token: string,
  overrides: Record<string, unknown> = {},
) {
  const defaults = {
    spaceId: 'test-space',
    tokenId: 1,
    price: '0.08',
    currency: 'ETH',
  };

  const res = await request
    .post('/listings')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...defaults, ...overrides })
    .expect(201);

  return res.body;
}

export async function createOffer(
  request: supertest.Agent,
  token: string,
  listingId: string,
  overrides: Record<string, unknown> = {},
) {
  const defaults = {
    listingId,
    amount: '0.05',
    currency: 'ETH',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const res = await request
    .post('/offers')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...defaults, ...overrides })
    .expect(201);

  return res.body;
}
