import { describe, expect, it } from 'vitest';
import { Asset } from '../../domain/asset.js';
import { InMemoryAssetWriteRepository } from '../testing/in-memory-asset.repository.js';
import { UpdateAssetHandler } from '../command-handlers/update-asset.handler.js';

describe('UpdateAssetHandler', () => {
  it('updates an existing asset', async () => {
    const repository = new InMemoryAssetWriteRepository();
    const existing = Asset.create({
      id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
      name: 'Sensor S-0001',
      type: 'sensor',
      status: 'ok',
      lat: 42.3601,
      lng: -71.0589,
      installedAt: '2020-01-10',
      lastInspectedAt: null,
      notes: '',
    });
    await repository.create(existing);

    const updated = await new UpdateAssetHandler(repository).execute({
      id: existing.id,
      status: 'critical',
      notes: 'needs urgent review',
    });

    expect(updated.status).toBe('critical');
    expect(updated.notes).toBe('needs urgent review');
    expect((await repository.findById(existing.id))?.status).toBe('critical');
  });

  it('throws when the asset does not exist', async () => {
    const handler = new UpdateAssetHandler(new InMemoryAssetWriteRepository());

    await expect(
      handler.execute({ id: '17fc695a-07a0-4a6e-8822-e8f36c031199', name: 'New' }),
    ).rejects.toThrow('Asset 17fc695a-07a0-4a6e-8822-e8f36c031199 was not found');
  });
});
