import { describe, expect, it } from 'vitest';
import { Asset } from '../../domain/asset.js';
import type { AssetResponseDto } from './dtos/asset-response.dto.js';
import type { PaginatedAssetsResponseDto } from './dtos/paginated-assets-response.dto.js';
import { mapAssetToDto, mapPaginatedAssetsToDto } from './asset.mappers.js';

describe('asset HTTP mappers', () => {
  it('maps an asset to a response DTO', () => {
    const asset = Asset.create({
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

    const dto: AssetResponseDto = mapAssetToDto(asset);

    expect(dto).toEqual({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      status: asset.status,
      lat: asset.location.lat,
      lng: asset.location.lng,
      installed_at: asset.installedAt,
      last_inspected_at: asset.lastInspectedAt,
      notes: asset.notes,
    });
  });

  it('maps paginated assets to a paginated response DTO', () => {
    const asset = Asset.create({
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

    const dto: PaginatedAssetsResponseDto = mapPaginatedAssetsToDto({
      data: [asset],
      page: 1,
      pageSize: 50,
      total: 1,
    });

    expect(dto.data).toHaveLength(1);
    expect(dto.page).toBe(1);
    expect(dto.pageSize).toBe(50);
    expect(dto.total).toBe(1);
  });
});
