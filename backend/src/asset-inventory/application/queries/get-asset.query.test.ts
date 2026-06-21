import { describe, expect, it } from 'vitest';
import { Asset } from '../../domain/asset.js';
import {
  InMemoryAssetReadRepository,
  InMemoryAssetWriteRepository,
} from '../testing/in-memory-asset.repository.js';
import { GetAssetHandler } from '../query-handlers/get-asset.handler.js';

describe('GetAssetHandler', () => {
  it('returns an asset by id', async () => {
    const repository = new InMemoryAssetWriteRepository();
    const asset = Asset.create({
      id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
      name: 'Pipe P-0001',
      type: 'pipe',
      status: 'ok',
      lat: 42.3601,
      lng: -71.0589,
      installedAt: '2018-01-10',
      lastInspectedAt: null,
      notes: '',
    });
    await repository.create(asset);

    const readRepository = new InMemoryAssetReadRepository(repository);

    await expect(new GetAssetHandler(readRepository).execute({ id: asset.id })).resolves.toEqual({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      status: asset.status,
      lat: asset.location.lat,
      lng: asset.location.lng,
      installedAt: asset.installedAt,
      lastInspectedAt: asset.lastInspectedAt,
      notes: asset.notes,
    });
  });

  it('throws when the asset does not exist', async () => {
    const handler = new GetAssetHandler(
      new InMemoryAssetReadRepository(new InMemoryAssetWriteRepository()),
    );

    await expect(handler.execute({ id: '17fc695a-07a0-4a6e-8822-e8f36c031199' })).rejects.toThrow(
      'Asset 17fc695a-07a0-4a6e-8822-e8f36c031199 was not found',
    );
  });
});
