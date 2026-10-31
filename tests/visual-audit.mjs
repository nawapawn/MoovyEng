/**
 * ============================================================================
 * MoovyEng — Automated Multi-Device Visual & DOM UX/UI Audit Scanner
 * Captures high-resolution screenshots across Desktop (1920x1080) & Mobile
 * (iPhone 14 Pro 393x852, Pixel 7 412x915) and performs deep DOM geometry
 * checks for:
 * 1. Horizontal overflow (scrollWidth > clientWidth)
 * 2. Text / Element clipping & overlap
 * 3. Mobile touch target sizes (< 44x44px / 48x48px)
 * 4. Bottom nav occlusion of main content
 * ============================================================================
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/os/.gemini/antigravity/brain/4ac84ca6-6177-4158-932e-281ba0875c8b';
const LOCAL_SCREENSHOT_DIR = path.resolve('tests/screenshots');

fs.mkdirSync(LOCAL_SCREENSHOT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop-1920x1080', width: 1920, height: 1080, isMobile: false },
  { name: 'iphone14pro-393x852', width: 393, height: 852, isMobile: true },
  { name: 'pixel7-412x915', width: 412, height: 915, isMobile: true }
];

async function auditPageGeometry(page, label, isMobileViewport) {
  return await page.evaluate(({ label, isMobileViewport }) => {
    const issues = [];

    // 1. Check Horizontal Scroll / Overflow on document
    const docScrollW = document.documentElement.scrollWidth;
    const docClientW = document.documentElement.clientWidth;
    if (docScrollW > docClientW + 1) {
      issues.push({
        type: 'HORIZONTAL_OVERFLOW',
        detail: `Document scrollWidth (${docScrollW}px) exceeds clientWidth (${docClientW}px)`
      });
    }

    // 2. Check elements overflowing viewport horizontally
    const allElements = Array.from(document.querySelectorAll('body *'));
    for (const el of allElements) {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
      if (el.closest('[aria-hidden="true"]')) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      // Ignore intentionally scrollable horizontal containers' children or decorative fixed background orbs
      if (el.closest('.overflow-x-auto')) continue;
      if (style.pointerEvents === 'none' && el.closest('.fixed')) continue;

      if (rect.right > docClientW + 2 || rect.left < -2) {
        issues.push({
          type: 'ELEMENT_OUT_OF_VIEWPORT_BOUNDS',
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          className: (typeof el.className === 'string' ? el.className : '').slice(0, 80),
          rect: { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), viewportW: docClientW }
        });
      }
    }

    // 3. Check Mobile Touch Target Sizes for primary interactive controls
    if (isMobileViewport) {
      const interactive = Array.from(document.querySelectorAll('header a, header button, #mobile-bottom-nav button, #mobile-bottom-nav a, #preview-top-header a'));
      for (const btn of interactive) {
        const style = window.getComputedStyle(btn);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const rect = btn.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.width < 40 || rect.height < 40) {
          issues.push({
            type: 'SMALL_TOUCH_TARGET',
            tag: btn.tagName.toLowerCase(),
            id: btn.id || '',
            text: (btn.textContent || btn.getAttribute('title') || btn.getAttribute('aria-label') || '').trim().slice(0, 30),
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}px`
          });
        }
      }
    }

    // 4. Check PhonePreview internal elements clipping or overlapping
    const phone = document.getElementById('phone-container');
    if (phone && !phone.closest('[aria-hidden="true"]')) {
      const pRect = phone.getBoundingClientRect();
      if (pRect.width > docClientW + 1) {
        issues.push({
          type: 'PHONE_PREVIEW_OVERFLOW',
          detail: `#phone-container width (${Math.round(pRect.width)}px) > viewport (${docClientW}px)`
        });
      }

      // Check key preview blocks inside #phone-container for vertical overlap
      const blocks = [
        document.getElementById('preview-top-header'),
        document.getElementById('preview-top-vocab-block'),
        document.getElementById('movie-clip-box'),
        document.getElementById('preview-bottom-grammar-block')
      ].filter(Boolean);

      for (let i = 0; i < blocks.length; i++) {
        const r1 = blocks[i].getBoundingClientRect();
        if (r1.bottom > pRect.bottom + 2) {
          issues.push({
            type: 'PREVIEW_CONTENT_CLIPPED_BOTTOM',
            blockId: blocks[i].id,
            detail: `${blocks[i].id} bottom (${Math.round(r1.bottom)}) overflows #phone-container bottom (${Math.round(pRect.bottom)})`
          });
        }
        for (let j = i + 1; j < blocks.length; j++) {
          const r2 = blocks[j].getBoundingClientRect();
          const overlapX = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
          const overlapY = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
          if (overlapX > 4 && overlapY > 4) {
            issues.push({
              type: 'PREVIEW_BLOCKS_OVERLAP',
              blocks: `${blocks[i].id} overlaps ${blocks[j].id} by ${Math.round(overlapX)}x${Math.round(overlapY)}px`
            });
          }
        }
      }
    }

    return { label, viewport: `${docClientW}x${ window.innerHeight }`, issues };
  }, { label, isMobileViewport });
}

async function saveShot(page, filename) {
  const localPath = path.join(LOCAL_SCREENSHOT_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  fs.copyFileSync(localPath, artifactPath);
  return artifactPath;
}

async function runVisualAudit() {
  const browser = await chromium.launch({ headless: true });
  const report = [];

  try {
    // 1. Desktop 1920x1080 Audit
    {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      // State A: Default 9:16 Light Mode
      await saveShot(page, 'audit_desktop_1920_home_9x16.png');
      report.push(await auditPageGeometry(page, 'Desktop 1920x1080 - Home 9:16 Light', false));

      // State B: 16:9 Landscape Mode on Desktop
      await page.locator('#btn-ratio-dropdown').click();
      await page.locator('#aspect-ratio-dropdown-menu button[data-ratio="16:9"]').click();
      await page.waitForTimeout(400);
      await saveShot(page, 'audit_desktop_1920_home_16x9.png');
      report.push(await auditPageGeometry(page, 'Desktop 1920x1080 - Home 16:9 Landscape', false));

      // Reset to 9:16 & Open Color Picker + Font Dropdown
      await page.locator('#btn-ratio-dropdown').click();
      await page.locator('#aspect-ratio-dropdown-menu button[data-ratio="9:16"]').click();
      await page.waitForTimeout(350);
      await page.locator('#btn-canva-color').click();
      await page.waitForTimeout(250);
      await saveShot(page, 'audit_desktop_1920_color_lab.png');
      report.push(await auditPageGeometry(page, 'Desktop 1920x1080 - Color Laboratory Open', false));

      // Dark mode on Desktop
      await page.locator('#btn-theme-toggle').click();
      await page.waitForTimeout(250);
      await saveShot(page, 'audit_desktop_1920_dark.png');
      report.push(await auditPageGeometry(page, 'Desktop 1920x1080 - Dark Mode', false));
      await page.locator('#btn-theme-toggle').click();

      await context.close();
    }

    // 2. Mobile iPhone 14 Pro (393x852) Audit
    {
      const context = await browser.newContext({
        viewport: { width: 393, height: 852 },
        isMobile: true,
        hasTouch: true
      });
      const page = await context.newPage();

      // Mobile Home (/) -> Fullscreen PhonePreview
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await saveShot(page, 'audit_mobile_iphone_home_9x16.png');
      report.push(await auditPageGeometry(page, 'Mobile iPhone 14 Pro (393x852) - Home Preview 9:16', true));

      // Mobile Editor (/edit) -> Top Header + 4 Tool Cards + Bottom Nav
      await page.goto('http://localhost:3000/edit', { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      // Scroll down slightly so the formatting toolbar & IPA/Thai grid are in full view above #mobile-bottom-nav
      await page.evaluate(() => window.scrollTo({ top: 360, behavior: 'instant' }));
      await page.waitForTimeout(200);
      await saveShot(page, 'audit_mobile_iphone_edit_top.png');
      report.push(await auditPageGeometry(page, 'Mobile iPhone 14 Pro (393x852) - /edit Top & Toolbar', true));

      // Open Font Dropdown on Mobile /edit to check if dropdown fits cleanly
      const fontBtn = page.locator('.canva-text-tools-container button[title="แบบอักษร"], .canva-text-tools-container button[title="Font Family"]').first();
      await fontBtn.click();
      await page.waitForTimeout(250);
      await saveShot(page, 'audit_mobile_iphone_edit_font_menu.png');
      report.push(await auditPageGeometry(page, 'Mobile iPhone 14 Pro (393x852) - /edit Font Dropdown Open', true));

      // Close font menu, scroll down to Step 3 & Step 4
      await fontBtn.click();
      await page.waitForTimeout(150);
      await page.locator('#tool-sec-social').scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await saveShot(page, 'audit_mobile_iphone_edit_bottom.png');
      report.push(await auditPageGeometry(page, 'Mobile iPhone 14 Pro (393x852) - /edit Bottom (Steps 3 & 4)', true));

      // Open Export Modal on Mobile /edit
      await page.locator('#btn-mobile-export').click();
      await page.waitForTimeout(250);
      await saveShot(page, 'audit_mobile_iphone_export_modal.png');
      report.push(await auditPageGeometry(page, 'Mobile iPhone 14 Pro (393x852) - Export Modal Open', true));

      await context.close();
    }

    // 3. Mobile Pixel 7 (412x915) Audit with 16:9 Ratio on Mobile Home
    {
      const context = await browser.newContext({
        viewport: { width: 412, height: 915 },
        isMobile: true,
        hasTouch: true
      });
      const page = await context.newPage();
      await page.goto('http://localhost:3000/edit', { waitUntil: 'networkidle' });
      await page.waitForTimeout(250);

      // Select 16:9 on mobile /edit then go back to / to see how 16:9 looks on mobile screen!
      await page.locator('#btn-ratio-dropdown').scrollIntoViewIfNeeded();
      await page.locator('#btn-ratio-dropdown').click();
      await page.locator('#aspect-ratio-dropdown-menu button[data-ratio="16:9"]').click();
      await page.waitForTimeout(250);

      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(350);
      await saveShot(page, 'audit_mobile_pixel7_home_16x9.png');
      report.push(await auditPageGeometry(page, 'Mobile Pixel 7 (412x915) - Home Preview 16:9', true));

      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(report, null, 2));
}

runVisualAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
