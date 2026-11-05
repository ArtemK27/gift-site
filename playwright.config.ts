import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-iphone-16-pro',
      use: {
        viewport: { width: 430, height: 932 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      },
    },
    {
      name: 'desktop-mockup',
      use: {
        viewport: { width: 1280, height: 800 },
        isMobile: false,
        hasTouch: false,
      },
    },
  ],
  webServer: {
    command: 'node ./node_modules/vite/bin/vite.js --port 5173',
    port: 5173,
    reuseExistingServer: true,
    timeout: 60000,
  },
});
