import { describe, expect, it } from 'vitest';
import { Asset } from '../../domain/asset.js';
import { InMemoryAssetWriteRepository } from '../testing/in-memory-asset.repository.js';
import { DeleteAssetHandler } from '../command-handlers/delete-asset.handler.js';

describe('DeleteAssetHandler', () => {
  it('deletes an existing asset', async () => {
    const repository = new InMemoryAssetWriteRepository();
    const asset = Asset.create({
      id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
      name: 'Hydrant H-0001',
      type: 'hydrant',
      status: 'ok',
      lat: 42.3601,
      lng: -71.0589,
      installedAt: '2019-03-10',
      lastInspectedAt: null,
      notes: '',
    });
    await repository.create(asset);

    await new DeleteAssetHandler(repository).execute({ id: asset.id });

    expect(await repository.findById(asset.id)).toBeNull();
  });

  it('throws when deleting a missing asset', async () => {
    const handler = new DeleteAssetHandler(new InMemoryAssetWriteRepository());

    await expect(handler.execute({ id: '17fc695a-07a0-4a6e-8822-e8f36c031199' })).rejects.toThrow(
      'Asset 17fc695a-07a0-4a6e-8822-e8f36c031199 was not found',
    );
  });
});
