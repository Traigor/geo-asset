import { describe, expect, it } from 'vitest';
import { Asset } from './asset.js';
import {
  AssetNameRequiredError,
  InvalidAssetDateError,
  InvalidAssetStatusError,
  InvalidAssetTypeError,
  LastInspectedBeforeInstalledError,
} from './asset-errors.js';
import type { AssetStatus } from './asset-status.js';
import type { AssetType } from './asset-type.js';

const validAssetInput = {
  id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
  name: 'Sensor S-0001',
  type: 'sensor',
  status: 'ok',
  lat: 42.3601,
  lng: -71.0589,
  installedAt: '2020-01-10',
  lastInspectedAt: '2024-05-20',
  notes: 'near north entrance',
} as const;

describe('Asset', () => {
  it('creates an asset from valid input', () => {
    const asset = Asset.create(validAssetInput);

    expect(asset.id).toBe(validAssetInput.id);
    expect(asset.name).toBe(validAssetInput.name);
    expect(asset.type).toBe(validAssetInput.type);
    expect(asset.status).toBe(validAssetInput.status);
    expect(asset.location.lat).toBe(validAssetInput.lat);
    expect(asset.location.lng).toBe(validAssetInput.lng);
    expect(asset.installedAt).toBe(validAssetInput.installedAt);
    expect(asset.lastInspectedAt).toBe(validAssetInput.lastInspectedAt);
    expect(asset.notes).toBe(validAssetInput.notes);
  });

  it('rejects an empty name with a specific domain error', () => {
    expect(catchError(() => Asset.create({ ...validAssetInput, name: '   ' }))).toBeInstanceOf(
      AssetNameRequiredError,
    );
  });

  it('rejects last inspection before installation with a specific domain error', () => {
    expect(
      catchError(() =>
        Asset.create({
          ...validAssetInput,
          installedAt: '2024-01-10',
          lastInspectedAt: '2023-12-31',
        }),
      ),
    ).toBeInstanceOf(LastInspectedBeforeInstalledError);
  });

  it('rejects invalid asset type at runtime with a specific domain error', () => {
    expect(
      catchError(() => Asset.create({ ...validAssetInput, type: 'meter' as AssetType })),
    ).toBeInstanceOf(InvalidAssetTypeError);
  });

  it('rejects invalid asset status at runtime with a specific domain error', () => {
    expect(
      catchError(() => Asset.create({ ...validAssetInput, status: 'offline' as AssetStatus })),
    ).toBeInstanceOf(InvalidAssetStatusError);
  });

  it('rejects invalid date strings with a specific domain error', () => {
    expect(
      catchError(() =>
        Asset.create({
          ...validAssetInput,
          installedAt: '2024-99-99',
        }),
      ),
    ).toBeInstanceOf(InvalidAssetDateError);

    expect(
      catchError(() =>
        Asset.create({
          ...validAssetInput,
          lastInspectedAt: 'yesterday',
        }),
      ),
    ).toBeInstanceOf(InvalidAssetDateError);
  });

  it('defaults notes to an empty string', () => {
    const asset = Asset.create({ ...validAssetInput, notes: undefined });

    expect(asset.notes).toBe('');
  });

  it('updates provided fields and preserves omitted fields', () => {
    const asset = Asset.create(validAssetInput);

    const updated = asset.update({
      status: 'critical',
      lat: 41.8781,
      lng: -87.6298,
      notes: '',
    });

    expect(updated.id).toBe(asset.id);
    expect(updated.name).toBe(asset.name);
    expect(updated.status).toBe('critical');
    expect(updated.location.lat).toBe(41.8781);
    expect(updated.location.lng).toBe(-87.6298);
    expect(updated.notes).toBe('');
  });
});

function catchError(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }

  throw new Error('Expected action to throw');
}
