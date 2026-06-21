import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export function createPool(connectionString: string): pg.Pool {
  return new Pool({ connectionString });
}

export const pool = createPool(env.databaseUrl);
