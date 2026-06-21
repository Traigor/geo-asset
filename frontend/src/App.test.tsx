import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { UseAssetsResult } from './asset-inventory/hooks/useAssets';
import { useAssets } from './asset-inventory/hooks/useAssets';
import type { Asset } from './asset-inventory/model/assetTypes';

vi.mock('./asset-inventory/hooks/useAssets', () => ({
  useAssets: vi.fn(),
}));

vi.mock('./asset-inventory/components/AssetMap', () => ({
  AssetMap: () => <div data-testid="asset-map" />,
}));

const useAssetsMock = vi.mocked(useAssets);

describe('App', () => {
  it('renders the asset inventory shell', () => {
    useAssetsMock.mockReturnValue(createAssetState());

    render(<App />);

    expect(screen.getByRole('heading', { name: /asset inventory/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new asset/i })).toBeInTheDocument();
  });

  it('renders the current pagination range', () => {
    useAssetsMock.mockReturnValue(
      createAssetState({
        assets: Array.from({ length: 50 }, (_, index) => createAsset(`asset-${index}`)),
        page: 2,
        pageSize: 50,
        total: 150,
      }),
    );

    render(<App />);

    expect(screen.getByText('51-100 of 150')).toBeInTheDocument();
  });
});

function createAssetState(overrides: Partial<UseAssetsResult> = {}): UseAssetsResult {
  return {
    assets: [],
    page: 1,
    pageSize: 50,
    total: 0,
    filters: {},
    selectedAsset: null,
    drawerMode: 'closed',
    pickedLocation: null,
    isPickedLocationPreviewVisible: false,
    isPickingLocation: false,
    isLoading: false,
    error: null,
    mutationError: null,
    isMutating: false,
    setFilters: () => undefined,
    setPage: () => undefined,
    selectAsset: () => undefined,
    openCreate: () => undefined,
    openEdit: () => undefined,
    closeDrawer: () => undefined,
    startPickingLocation: () => undefined,
    pickLocation: () => undefined,
    createAsset: async () => undefined,
    updateAsset: async () => undefined,
    deleteAsset: async () => undefined,
    reload: async () => undefined,
    ...overrides,
  };
}

function createAsset(id: string): Asset {
  return {
    id,
    name: `Asset ${id}`,
    type: 'sensor',
    status: 'ok',
    lat: 42.36,
    lng: -71.06,
    installed_at: '2020-01-10',
    last_inspected_at: null,
    notes: '',
  };
}
