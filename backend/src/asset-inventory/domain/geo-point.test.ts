import { describe, expect, it } from 'vitest';
import {
  LatitudeNotFiniteError,
  LatitudeOutOfRangeError,
  LongitudeNotFiniteError,
  LongitudeOutOfRangeError,
} from './asset-errors.js';
import { GeoPoint } from './geo-point.js';

describe('GeoPoint', () => {
  it('creates a point with valid coordinates', () => {
    const point = GeoPoint.create({ lat: 42.3601, lng: -71.0589 });

    expect(point.lat).toBe(42.3601);
    expect(point.lng).toBe(-71.0589);
  });

  it('rejects latitude outside valid range', () => {
    expect(catchError(() => GeoPoint.create({ lat: 91, lng: -71.0589 }))).toBeInstanceOf(
      LatitudeOutOfRangeError,
    );
  });

  it('rejects longitude outside valid range', () => {
    expect(catchError(() => GeoPoint.create({ lat: 42.3601, lng: -181 }))).toBeInstanceOf(
      LongitudeOutOfRangeError,
    );
  });

  it('rejects non-finite coordinates', () => {
    expect(
      catchError(() => GeoPoint.create({ lat: Number.NaN, lng: -71.0589 })),
    ).toBeInstanceOf(
      LatitudeNotFiniteError,
    );
    expect(
      catchError(() => GeoPoint.create({ lat: 42.3601, lng: Number.POSITIVE_INFINITY })),
    ).toBeInstanceOf(LongitudeNotFiniteError);
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
