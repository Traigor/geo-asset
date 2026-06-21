import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Asset } from '../model/assetTypes';
import { createAsset, deleteAsset, listAssets, updateAsset } from '../api/assetApi';
import { useAssets } from './useAssets';

vi.mock('../api/assetApi', () => ({
  listAssets: vi.fn(),
  createAsset: vi.fn(),
  updateAsset: vi.fn(),
  deleteAsset: vi.fn(),
}));

const listAssetsMock = vi.mocked(listAssets);
const createAssetMock = vi.mocked(createAsset);
const updateAssetMock = vi.mocked(updateAsset);
const deleteAssetMock = vi.mocked(deleteAsset);

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAssets', () => {
  it('loads assets on mount', async () => {
    listAssetsMock.mockResolvedValue({ data: [assetFixture], page: 1, pageSize: 50, total: 1 });

    const { result } = renderHook(() => useAssets());

    await waitFor(() => expect(result.current.assets).toEqual([assetFixture]));
    expect(listAssetsMock).toHaveBeenCalledWith({ page: 1, pageSize: 50 });
  });

  it('reloads when filters change', async () => {
    listAssetsMock.mockResolvedValue({ data: [], page: 1, pageSize: 50, total: 0 });
    const { result } = renderHook(() => useAssets());

    await waitFor(() => expect(listAssetsMock).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.setFilters({
        type: 'sensor',
        status: 'warning',
        sortBy: 'name',
        sortDirection: 'asc',
        bounds: { minLat: 40, minLng: -75, maxLat: 45, maxLng: -70 },
      });
    });

    await waitFor(() =>
      expect(listAssetsMock).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 50,
        type: 'sensor',
        status: 'warning',
        sortBy: 'name',
        sortDirection: 'asc',
        bounds: { minLat: 40, minLng: -75, maxLat: 45, maxLng: -70 },
      }),
    );
  });

  it('reloads after creating an asset', async () => {
    listAssetsMock.mockResolvedValue({ data: [], page: 1, pageSize: 50, total: 0 });
    createAssetMock.mockResolvedValue(assetFixture);
    const { result } = renderHook(() => useAssets());

    await waitFor(() => expect(listAssetsMock).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.createAsset({
        name: assetFixture.name,
        type: assetFixture.type,
        status: assetFixture.status,
        lat: assetFixture.lat,
        lng: assetFixture.lng,
        installed_at: assetFixture.installed_at,
        last_inspected_at: assetFixture.last_inspected_at,
        notes: assetFixture.notes,
      });
    });

    expect(createAssetMock).toHaveBeenCalledOnce();
    expect(listAssetsMock).toHaveBeenCalledTimes(2);
  });

  it('tracks when a picked location should be previewed on the map', async () => {
    listAssetsMock.mockResolvedValue({ data: [], page: 1, pageSize: 50, total: 0 });
    const { result } = renderHook(() => useAssets());

    await waitFor(() => expect(listAssetsMock).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.openEdit(assetFixture);
    });

    expect(result.current.pickedLocation).toEqual({ lat: assetFixture.lat, lng: assetFixture.lng });
    expect(result.current.isPickedLocationPreviewVisible).toBe(false);

    act(() => {
      result.current.pickLocation({ lat: 40, lng: -75 });
    });

    expect(result.current.pickedLocation).toEqual({ lat: 40, lng: -75 });
    expect(result.current.isPickedLocationPreviewVisible).toBe(true);

    act(() => {
      result.current.closeDrawer();
    });

    expect(result.current.isPickedLocationPreviewVisible).toBe(false);
  });

  it('tracks API errors', async () => {
    listAssetsMock.mockRejectedValue(new Error('network failed'));

    const { result } = renderHook(() => useAssets());

    await waitFor(() => expect(result.current.error).toBe('network failed'));
  });
});

const assetFixture: Asset = {
  id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
  name: 'Sensor S-0001',
  type: 'sensor',
  status: 'ok',
  lat: 42.36,
  lng: -71.06,
  installed_at: '2020-01-10',
  last_inspected_at: null,
  notes: '',
};
