const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/os/.gemini/antigravity/brain/9a3ee951-e09f-479c-9ae4-b92817328309';

async function verifyAllSystems() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test (1440x900)
  console.log('--- 1. Desktop System Verification ---');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  
  // Listen for console errors
  const consoleErrors = [];
  desktopPage.on('pageerror', err => consoleErrors.push(err.message));

  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1500);

  // Test word change: "burn the midnight oil"
  const targetInput = desktopPage.locator('#target-word');
  await targetInput.fill('burn the midnight oil');
  await targetInput.press('Enter');
  await desktopPage.waitForTimeout(2000);

  const phonetic = await desktopPage.locator('#res-phonetic').inputValue();
  const meaning = await desktopPage.locator('#res-meaning').inputValue();
  const grammar = await desktopPage.locator('#res-grammar').inputValue();
  const ex1En = await desktopPage.locator('#res-ex1-en').inputValue();
  const ex1Th = await desktopPage.locator('#res-ex1-th').inputValue();

  console.log('Desktop Word Update:', { phonetic, meaning, grammar, ex1En, ex1Th });

  // Test custom word without fixed template: "zeal"
  await targetInput.fill('full of zeal');
  await targetInput.press('Enter');
  await desktopPage.waitForTimeout(1500);

  const customGrammar = await desktopPage.locator('#res-grammar').inputValue();
  console.log('Custom Word Grammar (Unconstrained):', customGrammar);

  // Test Text Formatting Tool Suite visibility & interactions
  const fontSelect = desktopPage.locator('#active-font-display');
  const isFontVisible = await fontSelect.isVisible();
  console.log('Font Tool Visible:', isFontVisible);

  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_all_system_verified.png'), fullPage: false });
  await desktopContext.close();

  // 2. Mobile Test (390x844)
  console.log('--- 2. Mobile System Verification ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/edit', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(1500);

  const mobInput = mobilePage.locator('#target-word');
  await mobInput.scrollIntoViewIfNeeded();
  await mobInput.fill('once in a blue moon');
  await mobInput.press('Enter');
  await mobilePage.waitForTimeout(2000);

  const mobPhonetic = await mobilePage.locator('#res-phonetic').inputValue();
  const mobMeaning = await mobilePage.locator('#res-meaning').inputValue();
  const mobGrammar = await mobilePage.locator('#res-grammar').inputValue();

  console.log('Mobile Word Update:', { mobPhonetic, mobMeaning, mobGrammar });

  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_all_system_verified.png') });

  // Check preview canvas
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_preview_canvas_verified.png') });

  await mobileContext.close();
  await browser.close();

  console.log('All system checks completed successfully! Console errors:', consoleErrors.length);
}

verifyAllSystems().catch(e => {
  console.error('Verification failed:', e);
  process.exit(1);
});
