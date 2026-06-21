import type { AssetReadRepositoryPort } from '../ports/asset-read.repository.port.js';
import type { AssetReadModel } from '../read-models/asset.read-model.js';
import type { Paginated } from '../types/paginated.js';
import type { ListAssetsQuery } from '../queries/list-assets.query.js';

export class ListAssetsHandler {
  constructor(private readonly assets: AssetReadRepositoryPort) {}

  async execute(query: ListAssetsQuery): Promise<Paginated<AssetReadModel>> {
    return this.assets.list(query);
  }
}
