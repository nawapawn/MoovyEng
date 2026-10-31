/**
 * ============================================================================
 * MoovyEng — Master Playwright Automated Test Runner (E2E & Integration)
 * Runs all POM test suites against http://localhost:3000 and outputs a
 * detailed structured report.
 * ============================================================================
 */
import { chromium } from 'playwright';
import { runSuite01 } from './e2e/01-studio-auth-and-header.spec.js';
import { runSuite02 } from './e2e/02-vocab-crud-and-clips.spec.js';
import { runSuite03 } from './e2e/03-formatting-and-color-lab.spec.js';
import { runSuite04 } from './e2e/04-export-and-mobile-view.spec.js';

async function main() {
  console.log('============================================================================');
  console.log('MoovyEng Automated Playwright E2E & Integration Test Runner');
  console.log('Target URL: http://localhost:3000');
  console.log('============================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  const results = [];

  async function recordResult(testName, fn) {
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      results.push({ testName, status: 'PASSED', durationMs });
      console.log(`[PASS] ${testName} (${durationMs}ms)`);
    } catch (error) {
      const durationMs = Date.now() - start;
      results.push({
        testName,
        status: 'FAILED',
        durationMs,
        error: error.message
      });
      console.log(`[FAIL] ${testName} (${durationMs}ms)`);
      console.log(`       Reason: ${error.message}\n`);
    }
  }

  try {
    await runSuite01(page, recordResult);
    await runSuite02(page, recordResult);
    await runSuite03(page, recordResult);
    await runSuite04(page, recordResult);
  } finally {
    await browser.close();
  }

  const passed = results.filter((r) => r.status === 'PASSED').length;
  const failed = results.filter((r) => r.status === 'FAILED').length;

  console.log('\n============================================================================');
  console.log(`SUMMARY: Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Runtime Page Errors: ${pageErrors.length}`);
  console.log('============================================================================');

  if (failed > 0 || pageErrors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
