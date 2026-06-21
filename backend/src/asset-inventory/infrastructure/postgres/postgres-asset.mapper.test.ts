import { describe, expect, it } from 'vitest';
import { Asset } from '../../domain/asset.js';
import { toDomain, toPersistence, toReadModel, type AssetRow } from './postgres-asset.mapper.js';

const row: AssetRow = {
  id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
  name: 'Sensor S-0001',
  type: 'sensor',
  status: 'ok',
  lat: 42.3601,
  lng: -71.0589,
  installed_at: '2020-01-10',
  last_inspected_at: '2024-05-20',
  notes: 'near north entrance',
};

describe('postgres asset mapper', () => {
  it('maps a database row to the asset domain model', () => {
    const asset = toDomain(row);

    expect(asset).toBeInstanceOf(Asset);
    expect(asset.id).toBe(row.id);
    expect(asset.location.lat).toBe(row.lat);
    expect(asset.installedAt).toBe('2020-01-10');
  });

  it('maps a database row to an asset read model', () => {
    expect(toReadModel(row)).toEqual({
      id: row.id,
      name: row.name,
      type: row.type,
      status: row.status,
      lat: row.lat,
      lng: row.lng,
      installedAt: '2020-01-10',
      lastInspectedAt: '2024-05-20',
      notes: row.notes,
    });
  });

  it('maps an asset domain model to persistence primitives', () => {
    const asset = toDomain(row);

    expect(toPersistence(asset)).toEqual({
      id: row.id,
      name: row.name,
      type: row.type,
      status: row.status,
      lat: row.lat,
      lng: row.lng,
      installedAt: '2020-01-10',
      lastInspectedAt: '2024-05-20',
      notes: row.notes,
    });
  });
});
