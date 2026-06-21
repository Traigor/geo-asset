import type { Asset } from '../../domain/asset.js';

export interface AssetWriteRepositoryPort {
  findById(id: string): Promise<Asset | null>;
  create(asset: Asset): Promise<Asset>;
  update(asset: Asset): Promise<Asset>;
  delete(id: string): Promise<boolean>;
}
