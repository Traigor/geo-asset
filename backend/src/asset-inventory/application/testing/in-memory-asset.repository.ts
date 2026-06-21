import type { Asset } from '../../domain/asset.js';
import type { AssetReadRepositoryPort } from '../ports/asset-read.repository.port.js';
import type { AssetWriteRepositoryPort } from '../ports/asset-write.repository.port.js';
import type { AssetReadModel } from '../read-models/asset.read-model.js';
import type { AssetGeoCriteria, AssetListCriteria } from '../types/asset-list-criteria.js';
import type { Paginated } from '../types/paginated.js';

export class InMemoryAssetWriteRepository implements AssetWriteRepositoryPort {
  private readonly records = new Map<string, Asset>();

  constructor(initialAssets: Asset[] = []) {
    for (const asset of initialAssets) {
      this.records.set(asset.id, asset);
    }
  }

  async findById(id: string): Promise<Asset | null> {
    return this.records.get(id) ?? null;
  }

  async create(asset: Asset): Promise<Asset> {
    this.records.set(asset.id, asset);
    return asset;
  }

  async update(asset: Asset): Promise<Asset> {
    this.records.set(asset.id, asset);
    return asset;
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }

  values(): Asset[] {
    return Array.from(this.records.values());
  }
}

export class InMemoryAssetReadRepository implements AssetReadRepositoryPort {
  lastListCriteria: AssetListCriteria | null = null;

  constructor(private readonly source: { values(): Asset[] }) {}

  async list(criteria: AssetListCriteria): Promise<Paginated<AssetReadModel>> {
    this.lastListCriteria = criteria;
    const filtered = this.source.values().filter((asset) => matchesCriteria(asset, criteria));

    return {
      data: filtered
        .slice((criteria.page - 1) * criteria.pageSize, criteria.page * criteria.pageSize)
        .map(assetToReadModel),
      page: criteria.page,
      pageSize: criteria.pageSize,
      total: filtered.length,
    };
  }

  async findById(id: string): Promise<AssetReadModel | null> {
    const asset = this.source.values().find((record) => record.id === id);
    return asset === undefined ? null : assetToReadModel(asset);
  }
}

function matchesCriteria(asset: Asset, criteria: AssetListCriteria): boolean {
  if (criteria.type !== undefined && asset.type !== criteria.type) {
    return false;
  }

  if (criteria.status !== undefined && asset.status !== criteria.status) {
    return false;
  }

  if (criteria.geo !== undefined && !matchesGeoCriteria(asset, criteria.geo)) {
    return false;
  }

  return true;
}

function matchesGeoCriteria(asset: Asset, geo: AssetGeoCriteria): boolean {
  if (geo.kind === 'bounds') {
    return (
      asset.location.lat >= geo.minLat &&
      asset.location.lat <= geo.maxLat &&
      asset.location.lng >= geo.minLng &&
      asset.location.lng <= geo.maxLng
    );
  }

  return true;
}

function assetToReadModel(asset: Asset): AssetReadModel {
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    status: asset.status,
    lat: asset.location.lat,
    lng: asset.location.lng,
    installedAt: asset.installedAt,
    lastInspectedAt: asset.lastInspectedAt,
    notes: asset.notes,
  };
}
