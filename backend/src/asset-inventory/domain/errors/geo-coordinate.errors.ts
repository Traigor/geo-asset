import { DomainError } from './domain-error.js';

export class LatitudeNotFiniteError extends DomainError {
  constructor() {
    super('LAT_NOT_FINITE', 'Latitude must be a finite number');
  }
}

export class LongitudeNotFiniteError extends DomainError {
  constructor() {
    super('LNG_NOT_FINITE', 'Longitude must be a finite number');
  }
}

export class LatitudeOutOfRangeError extends DomainError {
  constructor() {
    super('LAT_OUT_OF_RANGE', 'Latitude must be between -90 and 90');
  }
}

export class LongitudeOutOfRangeError extends DomainError {
  constructor() {
    super('LNG_OUT_OF_RANGE', 'Longitude must be between -180 and 180');
  }
}
