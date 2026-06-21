import { createApp } from './app.js';
import { env } from './config/env.js';
import { runMigrations } from './db/migrate.js';
import { seedDatabaseIfEmpty } from './db/seed.js';

async function main(): Promise<void> {
  await runMigrations();
  await seedDatabaseIfEmpty();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Backend listening on port ${env.port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});