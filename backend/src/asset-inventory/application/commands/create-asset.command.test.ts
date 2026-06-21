import { describe, expect, it } from 'vitest';
import { CreateAssetHandler } from '../command-handlers/create-asset.handler.js';
import { InMemoryAssetWriteRepository } from '../testing/in-memory-asset.repository.js';

describe('CreateAssetHandler', () => {
  it('creates an asset and stores it through the repository', async () => {
    const repository = new InMemoryAssetWriteRepository();
    const handler = new CreateAssetHandler(repository);

    const asset = await handler.execute({
      name: 'Valve V-1001',
      type: 'valve',
      status: 'warning',
      lat: 42.3601,
      lng: -71.0589,
      installedAt: '2021-04-15',
      lastInspectedAt: null,
      notes: '',
    });

    expect(asset.id).toHaveLength(36);
    expect(await repository.findById(asset.id)).toBe(asset);
  });
});
