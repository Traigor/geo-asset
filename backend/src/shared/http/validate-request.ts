import type { Request, RequestHandler, Response } from 'express';
import { z } from 'zod';

export type EmptyRequest = Record<string, never>;

export const emptySchema = z.object({}).strict();

export type ValidatedRequest<TParams, TQuery, TBody> = {
  params: TParams;
  query: TQuery;
  body: TBody;
};

export type ValidatedHandler<TParams, TQuery, TBody> = (
  req: Request,
  res: Response,
  validated: ValidatedRequest<TParams, TQuery, TBody>,
) => Promise<void> | void;

type Parser<T> = {
  parse(data: object): T;
};

export function validateRequest<TParams, TQuery, TBody>(
  schemas: {
    params: Parser<TParams>;
    query: Parser<TQuery>;
    body: Parser<TBody>;
  },
  handler: ValidatedHandler<TParams, TQuery, TBody>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => {
        const validated = {
          params: schemas.params.parse(req.params),
          query: schemas.query.parse(req.query),
          body: schemas.body.parse(req.body),
        };

        return handler(req, res, validated);
      })
      .then(() => undefined)
      .catch(next);
  };
}
