import { Asset } from '../../domain/asset.js';
import type { AssetWriteRepositoryPort } from '../ports/asset-write.repository.port.js';
import type { CreateAssetCommand } from '../commands/create-asset.command.js';

export class CreateAssetHandler {
  constructor(private readonly assets: AssetWriteRepositoryPort) {}

  async execute(command: CreateAssetCommand): Promise<Asset> {
    const asset = Asset.create(command);
    return this.assets.create(asset);
  }
}
