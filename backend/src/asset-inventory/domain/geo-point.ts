import {
  LatitudeNotFiniteError,
  LatitudeOutOfRangeError,
  LongitudeNotFiniteError,
  LongitudeOutOfRangeError,
} from './asset-errors.js';

export type GeoPointInput = {
  lat: number;
  lng: number;
};

export class GeoPoint {
  private constructor(
    public readonly lat: number,
    public readonly lng: number,
  ) {}

  static create(input: GeoPointInput): GeoPoint {
    if (!Number.isFinite(input.lat)) {
      throw new LatitudeNotFiniteError();
    }

    if (!Number.isFinite(input.lng)) {
      throw new LongitudeNotFiniteError();
    }

    if (input.lat < -90 || input.lat > 90) {
      throw new LatitudeOutOfRangeError();
    }

    if (input.lng < -180 || input.lng > 180) {
      throw new LongitudeOutOfRangeError();
    }

    return new GeoPoint(input.lat, input.lng);
  }
}
