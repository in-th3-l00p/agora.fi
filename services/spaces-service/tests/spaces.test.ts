import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app';
import { createTestWallet, getAuthToken, createSpace } from './helpers';

const request = supertest(app);

describe('Spaces CRUD', () => {
  describe('POST /spaces', () => {
    it('should create a space', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      const space = await createSpace(request, token, { spaceId: 'romania' });

      expect(space.space_id).toBe('romania');
      expect(space.name).toBe('Test Space');
      expect(space.owner_wallet).toBe(wallet.address.toLowerCase());
      expect(space.max_tiles).toBe(100);
      expect(space.id).toBeDefined();
    });

    it('should reject duplicate space IDs', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await createSpace(request, token, { spaceId: 'dupe' });

      await request
        .post('/spaces')
        .set('Authorization', `Bearer ${token}`)
        .send({ spaceId: 'dupe', name: 'Duplicate' })
        .expect(409);
    });

    it('should validate the space ID format', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await request
        .post('/spaces')
        .set('Authorization', `Bearer ${token}`)
        .send({ spaceId: 'INVALID SPACE!', name: 'Bad' })
        .expect(400);
    });

    it('should reject creation without auth', async () => {
      await request
        .post('/spaces')
        .send({ spaceId: 'noauth', name: 'No Auth' })
        .expect(401);
    });
  });

  describe('GET /spaces', () => {
    it('should list all spaces', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await createSpace(request, token, { spaceId: 'space-a', name: 'Space A' });
      await createSpace(request, token, { spaceId: 'space-b', name: 'Space B' });

      const res = await request.get('/spaces').expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].tile_count).toBe(0);
    });

    it('should return an empty array when no spaces exist', async () => {
      const res = await request.get('/spaces').expect(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /spaces/:spaceId', () => {
    it('should return a single space', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await createSpace(request, token, { spaceId: 'detail-test', name: 'Detail' });

      const res = await request.get('/spaces/detail-test').expect(200);

      expect(res.body.space_id).toBe('detail-test');
      expect(res.body.name).toBe('Detail');
      expect(res.body.tile_count).toBe(0);
    });

    it('should return 404 for a non-existent space', async () => {
      await request.get('/spaces/does-not-exist').expect(404);
    });
  });

  describe('PUT /spaces/:spaceId', () => {
    it('should update a space owned by the caller', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await createSpace(request, token, { spaceId: 'update-me' });

      const res = await request
        .put('/spaces/update-me')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name', description: 'New description' })
        .expect(200);

      expect(res.body.name).toBe('Updated Name');
      expect(res.body.description).toBe('New description');
    });

    it('should reject updates from a non-owner', async () => {
      const owner = createTestWallet();
      const ownerToken = await getAuthToken(request, owner);

      const stranger = createTestWallet();
      const strangerToken = await getAuthToken(request, stranger);

      await createSpace(request, ownerToken, { spaceId: 'protected' });

      await request
        .put('/spaces/protected')
        .set('Authorization', `Bearer ${strangerToken}`)
        .send({ name: 'Hacked' })
        .expect(403);
    });

    it('should return 404 for a non-existent space', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await request
        .put('/spaces/ghost')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Ghost' })
        .expect(404);
    });
  });

  describe('DELETE /spaces/:spaceId', () => {
    it('should delete a space owned by the caller', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await createSpace(request, token, { spaceId: 'delete-me' });

      await request
        .delete('/spaces/delete-me')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      await request.get('/spaces/delete-me').expect(404);
    });

    it('should reject deletion from a non-owner', async () => {
      const owner = createTestWallet();
      const ownerToken = await getAuthToken(request, owner);

      const stranger = createTestWallet();
      const strangerToken = await getAuthToken(request, stranger);

      await createSpace(request, ownerToken, { spaceId: 'no-delete' });

      await request
        .delete('/spaces/no-delete')
        .set('Authorization', `Bearer ${strangerToken}`)
        .expect(403);
    });

    it('should cascade-delete tiles when a space is deleted', async () => {
      const wallet = createTestWallet();
      const token = await getAuthToken(request, wallet);

      await createSpace(request, token, { spaceId: 'cascade' });

      // Add a tile
      await request
        .post('/spaces/cascade/tiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ tokenId: 1, gridPosition: 0 })
        .expect(201);

      // Delete the space
      await request
        .delete('/spaces/cascade')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Tiles should be gone
      await request.get('/spaces/cascade/tiles').expect(404);
    });
  });
});
