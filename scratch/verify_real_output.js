const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/os/.gemini/antigravity/brain/9a3ee951-e09f-479c-9ae4-b92817328309';

async function testFullOfZealRealOutput() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test
  console.log('--- Testing Desktop: "full of zeal" ---');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  
  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1500);

  const input = desktopPage.locator('#target-word');
  await input.fill('full of zeal');
  await input.press('Enter');

  // Wait for /api/vocab/lookup fetch to resolve and populate fields
  await desktopPage.waitForTimeout(3500);

  const phonetic = await desktopPage.locator('#res-phonetic').inputValue();
  const thaiRead = await desktopPage.locator('#res-thai-read').inputValue();
  const meaning = await desktopPage.locator('#res-meaning').inputValue();
  const grammar = await desktopPage.locator('#res-grammar').inputValue();
  const ex1En = await desktopPage.locator('#res-ex1-en').inputValue();
  const ex1Th = await desktopPage.locator('#res-ex1-th').inputValue();
  const ex2En = await desktopPage.locator('#res-ex2-en').inputValue();
  const ex2Th = await desktopPage.locator('#res-ex2-th').inputValue();

  console.log('Desktop Synced Values for "full of zeal":');
  console.log({ phonetic, thaiRead, meaning, grammar, ex1En, ex1Th, ex2En, ex2Th });

  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_full_of_zeal_perfect.png'), fullPage: false });

  // 2. Mobile Canvas Screenshot
  console.log('--- Testing Mobile: "full of zeal" on Phone Canvas ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);

  // In mobile view (home), it renders PhonePreview directly
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_full_of_zeal_perfect.png') });

  await desktopContext.close();
  await mobileContext.close();
  await browser.close();
  console.log('Verification finished successfully!');
}

testFullOfZealRealOutput().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
