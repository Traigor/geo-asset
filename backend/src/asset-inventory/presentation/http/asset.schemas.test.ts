import { describe, expect, it } from 'vitest';
import {
  createAssetBodySchema,
  listAssetsQuerySchema,
  updateAssetBodySchema,
} from './asset.schemas.js';

describe('asset HTTP schemas', () => {
  it('defaults list pagination', () => {
    const parsed = listAssetsQuerySchema.parse({});

    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(50);
    expect(parsed.sortBy).toBe('installed_at');
    expect(parsed.sortDirection).toBe('desc');
  });

  it('accepts valid sort options', () => {
    const parsed = listAssetsQuerySchema.parse({
      sortBy: 'name',
      sortDirection: 'asc',
    });

    expect(parsed.sortBy).toBe('name');
    expect(parsed.sortDirection).toBe('asc');
  });

  it('rejects incomplete radius query', () => {
    expect(() => listAssetsQuerySchema.parse({ nearLat: '42.36' })).toThrow(
      'nearLat, nearLng, and radiusMeters must be provided together',
    );
  });

  it('accepts valid map bounds query parameters', () => {
    const parsed = listAssetsQuerySchema.parse({
      minLat: '40',
      minLng: '-75',
      maxLat: '45',
      maxLng: '-70',
    });

    expect(parsed.minLat).toBe(40);
    expect(parsed.minLng).toBe(-75);
    expect(parsed.maxLat).toBe(45);
    expect(parsed.maxLng).toBe(-70);
  });

  it('rejects incomplete map bounds query', () => {
    expect(() => listAssetsQuerySchema.parse({ minLat: '40', minLng: '-75' })).toThrow(
      'minLat, minLng, maxLat, and maxLng must be provided together',
    );
  });

  it('rejects reversed map bounds query', () => {
    expect(() =>
      listAssetsQuerySchema.parse({
        minLat: '45',
        minLng: '-75',
        maxLat: '40',
        maxLng: '-70',
      }),
    ).toThrow('minLat must be less than or equal to maxLat');
    expect(() =>
      listAssetsQuerySchema.parse({
        minLat: '40',
        minLng: '-70',
        maxLat: '45',
        maxLng: '-75',
      }),
    ).toThrow('minLng must be less than or equal to maxLng');
  });

  it('rejects combining radius and map bounds query parameters', () => {
    expect(() =>
      listAssetsQuerySchema.parse({
        nearLat: '42.36',
        nearLng: '-71.06',
        radiusMeters: '5000',
        minLat: '40',
        minLng: '-75',
        maxLat: '45',
        maxLng: '-70',
      }),
    ).toThrow('Radius and map bounds filters cannot be combined');
  });

  it('rejects invalid enum filters', () => {
    expect(() => listAssetsQuerySchema.parse({ type: 'meter' })).toThrow();
    expect(() => listAssetsQuerySchema.parse({ sortBy: 'status' })).toThrow();
    expect(() => listAssetsQuerySchema.parse({ sortDirection: 'oldest' })).toThrow();
  });

  it('accepts a valid create body', () => {
    const parsed = createAssetBodySchema.parse({
      name: 'Sensor S-0001',
      type: 'sensor',
      status: 'ok',
      lat: 42.3601,
      lng: -71.0589,
      installed_at: '2020-01-10',
      last_inspected_at: null,
      notes: '',
    });

    expect(parsed.name).toBe('Sensor S-0001');
  });

  it('rejects an empty patch body', () => {
    expect(() => updateAssetBodySchema.parse({})).toThrow(
      'At least one field must be provided',
    );
  });
});
