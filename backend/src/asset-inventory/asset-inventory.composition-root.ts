import type { Router } from 'express';
import type pg from 'pg';
import { CreateAssetHandler } from './application/command-handlers/create-asset.handler.js';
import { DeleteAssetHandler } from './application/command-handlers/delete-asset.handler.js';
import { UpdateAssetHandler } from './application/command-handlers/update-asset.handler.js';
import { GetAssetHandler } from './application/query-handlers/get-asset.handler.js';
import { ListAssetsHandler } from './application/query-handlers/list-assets.handler.js';
import {
  PostgresAssetReadRepository,
  PostgresAssetWriteRepository,
} from './infrastructure/postgres/postgres-asset.repository.js';
import { AssetController } from './presentation/http/asset.controller.js';
import { createAssetRouter } from './presentation/http/asset.routes.js';

export function createAssetInventoryRouter(dbPool: pg.Pool): Router {
  const readRepository = new PostgresAssetReadRepository(dbPool);
  const writeRepository = new PostgresAssetWriteRepository(dbPool);
  const controller = new AssetController(
    new ListAssetsHandler(readRepository),
    new GetAssetHandler(readRepository),
    new CreateAssetHandler(writeRepository),
    new UpdateAssetHandler(writeRepository),
    new DeleteAssetHandler(writeRepository),
  );

  return createAssetRouter(controller);
}
