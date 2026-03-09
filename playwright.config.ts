import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3333',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx serve playground -p 3333',
    port: 3333,
    reuseExistingServer: !process.env.CI,
  },
});
