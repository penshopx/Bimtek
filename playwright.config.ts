import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (existsSync('/repl/tools/bin/chromium') ? '/repl/tools/bin/chromium' : undefined);

// Use the existing development workflow, not a second Next.js server.
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['quiz-retry.built.spec.js', 'quiz-order-preference.built.spec.js', 'quiz-edit-clear-attempts.built.spec.js'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: 'list',
  use: {
    baseURL: process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://127.0.0.1:5000',
    browserName: 'chromium',
    launchOptions: { executablePath: chromiumPath },
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
