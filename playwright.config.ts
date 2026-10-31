/**
 * ============================================================================
 * MoovyEng — Multi-Device Playwright Configuration (Desktop & Mobile)
 * Supports Desktop (1920x1080 Chrome/Firefox) and Mobile (iPhone 14 Pro / Pixel 7)
 * ============================================================================
 */
import { defineConfig, devices } from 'playwright';

export default defineConfig({
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
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'Desktop Chrome (1920x1080)',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      }
    },
    {
      name: 'Desktop Firefox (1920x1080)',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      }
    },
    {
      name: 'Mobile Safari (iPhone 14 Pro)',
      use: {
        ...devices['iPhone 14 Pro'],
        viewport: { width: 393, height: 852 },
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'Mobile Chrome (Pixel 7)',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
        isMobile: true,
        hasTouch: true
      }
    }
  ]
});
