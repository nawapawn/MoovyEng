// @ts-check
/**
 * ============================================================================
 * MoovyEng — Playwright Configuration
 * ============================================================================
 */
const config = {
  testDir: './tests/e2e',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 }
  }
};

module.exports = config;
