import type pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { Asset } from '../../src/asset-inventory/domain/asset.js';
import { PostgresAssetWriteRepository } from '../../src/asset-inventory/infrastructure/postgres/postgres-asset.repository.js';
import type { PaginatedAssetsResponseDto } from '../../src/asset-inventory/presentation/http/dtos/paginated-assets-response.dto.js';
import {
  closeTestDatabase,
  setupTestDatabase,
  truncateAssets,
} from './test-db.js';

let pool: pg.Pool;
let repository: PostgresAssetWriteRepository;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  pool = await setupTestDatabase();
  repository = new PostgresAssetWriteRepository(pool);
  app = createApp(pool);
});

beforeEach(async () => {
  await truncateAssets(pool);
});

afterAll(async () => {
  await closeTestDatabase();
});

describe('asset API', () => {
  it('returns health status', async () => {
    await request(app).get('/api/health').expect(200, { status: 'ok' });
  });

  it('lists paginated assets', async () => {
    await repository.create(createAsset({ id: '17fc695a-07a0-4a6e-8822-e8f36c031199' }));
    await repository.create(createAsset({ id: '414c380f-9d0f-4ff5-8a64-b9b91905fd40' }));
    await repository.create(createAsset({ id: '6cbdc087-74c7-4db9-8ca0-c950ad83e6ce' }));

    const response = await request(app).get('/api/assets?page=1&pageSize=2').expect(200);
    const body = response.body as PaginatedAssetsResponseDto;

    expect(body.data).toHaveLength(2);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(2);
    expect(body.total).toBe(3);
  });

  it('filters assets by type and status', async () => {
    const matching = createAsset({
      id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
      type: 'sensor',
      status: 'critical',
    });
    await repository.create(matching);
    await repository.create(
      createAsset({
        id: '414c380f-9d0f-4ff5-8a64-b9b91905fd40',
        type: 'sensor',
        status: 'ok',
      }),
    );

    const response = await request(app)
      .get('/api/assets?type=sensor&status=critical')
      .expect(200);
    const body = response.body as PaginatedAssetsResponseDto;

    expect(body.data.map((asset) => asset.id)).toEqual([matching.id]);
  });

  it('filters assets by radius', async () => {
    const near = createAsset({
      id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
      lat: 42.3601,
      lng: -71.0589,
    });
    const far = createAsset({
      id: '414c380f-9d0f-4ff5-8a64-b9b91905fd40',
      lat: 41.8781,
      lng: -87.6298,
    });
    await repository.create(near);
    await repository.create(far);

    const response = await request(app)
      .get('/api/assets?nearLat=42.3601&nearLng=-71.0589&radiusMeters=5000')
      .expect(200);
    const body = response.body as PaginatedAssetsResponseDto;

    expect(body.data.map((asset) => asset.id)).toContain(near.id);
    expect(body.data.map((asset) => asset.id)).not.toContain(far.id);
  });

  it('filters assets by map bounds', async () => {
    const insideBounds = createAsset({
      id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
      lat: 42.3601,
      lng: -71.0589,
    });
    const outsideBounds = createAsset({
      id: '414c380f-9d0f-4ff5-8a64-b9b91905fd40',
      lat: 41.8781,
      lng: -87.6298,
    });
    await repository.create(insideBounds);
    await repository.create(outsideBounds);

    const response = await request(app)
      .get('/api/assets?minLat=41&minLng=-72&maxLat=43&maxLng=-70')
      .expect(200);
    const body = response.body as PaginatedAssetsResponseDto;

    expect(body.data.map((asset) => asset.id)).toContain(insideBounds.id);
    expect(body.data.map((asset) => asset.id)).not.toContain(outsideBounds.id);
  });

  it('creates an asset', async () => {
    const response = await request(app)
      .post('/api/assets')
      .send({
        name: 'Valve V-0001',
        type: 'valve',
        status: 'warning',
        lat: 42.3601,
        lng: -71.0589,
        installed_at: '2020-01-10',
        last_inspected_at: null,
        notes: '',
      })
      .expect(201);

    expect(response.body.name).toBe('Valve V-0001');
    expect(response.body.installed_at).toBe('2020-01-10');
    expect(await repository.findById(response.body.id as string)).not.toBeNull();
  });

  it('updates an asset with partial fields', async () => {
    const asset = await repository.create(
      createAsset({ id: '17fc695a-07a0-4a6e-8822-e8f36c031199', status: 'ok' }),
    );

    const response = await request(app)
      .patch(`/api/assets/${asset.id}`)
      .send({ status: 'critical', notes: 'inspect immediately' })
      .expect(200);

    expect(response.body.status).toBe('critical');
    expect(response.body.notes).toBe('inspect immediately');
  });

  it('deletes an asset', async () => {
    const asset = await repository.create(
      createAsset({ id: '17fc695a-07a0-4a6e-8822-e8f36c031199' }),
    );

    await request(app).delete(`/api/assets/${asset.id}`).expect(204);
    await request(app).get(`/api/assets/${asset.id}`).expect(404);
  });

  it('rejects invalid create body with structured validation details', async () => {
    const response = await request(app)
      .post('/api/assets')
      .send({
        name: '',
        type: 'meter',
        status: 'ok',
        lat: 42.3601,
        lng: -71.0589,
        installed_at: '2020-01-10',
        last_inspected_at: null,
        notes: '',
      })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.length).toBeGreaterThan(0);
  });

  it('rejects incomplete radius query', async () => {
    const response = await request(app).get('/api/assets?nearLat=42.36').expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details[0].message).toBe(
      'nearLat, nearLng, and radiusMeters must be provided together',
    );
  });

  it('rejects invalid pagination bounds', async () => {
    const response = await request(app).get('/api/assets?page=0&pageSize=200').expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects empty patch bodies', async () => {
    const asset = await repository.create(
      createAsset({ id: '17fc695a-07a0-4a6e-8822-e8f36c031199' }),
    );

    const response = await request(app).patch(`/api/assets/${asset.id}`).send({}).expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns not found when updating a missing asset', async () => {
    const response = await request(app)
      .patch('/api/assets/17fc695a-07a0-4a6e-8822-e8f36c031199')
      .send({ notes: 'missing' })
      .expect(404);

    expect(response.body.error.code).toBe('ASSET_NOT_FOUND');
  });

  it('returns not found when deleting a missing asset', async () => {
    const response = await request(app)
      .delete('/api/assets/17fc695a-07a0-4a6e-8822-e8f36c031199')
      .expect(404);

    expect(response.body.error.code).toBe('ASSET_NOT_FOUND');
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
