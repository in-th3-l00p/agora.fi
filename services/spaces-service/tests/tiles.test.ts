import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app';
import { createTestWallet, getAuthToken, createSpace } from './helpers';

const request = supertest(app);

describe('Tiles CRUD', () => {
  async function setupSpaceWithAuth(overrides: Record<string, unknown> = {}) {
    const wallet = createTestWallet();
    const token = await getAuthToken(request, wallet);
    const space = await createSpace(request, token, overrides);
    return { wallet, token, space };
  }

  describe('POST /spaces/:spaceId/tiles', () => {
    it('should create a tile in a space', async () => {
      const { token, space } = await setupSpaceWithAuth({ spaceId: 'tile-test' });

      const res = await request
        .post('/spaces/tile-test/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 1, gridPosition: 0, tier: 2, metadata: { name: 'HQ' } })
        .expect(201);

      expect(res.body.token_id).toBe(1);
      expect(res.body.grid_position).toBe(0);
      expect(res.body.tier).toBe(2);
      expect(res.body.metadata).toEqual({ name: 'HQ' });
      expect(res.body.space_id).toBe(space.id);
    });

    it('should reject duplicate token IDs in the same space', async () => {
      const { token } = await setupSpaceWithAuth({ spaceId: 'dupe-tile' });

      await request
        .post('/spaces/dupe-tile/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 1, gridPosition: 0 })
        .expect(201);

      await request
        .post('/spaces/dupe-tile/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 1, gridPosition: 1 })
        .expect(409);
    });

    it('should reject duplicate grid positions in the same space', async () => {
      const { token } = await setupSpaceWithAuth({ spaceId: 'dupe-pos' });

      await request
        .post('/spaces/dupe-pos/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 1, gridPosition: 0 })
        .expect(201);

      await request
        .post('/spaces/dupe-pos/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 2, gridPosition: 0 })
        .expect(409);
    });

    it('should enforce max_tiles limit', async () => {
      const { token } = await setupSpaceWithAuth({ spaceId: 'tiny', maxTiles: 2 });

      await request
        .post('/spaces/tiny/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 0, gridPosition: 0 })
        .expect(201);

      await request
        .post('/spaces/tiny/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 1, gridPosition: 1 })
        .expect(201);

      await request
        .post('/spaces/tiny/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 2, gridPosition: 2 })
        .expect(409);
    });

    it('should reject tile creation from a non-owner', async () => {
      await setupSpaceWithAuth({ spaceId: 'owner-only' });

      const stranger = createTestWallet();
      const strangerToken = await getAuthToken(request, stranger);

      await request
        .post('/spaces/owner-only/tiles')
        .set('Authorization', `Bearer ${strangerToken}`)
        .send({ tokenId: 1, gridPosition: 0 })
        .expect(403);
    });
  });

  describe('GET /spaces/:spaceId/tiles', () => {
    it('should list all tiles in a space', async () => {
      const { token } = await setupSpaceWithAuth({ spaceId: 'list-tiles' });

      await request
        .post('/spaces/list-tiles/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 0, gridPosition: 0 })
        .expect(201);

      await request
        .post('/spaces/list-tiles/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 1, gridPosition: 1 })
        .expect(201);

      const res = await request.get('/spaces/list-tiles/tiles').expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].grid_position).toBe(0);
      expect(res.body[1].grid_position).toBe(1);
    });

    it('should return an empty array for a space with no tiles', async () => {
      await setupSpaceWithAuth({ spaceId: 'empty-tiles' });

      const res = await request.get('/spaces/empty-tiles/tiles').expect(200);
      expect(res.body).toEqual([]);
    });

    it('should return 404 for a non-existent space', async () => {
      await request.get('/spaces/ghost/tiles').expect(404);
    });
  });

  describe('GET /spaces/:spaceId/tiles/:tokenId', () => {
    it('should return a single tile', async () => {
      const { token } = await setupSpaceWithAuth({ spaceId: 'single-tile' });

      await request
        .post('/spaces/single-tile/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 42, gridPosition: 5, tier: 3 })
        .expect(201);

      const res = await request.get('/spaces/single-tile/tiles/42').expect(200);

      expect(res.body.token_id).toBe(42);
      expect(res.body.tier).toBe(3);
    });

    it('should return 404 for a non-existent tile', async () => {
      await setupSpaceWithAuth({ spaceId: 'no-tile' });
      await request.get('/spaces/no-tile/tiles/999').expect(404);
    });
  });

  describe('PUT /spaces/:spaceId/tiles/:tokenId', () => {
    it('should update a tile', async () => {
      const { token } = await setupSpaceWithAuth({ spaceId: 'update-tile' });

      await request
        .post('/spaces/update-tile/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 1, gridPosition: 0 })
        .expect(201);

      const res = await request
        .put('/spaces/update-tile/tiles/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ tier: 4, metadata: { upgraded: true } })
        .expect(200);

      expect(res.body.tier).toBe(4);
      expect(res.body.metadata).toEqual({ upgraded: true });
    });

    it('should reject updates from a non-owner', async () => {
      const { token } = await setupSpaceWithAuth({ spaceId: 'tile-auth' });

      await request
        .post('/spaces/tile-auth/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 1, gridPosition: 0 })
        .expect(201);

      const stranger = createTestWallet();
      const strangerToken = await getAuthToken(request, stranger);

      await request
        .put('/spaces/tile-auth/tiles/1')
        .set('Authorization', `Bearer ${strangerToken}`)
        .send({ tier: 5 })
        .expect(403);
    });
  });

  describe('DELETE /spaces/:spaceId/tiles/:tokenId', () => {
    it('should delete a tile', async () => {
      const { token } = await setupSpaceWithAuth({ spaceId: 'del-tile' });

      await request
        .post('/spaces/del-tile/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 1, gridPosition: 0 })
        .expect(201);

      await request
        .delete('/spaces/del-tile/tiles/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      await request.get('/spaces/del-tile/tiles/1').expect(404);
    });

    it('should return 404 when deleting a non-existent tile', async () => {
      const { token } = await setupSpaceWithAuth({ spaceId: 'no-del' });

      await request
        .delete('/spaces/no-del/tiles/999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
