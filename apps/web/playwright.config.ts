import { defineConfig, devices } from '@playwright/test';

/**
 * Go-live proof specs (DR-905) run ONLY under the dedicated `golive-proof`
 * project (retries: 0 — a retried pass never counts as GREEN) with the
 * `golive-cleanup` teardown project asserting zero residual test rows.
 * They are excluded from the general browser matrix so the repo-wide
 * `retries: CI ? 2 : 0` policy can never apply to them.
 */
const GOLIVE_SPECS = [
  '**/contractor-go-live.spec.ts',
  '**/contractor-flow.spec.ts',
  '**/contractor-dispatch-eligibility.spec.ts',
  '**/golive.cleanup.spec.ts',
];

/**
 * Playwright E2E Testing Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list'],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    /*
     * Go-live proof gate (DR-905): required blocking CI check.
     * retries: 0 overrides the repo-wide `CI ? 2 : 0` — any first-attempt
     * failure fails the gate. `teardown` runs golive-cleanup after the proof
     * finishes (pass or fail) to delete namespaced rows and assert zero residual.
     */
    {
      name: 'golive-proof',
      testMatch: [
        '**/contractor-go-live.spec.ts',
        '**/contractor-flow.spec.ts',
        '**/contractor-dispatch-eligibility.spec.ts',
      ],
      retries: 0,
      timeout: 120_000,
      teardown: 'golive-cleanup',
      // retries: 0 means 'on-first-retry' would never trace. The proof keeps
      // trace + video on every run, pass or fail, as go-live evidence (DR-903).
      use: { ...devices['Desktop Chrome'], trace: 'on', video: 'on' },
    },
    {
      name: 'golive-cleanup',
      testMatch: ['**/golive.cleanup.spec.ts'],
      retries: 0,
      timeout: 120_000,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'chromium',
      testIgnore: GOLIVE_SPECS,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      testIgnore: GOLIVE_SPECS,
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      testIgnore: GOLIVE_SPECS,
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      testIgnore: GOLIVE_SPECS,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      testIgnore: GOLIVE_SPECS,
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers */
    {
      name: 'Microsoft Edge',
      testIgnore: GOLIVE_SPECS,
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      testIgnore: GOLIVE_SPECS,
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Run the dev server before starting the tests (both locally and in CI) */
  webServer: {
    command: 'pnpm exec next dev --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'test-secret-for-ci',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
      DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://smoke:smoke@localhost:5432/smoke_test',
      DIRECT_URL: process.env.DIRECT_URL ?? 'postgresql://smoke:smoke@localhost:5432/smoke_test',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? 'sk_test_dummy_for_ci_e2e',
    },
  },
});
