import { DomainError } from './domain-error.js';

export class InvalidAssetTypeError extends DomainError {
  constructor() {
    super('INVALID_ASSET_TYPE', 'Asset type is invalid');
  }
}
