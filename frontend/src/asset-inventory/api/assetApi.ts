import { httpClient } from '../../shared/api/httpClient';
import type {
  Asset,
  CreateAssetPayload,
  ListAssetsParams,
  PaginatedAssets,
  UpdateAssetPayload,
} from '../model/assetTypes';

export async function listAssets(params: ListAssetsParams): Promise<PaginatedAssets> {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('pageSize', String(params.pageSize));

  if (params.type !== undefined) search.set('type', params.type);
  if (params.status !== undefined) search.set('status', params.status);
  if (params.sortBy !== undefined) search.set('sortBy', params.sortBy);
  if (params.sortDirection !== undefined) search.set('sortDirection', params.sortDirection);

  if (params.near !== undefined) {
    search.set('nearLat', String(params.near.lat));
    search.set('nearLng', String(params.near.lng));
    search.set('radiusMeters', String(params.near.radiusMeters));
  }

  if (params.bounds !== undefined) {
    search.set('minLat', String(params.bounds.minLat));
    search.set('minLng', String(params.bounds.minLng));
    search.set('maxLat', String(params.bounds.maxLat));
    search.set('maxLng', String(params.bounds.maxLng));
  }

  return httpClient<PaginatedAssets>(`/assets?${search.toString()}`);
}

export async function getAsset(id: string): Promise<Asset> {
  return httpClient<Asset>(`/assets/${id}`);
}

export async function createAsset(payload: CreateAssetPayload): Promise<Asset> {
  return httpClient<Asset>('/assets', {
    method: 'POST',
    body: payload,
  });
}

export async function updateAsset(id: string, payload: UpdateAssetPayload): Promise<Asset> {
  return httpClient<Asset>(`/assets/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteAsset(id: string): Promise<void> {
  await httpClient<void>(`/assets/${id}`, { method: 'DELETE' });
}
