import { defineConfig, devices } from '@playwright/test';

// ─── Run Timestamp (generated once at config load) ──────────────────────────
const now = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const RUN_TIME     = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const RUN_DATE     = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const RUN_DATETIME = `${RUN_DATE}_${RUN_TIME}`;   // e.g. 2026-05-05_210633
const RUN_ID       = `QARUN_${RUN_TIME}`;          // e.g. QARUN_210633

// Expose to tests via environment so helpers can build screenshot paths
process.env.PLAYWRIGHT_RUN_ID   = RUN_ID;
process.env.PLAYWRIGHT_RUN_TIME = RUN_TIME;

export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if test.only is accidentally left in */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Workers: sequential on CI, parallel locally */
  workers: process.env.CI ? 1 : undefined,

  /* ─── Reporters ──────────────────────────────────────────────────────────
   *  1. HTML  – timestamped folder, opened manually via `npm run report:latest`
   *  2. JSON  – machine-readable, used by the dashboard generator
   *  3. List  – clean terminal output during CI runs
   * ──────────────────────────────────────────────────────────────────────── */
  reporter: [
    ['html', { outputFolder: `playwright-report/${RUN_DATETIME}`, open: 'never' }],
    ['json', { outputFile: `test-results/${RUN_ID}/results.json` }],
    ['list'],
  ],

  /* Exclude boilerplate / template files from runs */
  testIgnore: ['**/example.spec.ts', '**/seed.spec.ts'],

  /* Global timeout per test: 30 s default; complex flows override per-test */
  timeout: 30000,

  use: {
    /* Base URL — use page.goto('/') in all tests */
    baseURL: 'https://www.saucedemo.com',

    /* Authenticated session created by global-setup.ts */
    storageState: 'auth.json',

    /* Trace only on first retry (saves disk space) */
    trace: 'on-first-retry',

    /* Screenshot + video only on failure */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* ─── Browser Projects ───────────────────────────────────────────────────
   *  Chrome, Firefox, Edge — real installed browsers via channel option
   * ──────────────────────────────────────────────────────────────────────── */
  projects: [
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],

  /* Global setup: creates auth.json + timestamped screenshot directories */
  globalSetup: './global-setup.ts',
});
