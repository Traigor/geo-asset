import { AssetNotFoundError } from '../errors/asset-not-found.error.js';
import type { AssetWriteRepositoryPort } from '../ports/asset-write.repository.port.js';
import type { DeleteAssetCommand } from '../commands/delete-asset.command.js';

export class DeleteAssetHandler {
  constructor(private readonly assets: AssetWriteRepositoryPort) {}

  async execute(command: DeleteAssetCommand): Promise<void> {
    const deleted = await this.assets.delete(command.id);

    if (!deleted) {
      throw new AssetNotFoundError(command.id);
    }
  }
}
