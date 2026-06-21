import { ApplicationError } from './application-error.js';

export class AssetNotFoundError extends ApplicationError {
  constructor(id: string) {
    super('ASSET_NOT_FOUND', `Asset ${id} was not found`);
  }
}
