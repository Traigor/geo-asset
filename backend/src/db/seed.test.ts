import { access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { seedPath } from './seed.js';

const backendRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('seedPath', () => {
  it('points to the backend-owned seed file', async () => {
    expect(seedPath).toBe(join(backendRoot, 'seed/seed.json'));
    await expect(access(seedPath)).resolves.toBeUndefined();
  });
});
