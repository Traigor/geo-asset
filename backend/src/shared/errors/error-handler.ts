import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApplicationError } from '../../asset-inventory/application/errors/application-error.js';
import { DomainError } from '../../asset-inventory/domain/asset-errors.js';
import type { ErrorResponse } from './error-response.js';

export const errorHandler: ErrorRequestHandler = (error: Error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    } satisfies ErrorResponse);
    return;
  }

  if (error instanceof DomainError) {
    res.status(400).json({
      error: {
        code: error.code,
        message: error.message,
      },
    } satisfies ErrorResponse);
    return;
  }

  if (error instanceof ApplicationError) {
    res.status(statusCodeForApplicationError(error)).json({
      error: {
        code: error.code,
        message: error.message,
      },
    } satisfies ErrorResponse);
    return;
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    },
  } satisfies ErrorResponse);
};

function statusCodeForApplicationError(error: ApplicationError): number {
  const statusByCode: Record<string, number> = {
    ASSET_NOT_FOUND: 404,
    ASSET_ALREADY_EXISTS: 409,
  };

  return statusByCode[error.code] ?? 400;
}
