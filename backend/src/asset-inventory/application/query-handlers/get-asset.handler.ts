import { AssetNotFoundError } from '../errors/asset-not-found.error.js';
import type { AssetReadRepositoryPort } from '../ports/asset-read.repository.port.js';
import type { AssetReadModel } from '../read-models/asset.read-model.js';
import type { GetAssetQuery } from '../queries/get-asset.query.js';

export class GetAssetHandler {
  constructor(private readonly assets: AssetReadRepositoryPort) {}

  async execute(query: GetAssetQuery): Promise<AssetReadModel> {
    const asset = await this.assets.findById(query.id);

    if (asset === null) {
      throw new AssetNotFoundError(query.id);
    }

    return asset;
  }
}
