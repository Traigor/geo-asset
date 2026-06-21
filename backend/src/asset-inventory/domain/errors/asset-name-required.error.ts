import { DomainError } from './domain-error.js';

export class AssetNameRequiredError extends DomainError {
  constructor() {
    super('ASSET_NAME_REQUIRED', 'Asset name is required');
  }
}
