import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssetMap } from './AssetMap';
import type { Asset } from '../model/assetTypes';

const flyToMock = vi.hoisted(() => vi.fn());

vi.mock('react-leaflet', async () => {
  const React = await import('react');
  type ChildrenProps = { children?: React.ReactNode };
  type MarkerProps = ChildrenProps & {
    center?: [number, number];
    pathOptions?: {
      fillColor?: string;
      fillOpacity?: number;
    };
  };

  return {
    CircleMarker: ({ children, center, pathOptions }: MarkerProps) => (
      <div
        data-testid="circle-marker"
        data-center={center === undefined ? '' : center.join(',')}
        data-fill-color={pathOptions?.fillColor ?? ''}
        data-fill-opacity={pathOptions?.fillOpacity ?? ''}
      >
        {children}
      </div>
    ),
    MapContainer: ({ children }: ChildrenProps) => <div>{children}</div>,
    Popup: ({ children }: ChildrenProps) => <div>{children}</div>,
    TileLayer: () => <div />,
    useMap: () => ({
      fitBounds: vi.fn(),
      flyTo: flyToMock,
      getBounds: () => ({
        getSouth: () => 40,
        getWest: () => -75,
        getNorth: () => 45,
        getEast: () => -70,
      }),
    }),
    useMapEvents: vi.fn(),
  };
});

describe('AssetMap', () => {
  afterEach(() => {
    flyToMock.mockClear();
  });

  it('does not render search area while picking a location', () => {
    render(
      <AssetMap
        assets={[]}
        selectedAsset={null}
        selectedAssetId={undefined}
        isPickingLocation
        fitAssets
        pickedLocationPreview={null}
        onSelectAsset={() => undefined}
        onPickLocation={() => undefined}
        onSearchArea={() => undefined}
      />,
    );

    expect(screen.queryByRole('button', { name: /search area/i })).not.toBeInTheDocument();
  });

  it('renders search area when not picking a location', () => {
    render(
      <AssetMap
        assets={[assetFixture]}
        selectedAsset={null}
        selectedAssetId={undefined}
        isPickingLocation={false}
        fitAssets
        pickedLocationPreview={null}
        onSelectAsset={() => undefined}
        onPickLocation={() => undefined}
        onSearchArea={() => undefined}
      />,
    );

    expect(screen.getByRole('button', { name: /search area/i })).toBeInTheDocument();
  });

  it('renders a transparent temporary marker at the picked location using the draft status color', () => {
    render(
      <AssetMap
        assets={[]}
        selectedAsset={null}
        selectedAssetId={undefined}
        isPickingLocation={false}
        fitAssets
        pickedLocationPreview={{ lat: 40, lng: -75, status: 'critical' }}
        onSelectAsset={() => undefined}
        onPickLocation={() => undefined}
        onSearchArea={() => undefined}
      />,
    );

    const marker = screen.getByTestId('circle-marker');

    expect(marker).toHaveAttribute('data-center', '40,-75');
    expect(marker).toHaveAttribute('data-fill-color', '#d32f2f');
    expect(marker).toHaveAttribute('data-fill-opacity', '0.45');
    expect(screen.getByText(/picked location/i)).toBeInTheDocument();
  });

  it('zooms to the selected asset', () => {
    render(
      <AssetMap
        assets={[assetFixture]}
        selectedAsset={assetFixture}
        selectedAssetId={assetFixture.id}
        isPickingLocation={false}
        fitAssets={false}
        pickedLocationPreview={null}
        onSelectAsset={() => undefined}
        onPickLocation={() => undefined}
        onSearchArea={() => undefined}
      />,
    );

    expect(flyToMock).toHaveBeenCalledWith([assetFixture.lat, assetFixture.lng], 14, {
      duration: 0.6,
    });
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
