import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';
import { env } from '../config/env.js';
import { createPool } from './pool.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(currentDir, 'migrations');

export async function runMigrations(connectionString = env.databaseUrl): Promise<void> {
  const migrationPool = createPool(connectionString);
  const client = await migrationPool.connect();
  let committed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        executed_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const files = (await readdir(migrationsDir))
      .filter((filename) => filename.endsWith('.sql'))
      .sort((left, right) => left.localeCompare(right));

    for (const filename of files) {
      const alreadyExecuted = await migrationExists(client, filename);

      if (!alreadyExecuted) {
        const sql = await readFile(join(migrationsDir, filename), 'utf8');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
      }
    }

    await client.query('COMMIT');
    committed = true;
  } finally {
    if (!committed) {
      await rollbackQuietly(client);
    }

    client.release();
    await migrationPool.end();
  }
}

async function migrationExists(client: pg.PoolClient, filename: string): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    'SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE filename = $1) AS exists',
    [filename],
  );
  const firstRow = result.rows[0];
  return firstRow?.exists ?? false;
}

async function rollbackQuietly(client: pg.PoolClient): Promise<void> {
  await client.query('ROLLBACK').catch(() => undefined);
}

if (process.env['NODE_ENV'] !== 'test' && process.argv[1] === fileURLToPath(import.meta.url)) {
  await runMigrations();
}
