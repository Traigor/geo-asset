import { DomainError } from './domain-error.js';

export class LastInspectedBeforeInstalledError extends DomainError {
  constructor() {
    super('LAST_INSPECTED_BEFORE_INSTALLED', 'Last inspected date cannot be before installed date');
  }
}
