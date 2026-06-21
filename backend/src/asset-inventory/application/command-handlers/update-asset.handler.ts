import type { Asset } from '../../domain/asset.js';
import { AssetNotFoundError } from '../errors/asset-not-found.error.js';
import type { AssetWriteRepositoryPort } from '../ports/asset-write.repository.port.js';
import type { UpdateAssetCommand } from '../commands/update-asset.command.js';

export class UpdateAssetHandler {
  constructor(private readonly assets: AssetWriteRepositoryPort) {}

  async execute(command: UpdateAssetCommand): Promise<Asset> {
    const existing = await this.assets.findById(command.id);

    if (existing === null) {
      throw new AssetNotFoundError(command.id);
    }

    const updated = existing.update(command);
    return this.assets.update(updated);
  }
}
