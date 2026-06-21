import cors from 'cors';
import express from 'express';
import type pg from 'pg';
import { createAssetInventoryRouter } from './asset-inventory/asset-inventory.composition-root.js';
import { pool as defaultPool } from './db/pool.js';
import { errorHandler } from './shared/errors/error-handler.js';

export function createApp(dbPool: pg.Pool = defaultPool): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/assets', createAssetInventoryRouter(dbPool));
  app.use(errorHandler);

  return app;
}
