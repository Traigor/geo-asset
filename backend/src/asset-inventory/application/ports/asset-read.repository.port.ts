import type { AssetReadModel } from '../read-models/asset.read-model.js';
import type { AssetListCriteria } from '../types/asset-list-criteria.js';
import type { Paginated } from '../types/paginated.js';

export interface AssetReadRepositoryPort {
  list(criteria: AssetListCriteria): Promise<Paginated<AssetReadModel>>;
  findById(id: string): Promise<AssetReadModel | null>;
}
