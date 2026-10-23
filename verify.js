const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 }, // Mobile viewport (iPhone 11/XR)
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  console.log('--- 1. Testing edit.html on Mobile Viewport ---');
  await page.goto('file:///' + path.join(__dirname, 'edit.html').replace(/\\/g, '/'));
  await page.waitForLoadState('networkidle');

  // Verify elements exist
  const aiProvider = await page.$('#ai-provider');
  const apiKey = await page.$('#api-key');
  const targetWord = await page.$('#target-word');
  const btnAiGenerate = await page.$('#btn-ai-generate');
  const clipGrid = await page.$('#clip-grid');
  const btnLoadMore = await page.$('#btn-load-more');
  const sequenceList = await page.$('#sequence-list');
  const socialHandle = await page.$('#social-handle');
  const socialDesc = await page.$('#social-description');

  console.log('Elements Check:');
  console.log(' - AI Provider select:', !!aiProvider);
  console.log(' - API Key input:', !!apiKey);
  console.log(' - Target Word input:', !!targetWord);
  console.log(' - AI Generate button:', !!btnAiGenerate);
  console.log(' - Clip Grid:', !!clipGrid);
  console.log(' - Sequence List:', !!sequenceList);
  console.log(' - Social inputs:', !!socialHandle && !!socialDesc);

  // Take screenshot of Edit Page on Mobile
  await page.screenshot({ path: path.join(screenshotsDir, '01_edit_mobile_top.png') });
  console.log('Saved 01_edit_mobile_top.png');

  // Test AI Agent generation
  console.log('--- 2. Triggering AI Agent Generation for "Break a leg" ---');
  await page.fill('#target-word', 'Break a leg');
  await page.click('#btn-ai-generate');
  await page.waitForTimeout(1000); // Wait for Agent response

  const meaningVal = await page.inputValue('#res-meaning');
  const phoneticVal = await page.inputValue('#res-phonetic');
  console.log('AI Result Generated:');
  console.log(' - Phonetic:', phoneticVal);
  console.log(' - Meaning:', meaningVal);

  // Test Unlimited Cafe Clip Search & Load More
  console.log('--- 3. Testing Unlimited Cafe Clip Search & Infinite Load ---');
  const initialCards = await page.$$('#clip-grid > div');
  console.log('Initial clip cards count:', initialCards.length);

  await page.click('#btn-load-more');
  await page.waitForTimeout(500);
  const afterCards = await page.$$('#clip-grid > div');
  console.log('After "Load More" cards count:', afterCards.length);

  // Select a second clip to test multi-clip sequencing
  if (afterCards.length >= 2) {
    console.log('Selecting second clip for sequence merge test...');
    await afterCards[1].click();
    await page.waitForTimeout(400);
  }

  const selectedCountText = await page.textContent('#selected-badge');
  console.log('Selected badge text:', selectedCountText);

  // Scroll down to take screenshot of Sequence & Social section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.screenshot({ path: path.join(screenshotsDir, '02_edit_mobile_sequence.png') });
  console.log('Saved 02_edit_mobile_sequence.png');

  // Test Social Description AI regeneration
  console.log('--- 4. Testing AI Social Description Regeneration ---');
  await page.click('button:has-text("สร้างคำบรรยายใหม่")');
  await page.waitForTimeout(400);
  const newSocialDesc = await page.inputValue('#social-description');
  console.log('New Social Description:', newSocialDesc.slice(0, 50) + '...');

  // Save and navigate to preview (index.html)
  console.log('--- 5. Saving and navigating to Preview (index.html) ---');
  await page.click('button:has-text("บันทึกและส่งข้อมูลไปหน้า Preview")');
  await page.waitForTimeout(1000);

  // Verify index.html rendered the new word and sequence
  console.log('--- 6. Verifying index.html with new data ---');
  const previewWord = await page.textContent('#preview-word');
  const previewMeaning = await page.textContent('#preview-meaning');
  const previewChannel = await page.textContent('#preview-top-channel');
  const counterText = await page.textContent('#preview-sequence-counter');

  console.log('Preview Rendered:');
  console.log(' - Word:', previewWord);
  console.log(' - Meaning:', previewMeaning);
  console.log(' - Channel:', previewChannel);
  console.log(' - Multi-clip counter:', counterText);

  // Test ElevenLabs Speak button
  console.log('--- 6.1 Testing ElevenLabs Audio Speech Button ---');
  await page.click('#btn-eleven-speak');
  await page.waitForTimeout(400);

  // Test Export Modal
  console.log('--- 6.2 Testing Export & Download Content Modal ---');
  await page.click('button[title="ส่งออกสไลด์ภาพหรือคลิปวิดีโอ"]');
  await page.waitForTimeout(500);
  const isModalVisible = await page.isVisible('#export-modal');
  console.log(' - Export Modal visible:', isModalVisible);
  await page.screenshot({ path: path.join(screenshotsDir, '06_export_modal.png') });
  console.log('Saved 06_export_modal.png');
  await page.click('button:has-text("ปิด")');
  await page.waitForTimeout(300);

  // Screenshot Mobile Preview
  await page.screenshot({ path: path.join(screenshotsDir, '03_preview_mobile.png') });
  console.log('Saved 03_preview_mobile.png');

  // Test Desktop Viewport
  console.log('--- 7. Testing Desktop Viewport (1280x800) ---');
  const desktopPage = await context.newPage();
  await desktopPage.setViewportSize({ width: 1280, height: 850 });
  await desktopPage.goto('file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/'));
  await desktopPage.waitForTimeout(600);
  await desktopPage.screenshot({ path: path.join(screenshotsDir, '04_preview_desktop.png') });
  console.log('Saved 04_preview_desktop.png');

  // Test Desktop Edit Page
  await desktopPage.goto('file:///' + path.join(__dirname, 'edit.html').replace(/\\/g, '/'));
  await desktopPage.waitForTimeout(600);
  await desktopPage.screenshot({ path: path.join(screenshotsDir, '05_edit_desktop.png') });
  console.log('Saved 05_edit_desktop.png');

  await browser.close();
  console.log('=== All Playwright tests and screenshots finished successfully! ===');
})();
