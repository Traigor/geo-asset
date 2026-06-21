import { CodedError } from '../../../shared/errors/coded-error.js';

export class DomainError extends CodedError {
  constructor(code: string, message: string, details?: unknown) {
    super(code, message, details);
    this.name = 'DomainError';
  }
}
