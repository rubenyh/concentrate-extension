import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: 0,
  // Each test launches its own persistent Chromium context with the extension loaded.
  workers: 2,
  reporter: 'list',
});
