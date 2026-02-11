import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { pool } from './pool';

async function migrate() {
  const migrationsDir = join(process.cwd(), 'src/migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    console.log(`Running migration: ${file}`);
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    await pool.query(sql);
  }

  console.log('All migrations complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
