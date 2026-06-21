import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';
import { z } from 'zod';
import { env } from '../config/env.js';
import { createPool } from './pool.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
export const seedPath = join(currentDir, '../../seed/seed.json');

const seedAssetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['pipe', 'hydrant', 'sensor', 'valve']),
  status: z.enum(['ok', 'warning', 'critical']),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  installed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  last_inspected_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  notes: z.string(),
});

const seedAssetsSchema = z.array(seedAssetSchema);

type SeedAsset = z.infer<typeof seedAssetSchema>;

export async function seedDatabase(connectionString = env.databaseUrl): Promise<void> {
  const seedPool = createPool(connectionString);
  const client = await seedPool.connect();
  const seedContent = await readFile(seedPath, 'utf8');
  const assets = seedAssetsSchema.parse(JSON.parse(seedContent));
  let committed = false;

  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE assets');

    for (const asset of assets) {
      await insertSeedAsset(client, asset);
    }

    await client.query('COMMIT');
    committed = true;
  } finally {
    if (!committed) {
      await rollbackQuietly(client);
    }

    client.release();
    await seedPool.end();
  }
}

export async function seedDatabaseIfEmpty(connectionString = env.databaseUrl): Promise<void> {
  const seedPool = createPool(connectionString);
  const client = await seedPool.connect();

  let transactionStarted = false;
  let committed = false;

  try {
    const result = await client.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM assets',
    );

    const assetCount = Number(result.rows[0]?.count ?? 0);

    if (assetCount > 0) {
      return;
    }

    const seedContent = await readFile(seedPath, 'utf8');
    const assets = seedAssetsSchema.parse(JSON.parse(seedContent));

    await client.query('BEGIN');
    transactionStarted = true;

    for (const asset of assets) {
      await insertSeedAsset(client, asset);
    }

    await client.query('COMMIT');
    committed = true;
  } finally {
    if (transactionStarted && !committed) {
      await rollbackQuietly(client);
    }

    client.release();
    await seedPool.end();
  }
}

async function insertSeedAsset(client: pg.PoolClient, asset: SeedAsset): Promise<void> {
  await client.query(
    `
      INSERT INTO assets (
        id,
        name,
        type,
        status,
        lat,
        lng,
        installed_at,
        last_inspected_at,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      asset.id,
      asset.name,
      asset.type,
      asset.status,
      asset.lat,
      asset.lng,
      asset.installed_at,
      asset.last_inspected_at,
      asset.notes,
    ],
  );
}

async function rollbackQuietly(client: pg.PoolClient): Promise<void> {
  await client.query('ROLLBACK').catch(() => undefined);
}

if (process.env['NODE_ENV'] !== 'test' && process.argv[1] === fileURLToPath(import.meta.url)) {
  await seedDatabase();
}
