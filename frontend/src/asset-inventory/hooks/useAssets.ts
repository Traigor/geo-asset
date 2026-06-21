import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createAsset as apiCreateAsset,
  deleteAsset as apiDeleteAsset,
  listAssets,
  updateAsset as apiUpdateAsset,
} from '../api/assetApi';
import type {
  Asset,
  AssetFilters,
  CreateAssetPayload,
  ListAssetsParams,
  PaginatedAssets,
  UpdateAssetPayload,
} from '../model/assetTypes';
import { getApiErrorMessage } from '../../shared/api/httpClient';

export type DrawerMode = 'closed' | 'details' | 'create' | 'edit';

export type PickedLocation = {
  lat: number;
  lng: number;
};

export type UseAssetsResult = {
  assets: Asset[];
  page: number;
  pageSize: number;
  total: number;
  filters: AssetFilters;
  selectedAsset: Asset | null;
  drawerMode: DrawerMode;
  pickedLocation: PickedLocation | null;
  isPickedLocationPreviewVisible: boolean;
  isPickingLocation: boolean;
  isLoading: boolean;
  error: string | null;
  mutationError: string | null;
  isMutating: boolean;
  setFilters(filters: AssetFilters): void;
  setPage(page: number): void;
  selectAsset(asset: Asset): void;
  openCreate(): void;
  openEdit(asset: Asset): void;
  closeDrawer(): void;
  startPickingLocation(): void;
  pickLocation(location: PickedLocation): void;
  createAsset(payload: CreateAssetPayload): Promise<void>;
  updateAsset(id: string, payload: UpdateAssetPayload): Promise<void>;
  deleteAsset(id: string): Promise<void>;
  reload(): Promise<void>;
};

const defaultPage = 1;
const defaultPageSize = 50;

export function useAssets(): UseAssetsResult {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [page, setPage] = useState(defaultPage);
  const [pageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);
  const [filters, setFiltersState] = useState<AssetFilters>({});
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('closed');
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(null);
  const [isPickedLocationPreviewVisible, setIsPickedLocationPreviewVisible] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);  

  const listParams = useMemo(
    () => buildListParams(filters, page, pageSize),
    [filters, page, pageSize],
  );

  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listAssets(listParams);
      applyPageResult(result, setAssets, setPage, setTotal);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [listParams]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setFilters = useCallback((nextFilters: AssetFilters): void => {
    setPage(defaultPage);
    setFiltersState(nextFilters);
  }, []);

  const selectAsset = useCallback((asset: Asset): void => {
    setMutationError(null);
    setSelectedAsset(asset);
    setDrawerMode('details');
    setPickedLocation({ lat: asset.lat, lng: asset.lng });
    setIsPickedLocationPreviewVisible(false);
    setIsPickingLocation(false);
  }, []);

  const openCreate = useCallback((): void => {
    setMutationError(null);
    setSelectedAsset(null);
    setDrawerMode('create');
    setPickedLocation(null);
    setIsPickedLocationPreviewVisible(false);
    setIsPickingLocation(true);
  }, []);

  const openEdit = useCallback((asset: Asset): void => {
    setMutationError(null);
    setSelectedAsset(asset);
    setDrawerMode('edit');
    setPickedLocation({ lat: asset.lat, lng: asset.lng });
    setIsPickedLocationPreviewVisible(false);
    setIsPickingLocation(false);
  }, []);

  const closeDrawer = useCallback((): void => {
    setMutationError(null);
    setDrawerMode('closed');
    setIsPickedLocationPreviewVisible(false);
    setIsPickingLocation(false);
  }, []);

  const startPickingLocation = useCallback((): void => {
    setIsPickingLocation(true);
  }, []);

  const pickLocation = useCallback((location: PickedLocation): void => {
    setPickedLocation(location);
    setIsPickedLocationPreviewVisible(true);
    setIsPickingLocation(false);
  }, []);

  const createAsset = useCallback(
    async (payload: CreateAssetPayload): Promise<void> => {
      setMutationError(null);
      setIsMutating(true);

      try {
        const created = await apiCreateAsset(payload);
        setSelectedAsset(created);
        setDrawerMode('details');
        setIsPickedLocationPreviewVisible(false);
        await reload();
      } catch (requestError) {
        setMutationError(getApiErrorMessage(requestError));
      } finally {
        setIsMutating(false);
      }
    },
    [reload],
  );

  const updateAsset = useCallback(
    async (id: string, payload: UpdateAssetPayload): Promise<void> => {
      setMutationError(null);
      setIsMutating(true);

      try {
        const updated = await apiUpdateAsset(id, payload);
        setSelectedAsset(updated);
        setDrawerMode('details');
        setIsPickedLocationPreviewVisible(false);
        await reload();
      } catch (requestError) {
        setMutationError(getApiErrorMessage(requestError));
      } finally {
        setIsMutating(false);
      }
    },
    [reload],
  );

  const deleteAsset = useCallback(
    async (id: string): Promise<void> => {
      setMutationError(null);
      setIsMutating(true);

      try {
        await apiDeleteAsset(id);
        setSelectedAsset(null);
        setDrawerMode('closed');
        setIsPickedLocationPreviewVisible(false);
        await reload();
      } catch (requestError) {
        setMutationError(getApiErrorMessage(requestError));
      } finally {
        setIsMutating(false);
      }
    },
    [reload],
  );

  return {
    assets,
    page,
    pageSize,
    total,
    filters,
    selectedAsset,
    drawerMode,
    pickedLocation,
    isPickedLocationPreviewVisible,
    isPickingLocation,
    isLoading,
    error,
    mutationError,
    isMutating,
    setFilters,
    setPage,
    selectAsset,
    openCreate,
    openEdit,
    closeDrawer,
    startPickingLocation,
    pickLocation,
    createAsset,
    updateAsset,
    deleteAsset,
    reload,
  };
}

function buildListParams(filters: AssetFilters, page: number, pageSize: number): ListAssetsParams {
  const params: ListAssetsParams = { page, pageSize };

  if (filters.type !== undefined) params.type = filters.type;
  if (filters.status !== undefined) params.status = filters.status;
  if (filters.sortBy !== undefined) params.sortBy = filters.sortBy;
  if (filters.sortDirection !== undefined) params.sortDirection = filters.sortDirection;
  if (filters.near !== undefined) params.near = filters.near;
  if (filters.bounds !== undefined) params.bounds = filters.bounds;

  return params;
}

function applyPageResult(
  result: PaginatedAssets,
  setAssets: (assets: Asset[]) => void,
  setPage: (page: number) => void,
  setTotal: (total: number) => void,
): void {
  setAssets(result.data);
  setPage(result.page);
  setTotal(result.total);
}
