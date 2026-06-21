import type pg from 'pg';
import { env } from '../../src/config/env.js';
import { createPool } from '../../src/db/pool.js';
import { runMigrations } from '../../src/db/migrate.js';

let testPool: pg.Pool | null = null;

export async function setupTestDatabase(): Promise<pg.Pool> {
  await runMigrations(env.testDatabaseUrl);
  testPool = createPool(env.testDatabaseUrl);
  return testPool;
}

export async function truncateAssets(pool: pg.Pool): Promise<void> {
  await pool.query('TRUNCATE TABLE assets');
}

export async function closeTestDatabase(): Promise<void> {
  if (testPool !== null) {
    await testPool.end();
    testPool = null;
  }
}
