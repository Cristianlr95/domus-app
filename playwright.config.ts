import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:8100',
    trace: 'on-first-retry',
  },
  webServer: process.env['PW_NO_SERVER'] ? undefined : {
    command: 'node scripts/e2e-server.mjs',
    url: 'http://127.0.0.1:8100',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
