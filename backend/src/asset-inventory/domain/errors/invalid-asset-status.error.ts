import { DomainError } from './domain-error.js';

export class InvalidAssetStatusError extends DomainError {
  constructor() {
    super('INVALID_ASSET_STATUS', 'Asset status is invalid');
  }
}
