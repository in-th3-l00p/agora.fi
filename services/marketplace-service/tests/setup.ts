import { beforeEach, afterAll } from 'vitest';
import { pool } from '../src/db/pool';

beforeEach(async () => {
  await pool.query('TRUNCATE auth_nonces, offers, listings CASCADE');
});

afterAll(async () => {
  await pool.end();
});
