import { describe, expect, it } from 'vitest';
import { Asset } from '../../domain/asset.js';
import {
  InMemoryAssetReadRepository,
  InMemoryAssetWriteRepository,
} from '../testing/in-memory-asset.repository.js';
import { ListAssetsHandler } from '../query-handlers/list-assets.handler.js';

describe('ListAssetsHandler', () => {
  it('passes filters through to the repository', async () => {
    const repository = new InMemoryAssetWriteRepository();
    const asset = Asset.create({
      id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
      name: 'Sensor S-0001',
      type: 'sensor',
      status: 'warning',
      lat: 42.3601,
      lng: -71.0589,
      installedAt: '2021-01-10',
      lastInspectedAt: null,
      notes: '',
    });
    await repository.create(asset);
    const readRepository = new InMemoryAssetReadRepository(repository);

    const result = await new ListAssetsHandler(readRepository).execute({
      page: 1,
      pageSize: 50,
      type: 'sensor',
      status: 'warning',
      geo: { kind: 'radius', lat: 42.36, lng: -71.06, radiusMeters: 5000 },
    });

    expect(result.data).toEqual([
      {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        status: asset.status,
        lat: asset.location.lat,
        lng: asset.location.lng,
        installedAt: asset.installedAt,
        lastInspectedAt: asset.lastInspectedAt,
        notes: asset.notes,
      },
    ]);
    expect(readRepository.lastListCriteria).toEqual({
      page: 1,
      pageSize: 50,
      type: 'sensor',
      status: 'warning',
      geo: { kind: 'radius', lat: 42.36, lng: -71.06, radiusMeters: 5000 },
    });
  });
});
