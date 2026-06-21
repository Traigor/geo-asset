import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url().default('postgres://geo_asset:geo_asset@localhost:55432/geo_asset'),
  TEST_DATABASE_URL: z
    .string()
    .url()
    .default('postgres://geo_asset:geo_asset@localhost:55433/geo_asset_test'),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  databaseUrl: parsedEnv.DATABASE_URL,
  testDatabaseUrl: parsedEnv.TEST_DATABASE_URL,
};
