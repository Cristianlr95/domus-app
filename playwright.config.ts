import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:8100',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm start -- --host=127.0.0.1 --port=8100',
    url: 'http://127.0.0.1:8100',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
