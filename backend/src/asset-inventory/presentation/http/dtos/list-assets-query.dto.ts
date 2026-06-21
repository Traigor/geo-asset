import type { AssetStatus } from '../../../domain/asset-status.js';
import type { AssetType } from '../../../domain/asset-type.js';
import type {
  AssetSortField,
  SortDirection,
} from '../../../application/types/asset-list-criteria.js';

export type ListAssetsQueryDto = {
  page: number;
  pageSize: number;
  type?: AssetType | undefined;
  status?: AssetStatus | undefined;
  sortBy: AssetSortField;
  sortDirection: SortDirection;
  nearLat?: number | undefined;
  nearLng?: number | undefined;
  radiusMeters?: number | undefined;
  minLat?: number | undefined;
  minLng?: number | undefined;
  maxLat?: number | undefined;
  maxLng?: number | undefined;
};
