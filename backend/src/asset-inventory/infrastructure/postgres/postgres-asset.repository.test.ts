import type pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Asset } from '../../domain/asset.js';
import {
  closeTestDatabase,
  setupTestDatabase,
  truncateAssets,
} from '../../../../test/integration/test-db.js';
import {
  PostgresAssetReadRepository,
  PostgresAssetWriteRepository,
} from './postgres-asset.repository.js';

let pool: pg.Pool;
let readRepository: PostgresAssetReadRepository;
let writeRepository: PostgresAssetWriteRepository;

beforeAll(async () => {
  pool = await setupTestDatabase();
  readRepository = new PostgresAssetReadRepository(pool);
  writeRepository = new PostgresAssetWriteRepository(pool);
});

beforeEach(async () => {
  await truncateAssets(pool);
});

afterAll(async () => {
  await closeTestDatabase();
});

describe('Postgres asset repositories', () => {
  it('creates and finds an asset', async () => {
    const asset = createAsset({
      id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
      name: 'Sensor S-0001',
    });

    await writeRepository.create(asset);

    const found = await writeRepository.findById(asset.id);

    expect(found?.id).toBe(asset.id);
    expect(found?.name).toBe('Sensor S-0001');
    expect(found?.installedAt).toBe('2020-01-10');
  });

  it('filters assets by type and status', async () => {
    const matching = createAsset({
      id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
      type: 'sensor',
      status: 'critical',
    });
    const nonMatching = createAsset({
      id: '414c380f-9d0f-4ff5-8a64-b9b91905fd40',
      type: 'valve',
      status: 'critical',
    });
    await writeRepository.create(matching);
    await writeRepository.create(nonMatching);

    const result = await readRepository.list({
      page: 1,
      pageSize: 50,
      type: 'sensor',
      status: 'critical',
    });

    expect(result.total).toBe(1);
    expect(result.data[0]?.id).toBe(matching.id);
  });

  it('returns only assets inside the requested radius', async () => {
    const assetNearBoston = createAsset({
      id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
      name: 'Boston Sensor',
      lat: 42.3601,
      lng: -71.0589,
    });
    const assetInChicago = createAsset({
      id: '414c380f-9d0f-4ff5-8a64-b9b91905fd40',
      name: 'Chicago Sensor',
      lat: 41.8781,
      lng: -87.6298,
    });
    await writeRepository.create(assetNearBoston);
    await writeRepository.create(assetInChicago);

    const result = await readRepository.list({
      page: 1,
      pageSize: 50,
      geo: { kind: 'radius', lat: 42.3601, lng: -71.0589, radiusMeters: 5000 },
    });

    expect(result.data.map((asset) => asset.id)).toContain(assetNearBoston.id);
    expect(result.data.map((asset) => asset.id)).not.toContain(assetInChicago.id);
  });

  it('returns only assets inside the requested map bounds', async () => {
    const assetNearBoston = createAsset({
      id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
      name: 'Boston Sensor',
      lat: 42.3601,
      lng: -71.0589,
    });
    const assetInChicago = createAsset({
      id: '414c380f-9d0f-4ff5-8a64-b9b91905fd40',
      name: 'Chicago Sensor',
      lat: 41.8781,
      lng: -87.6298,
    });
    await writeRepository.create(assetNearBoston);
    await writeRepository.create(assetInChicago);

    const result = await readRepository.list({
      page: 1,
      pageSize: 50,
      geo: { kind: 'bounds', minLat: 41, minLng: -72, maxLat: 43, maxLng: -70 },
    });

    expect(result.data.map((asset) => asset.id)).toContain(assetNearBoston.id);
    expect(result.data.map((asset) => asset.id)).not.toContain(assetInChicago.id);
  });

  it('orders assets by name descending', async () => {
    await writeRepository.create(
      createAsset({
        id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
        name: 'Alpha Sensor',
      }),
    );
    await writeRepository.create(
      createAsset({
        id: '414c380f-9d0f-4ff5-8a64-b9b91905fd40',
        name: 'Zulu Sensor',
      }),
    );

    const result = await readRepository.list({
      page: 1,
      pageSize: 50,
      sort: { field: 'name', direction: 'desc' },
    });

    expect(result.data.map((asset) => asset.name)).toEqual(['Zulu Sensor', 'Alpha Sensor']);
  });

  it('orders assets by last inspected date ascending with nulls last', async () => {
    await writeRepository.create(
      createAsset({
        id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
        name: 'Never Inspected',
        lastInspectedAt: null,
      }),
    );
    await writeRepository.create(
      createAsset({
        id: '414c380f-9d0f-4ff5-8a64-b9b91905fd40',
        name: 'Recently Inspected',
        lastInspectedAt: '2024-02-01',
      }),
    );
    await writeRepository.create(
      createAsset({
        id: '44d08d4d-7073-46f1-8e68-674edb98beef',
        name: 'Earlier Inspected',
        lastInspectedAt: '2023-01-01',
      }),
    );

    const result = await readRepository.list({
      page: 1,
      pageSize: 50,
      sort: { field: 'last_inspected_at', direction: 'asc' },
    });

    expect(result.data.map((asset) => asset.name)).toEqual([
      'Earlier Inspected',
      'Recently Inspected',
      'Never Inspected',
    ]);
  });
});

function createAsset(overrides: Partial<Parameters<typeof Asset.create>[0]>): Asset {
  return Asset.create({
    id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
    name: 'Sensor S-0001',
    type: 'sensor',
    status: 'ok',
    lat: 42.3601,
    lng: -71.0589,
    installedAt: '2020-01-10',
    lastInspectedAt: null,
    notes: '',
    ...overrides,
  });
}
