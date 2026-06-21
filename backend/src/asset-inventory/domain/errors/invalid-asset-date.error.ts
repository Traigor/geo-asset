import { DomainError } from './domain-error.js';

export class InvalidAssetDateError extends DomainError {
  constructor(label: string, reason: 'format' | 'value') {
    const message =
      reason === 'format' ? `${label} must be an ISO date string` : `${label} must be a valid date`;
    super('INVALID_DATE', message);
  }
}
