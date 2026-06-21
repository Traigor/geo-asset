import { Router } from 'express';
import { emptySchema, validateRequest } from '../../../shared/http/validate-request.js';
import type { AssetController } from './asset.controller.js';
import {
  assetIdParamsSchema,
  createAssetBodySchema,
  listAssetsQuerySchema,
  updateAssetBodySchema,
} from './asset.schemas.js';

export function createAssetRouter(controller: AssetController): Router {
  const router = Router();

  router.get(
    '/',
    validateRequest(
      { params: emptySchema, query: listAssetsQuerySchema, body: emptySchema },
      controller.list,
    ),
  );

  router.get(
    '/:id',
    validateRequest(
      { params: assetIdParamsSchema, query: emptySchema, body: emptySchema },
      controller.getById,
    ),
  );

  router.post(
    '/',
    validateRequest(
      { params: emptySchema, query: emptySchema, body: createAssetBodySchema },
      controller.create,
    ),
  );

  router.patch(
    '/:id',
    validateRequest(
      { params: assetIdParamsSchema, query: emptySchema, body: updateAssetBodySchema },
      controller.update,
    ),
  );

  router.delete(
    '/:id',
    validateRequest(
      { params: assetIdParamsSchema, query: emptySchema, body: emptySchema },
      controller.delete,
    ),
  );

  return router;
}
