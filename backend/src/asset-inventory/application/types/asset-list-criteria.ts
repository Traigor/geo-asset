import type { AssetStatus } from '../../domain/asset-status.js';
import type { AssetType } from '../../domain/asset-type.js';

export type AssetGeoCriteria =
  | {
      kind: 'radius';
      lat: number;
      lng: number;
      radiusMeters: number;
    }
  | {
      kind: 'bounds';
      minLat: number;
      minLng: number;
      maxLat: number;
      maxLng: number;
    };

export type AssetSortField = 'name' | 'installed_at' | 'last_inspected_at';
export type SortDirection = 'asc' | 'desc';

export type AssetSort = {
  field: AssetSortField;
  direction: SortDirection;
};

export type AssetListCriteria = {
  type?: AssetType;
  status?: AssetStatus;
  page: number;
  pageSize: number;
  geo?: AssetGeoCriteria;
  sort?: AssetSort;
};
