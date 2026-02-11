import { ethers } from 'ethers';
import supertest from 'supertest';

/**
 * Create a random Ethereum wallet for testing.
 */
export function createTestWallet() {
  return ethers.Wallet.createRandom();
}

/**
 * Run the full auth flow (nonce → sign → verify) and return a JWT.
 */
export async function getAuthToken(
  request: supertest.Agent,
  wallet: ethers.HDNodeWallet,
): Promise<string> {
  // 1. Request a nonce
  const nonceRes = await request
    .get(`/auth/nonce?address=${wallet.address}`)
    .expect(200);

  const { nonce } = nonceRes.body;

  // 2. Sign the challenge message
  const message = `Sign this message to authenticate with AGORAFI.\n\nNonce: ${nonce}`;
  const signature = await wallet.signMessage(message);

  // 3. Verify and get JWT
  const verifyRes = await request
    .post('/auth/verify')
    .send({ address: wallet.address, signature })
    .expect(200);

  return verifyRes.body.token;
}

/**
 * Create a space via the API and return it.
 */
export async function createSpace(
  request: supertest.Agent,
  token: string,
  overrides: Record<string, unknown> = {},
) {
  const defaults = {
    spaceId: `test-space-${Date.now()}`,
    name: 'Test Space',
    description: 'A test space',
    maxTiles: 100,
    tokenName: 'TestToken',
    tokenSymbol: 'TEST',
    settings: {},
  };

  const res = await request
    .post('/spaces')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...defaults, ...overrides })
    .expect(201);

  return res.body;
}
