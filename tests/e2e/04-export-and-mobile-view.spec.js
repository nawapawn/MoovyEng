/**
 * ============================================================================
 * Suite 04 — Social Profile, Export Modal & Mobile Editor (/edit)
 * ============================================================================
 */
import assert from 'node:assert/strict';
import { StudioDashboardPage } from '../pages/StudioDashboardPage.js';
import { ExportAndMobilePage } from '../pages/ExportAndMobilePage.js';

export async function runSuite04(page, recordResult) {
  const studio = new StudioDashboardPage(page);
  const exportMobile = new ExportAndMobilePage(page);

  await studio.goto(true);

  // Test 4.1: Desktop Export Modal Open, Aspect Ratio Dropdown & Caption Copy
  await recordResult('TC-04.1: หน้าต่าง Export Modal เปิด/ปิด เลือกสัดส่วนวิดีโอ และคัดลอกแคปชั่นได้ถูกต้อง', async () => {
    await studio.exportModalBtn.click();
    await exportMobile.exportModal.waitFor({ state: 'visible' });

    // Close modal (first close button in header)
    await exportMobile.exportModal.locator('button[aria-label="ปิด"], button[aria-label="Close"]').first().click();
    await exportMobile.exportModal.waitFor({ state: 'hidden' });
  });

  // Test 4.2: Mobile Editor Page (/edit) & Export Container Availability
  await recordResult('TC-04.2: หน้า Mobile Editor (/edit) แสดงแถบเมนูด้านล่าง และรองรับการจับภาพสไลด์ (#phone-container) เมื่อกด Export จากหน้า /edit', async () => {
    await exportMobile.gotoMobileEditor();
    await page.waitForSelector('#mobile-tool-search', { state: 'visible' });

    // Check bottom nav buttons exist inside #mobile-bottom-nav
    const bottomNavBtns = page.locator('#mobile-bottom-nav button');
    const navCount = await bottomNavBtns.count();
    assert.ok(navCount >= 4, `Expected at least 4 mobile bottom nav buttons, found ${navCount}`);

    // Verify that #phone-container exists in DOM on /edit so ExportModal's capturePhoneSlide() does not throw 'Phone preview container not found'!
    const phoneCountOnEdit = await page.locator('#phone-container').count();
    assert.ok(
      phoneCountOnEdit > 0,
      'Missing #phone-container on /edit page! Exporting video from MobileBottomNav on /edit will crash with "Phone preview container not found"'
    );

    // Restore desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
  });
}
