import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngBoundsExpression, LeafletMouseEvent } from 'leaflet';
import { cn } from '../../shared/ui/classNames';
import type { Asset, AssetStatus, BoundsFilter } from '../model/assetTypes';

export type PickedLocationPreview = {
  lat: number;
  lng: number;
  status: AssetStatus;
};

type AssetMapProps = {
  assets: Asset[];
  selectedAsset: Asset | null;
  selectedAssetId: string | undefined;
  isPickingLocation: boolean;
  fitAssets: boolean;
  pickedLocationPreview: PickedLocationPreview | null;
  onSelectAsset(asset: Asset): void;
  onPickLocation(location: { lat: number; lng: number }): void;
  onSearchArea(bounds: BoundsFilter): void;
};

const statusMarkerColors: Record<AssetStatus, string> = {
  ok: '#2e7d32',
  warning: '#ed6c02',
  critical: '#d32f2f',
};

export function AssetMap({
  assets,
  selectedAsset,
  selectedAssetId,
  isPickingLocation,
  fitAssets,
  pickedLocationPreview,
  onSelectAsset,
  onPickLocation,
  onSearchArea,
}: AssetMapProps): JSX.Element {
  return (
    <div
      className={cn(
        'relative min-h-0 min-w-0',
        isPickingLocation &&
          "after:absolute after:top-4 after:left-1/2 after:z-[500] after:-translate-x-1/2 after:rounded-md after:bg-blue-700 after:px-3 after:py-2 after:text-white after:shadow-xl after:content-['Click_the_map_to_set_location']",
      )}
    >
      <MapContainer center={[39.5, -79.5]} zoom={5} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapAreaSearchControl isPickingLocation={isPickingLocation} onSearchArea={onSearchArea} />
        <FitAssetBounds assets={assets} fitAssets={fitAssets} />
        <FlyToSelectedAsset asset={selectedAsset} />
        <PickLocationHandler isPickingLocation={isPickingLocation} onPickLocation={onPickLocation} />
        {pickedLocationPreview === null ? null : (
          <CircleMarker
            center={[pickedLocationPreview.lat, pickedLocationPreview.lng]}
            radius={10}
            pathOptions={{
              color: statusMarkerColors[pickedLocationPreview.status],
              weight: 2,
              fillColor: statusMarkerColors[pickedLocationPreview.status],
              fillOpacity: 0.45,
              opacity: 0.8,
              dashArray: '4 4',
            }}
          >
            <Popup>
              <strong>Picked location</strong>
              <br />
              {pickedLocationPreview.status} · unsaved
            </Popup>
          </CircleMarker>
        )}
        {assets.map((asset) => (
          <CircleMarker
            key={asset.id}
            center={[asset.lat, asset.lng]}
            radius={asset.id === selectedAssetId ? 10 : 7}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: statusMarkerColors[asset.status],
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => onSelectAsset(asset) }}
          >
            <Popup>
              <strong>{asset.name}</strong>
              <br />
              {asset.type} · {asset.status}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

function FlyToSelectedAsset({ asset }: { asset: Asset | null }): null {
  const map = useMap();

  useEffect(() => {
    if (asset === null) {
      return;
    }

    map.flyTo([asset.lat, asset.lng], 14, { duration: 0.6 });
  }, [asset, map]);

  return null;
}

function MapAreaSearchControl({
  isPickingLocation,
  onSearchArea,
}: {
  isPickingLocation: boolean;
  onSearchArea(bounds: BoundsFilter): void;
}): JSX.Element {
  const map = useMap();

  if (isPickingLocation) {
    return <></>;
  }

  return (
    <button
      type="button"
      className="absolute top-4 left-1/2 z-[500] -translate-x-1/2 cursor-pointer rounded-md border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 shadow-xl hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      onClick={(event) => {
        event.stopPropagation();
        const bounds = map.getBounds();
        onSearchArea({
          minLat: bounds.getSouth(),
          minLng: bounds.getWest(),
          maxLat: bounds.getNorth(),
          maxLng: bounds.getEast(),
        });
      }}
    >
      Search Area
    </button>
  );
}

function FitAssetBounds({ assets, fitAssets }: { assets: Asset[]; fitAssets: boolean }): null {
  const map = useMap();

  useEffect(() => {
    if (!fitAssets) {
      return;
    }

    if (assets.length === 0) {
      return;
    }

    const bounds = assets.map((asset) => [asset.lat, asset.lng] as [number, number]);
    map.fitBounds(bounds as LatLngBoundsExpression, { padding: [32, 32] });
  }, [assets, fitAssets, map]);

  return null;
}

function PickLocationHandler({
  isPickingLocation,
  onPickLocation,
}: {
  isPickingLocation: boolean;
  onPickLocation(location: { lat: number; lng: number }): void;
}): null {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      if (isPickingLocation) {
        onPickLocation({ lat: event.latlng.lat, lng: event.latlng.lng });
      }
    },
  });

  return null;
}
