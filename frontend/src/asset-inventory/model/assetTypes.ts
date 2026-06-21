export const assetTypes = ['pipe', 'hydrant', 'sensor', 'valve'] as const;
export const assetStatuses = ['ok', 'warning', 'critical'] as const;

export type AssetType = (typeof assetTypes)[number];
export type AssetStatus = (typeof assetStatuses)[number];
export type AssetSortBy = 'name' | 'installed_at' | 'last_inspected_at';
export type SortDirection = 'asc' | 'desc';

export type Asset = {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  lat: number;
  lng: number;
  installed_at: string;
  last_inspected_at: string | null;
  notes: string;
};

export type PaginatedAssets = {
  data: Asset[];
  page: number;
  pageSize: number;
  total: number;
};

export type RadiusFilter = {
  lat: number;
  lng: number;
  radiusMeters: number;
};

export type BoundsFilter = {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
};

export type AssetFilters = {
  type?: AssetType;
  status?: AssetStatus;
  sortBy?: AssetSortBy;
  sortDirection?: SortDirection;
  near?: RadiusFilter;
  bounds?: BoundsFilter;
};

export type ListAssetsParams = AssetFilters & {
  page: number;
  pageSize: number;
};

export type CreateAssetPayload = Omit<Asset, 'id'>;

export type UpdateAssetPayload = Partial<CreateAssetPayload>;
