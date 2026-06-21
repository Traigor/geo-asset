import { Asset } from '../../domain/asset.js';
import { isAssetStatus } from '../../domain/asset-status.js';
import { isAssetType } from '../../domain/asset-type.js';
import type { AssetReadModel } from '../../application/read-models/asset.read-model.js';

export type AssetRow = {
  id: string;
  name: string;
  type: string;
  status: string;
  lat: number;
  lng: number;
  installed_at: string | Date;
  last_inspected_at: string | Date | null;
  notes: string;
};

export type AssetPersistence = {
  id: string;
  name: string;
  type: string;
  status: string;
  lat: number;
  lng: number;
  installedAt: string;
  lastInspectedAt: string | null;
  notes: string;
};

export function toDomain(row: AssetRow): Asset {
  assertValidAssetType(row.type);
  assertValidAssetStatus(row.status);

  return Asset.rehydrate({
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    lat: row.lat,
    lng: row.lng,
    installedAt: toDateString(row.installed_at),
    lastInspectedAt: row.last_inspected_at === null ? null : toDateString(row.last_inspected_at),
    notes: row.notes,
  });
}

export function toReadModel(row: AssetRow): AssetReadModel {
  assertValidAssetType(row.type);
  assertValidAssetStatus(row.status);

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    lat: row.lat,
    lng: row.lng,
    installedAt: toDateString(row.installed_at),
    lastInspectedAt: row.last_inspected_at === null ? null : toDateString(row.last_inspected_at),
    notes: row.notes,
  };
}

export function toPersistence(asset: Asset): AssetPersistence {
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    status: asset.status,
    lat: asset.location.lat,
    lng: asset.location.lng,
    installedAt: asset.installedAt,
    lastInspectedAt: asset.lastInspectedAt,
    notes: asset.notes,
  };
}

function assertValidAssetType(type: string): asserts type is AssetReadModel['type'] {
  if (!isAssetType(type)) {
    throw new Error(`Invalid asset type from database: ${type}`);
  }
}

function assertValidAssetStatus(status: string): asserts status is AssetReadModel['status'] {
  if (!isAssetStatus(status)) {
    throw new Error(`Invalid asset status from database: ${status}`);
  }
}

function toDateString(value: string | Date): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}
