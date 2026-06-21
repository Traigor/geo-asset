import type { Asset } from '../../domain/asset.js';
import type { AssetReadModel } from '../../application/read-models/asset.read-model.js';
import type { Paginated } from '../../application/types/paginated.js';
import type { AssetResponseDto } from './dtos/asset-response.dto.js';
import type { PaginatedAssetsResponseDto } from './dtos/paginated-assets-response.dto.js';

export function mapAssetToDto(asset: Asset | AssetReadModel): AssetResponseDto {
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    status: asset.status,
    lat: assetLat(asset),
    lng: assetLng(asset),
    installed_at: asset.installedAt,
    last_inspected_at: asset.lastInspectedAt,
    notes: asset.notes,
  };
}

export function mapPaginatedAssetsToDto(
  result: Paginated<Asset | AssetReadModel>,
): PaginatedAssetsResponseDto {
  return {
    data: result.data.map(mapAssetToDto),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  };
}

function assetLat(asset: Asset | AssetReadModel): number {
  return 'location' in asset ? asset.location.lat : asset.lat;
}

function assetLng(asset: Asset | AssetReadModel): number {
  return 'location' in asset ? asset.location.lng : asset.lng;
}
