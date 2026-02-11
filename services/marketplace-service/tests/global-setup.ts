import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const ADMIN_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
const TEST_DB = 'marketplace_service_test';
const TEST_URL = `postgresql://postgres:postgres@localhost:5432/${TEST_DB}`;

export async function setup() {
  const admin = new pg.Pool({ connectionString: ADMIN_URL });

  await admin
    .query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [TEST_DB],
    )
    .catch(() => {});

  await admin.query(`DROP DATABASE IF EXISTS "${TEST_DB}"`);
  await admin.query(`CREATE DATABASE "${TEST_DB}"`);
  await admin.end();

  const test = new pg.Pool({ connectionString: TEST_URL });
  const sql = readFileSync(join(process.cwd(), 'src/migrations/001_initial.sql'), 'utf-8');
  await test.query(sql);
  await test.end();
}

export async function teardown() {
  const admin = new pg.Pool({ connectionString: ADMIN_URL });

  await admin
    .query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [TEST_DB],
    )
    .catch(() => {});

  await admin.query(`DROP DATABASE IF EXISTS "${TEST_DB}"`);
  await admin.end();
}
