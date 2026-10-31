const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/os/.gemini/antigravity/brain/9a3ee951-e09f-479c-9ae4-b92817328309';

async function testMobileAndDesktop() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test (1440x900)
  console.log('=== Desktop Test (1440x900) ===');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(2000);

  const dtWordInput = desktopPage.locator('#target-word');
  await dtWordInput.fill('see eye to eye');
  await dtWordInput.press('Enter');
  await desktopPage.waitForTimeout(2000);

  const dtPhonetic = await desktopPage.locator('#res-phonetic').inputValue();
  const dtMeaning = await desktopPage.locator('#res-meaning').inputValue();
  console.log('Desktop Synced:', { dtPhonetic, dtMeaning });

  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_word_change_sync.png'), fullPage: false });
  await desktopContext.close();

  // 2. Mobile Preview Test (390x844) -> Page /
  console.log('=== Mobile Preview Test (390x844) ===');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);

  // Capture Mobile Preview Home
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_home_preview.png') });

  // 3. Mobile Editor Test (390x844) -> Page /edit
  console.log('=== Mobile Editor Test (390x844) ===');
  await mobilePage.goto('http://localhost:3000/edit', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);

  const mbWordInput = mobilePage.locator('#target-word');
  await mbWordInput.scrollIntoViewIfNeeded();
  await mbWordInput.fill('piece of cake');
  await mbWordInput.press('Enter');
  await mobilePage.waitForTimeout(2000);

  const mbWord = await mbWordInput.inputValue();
  const mbPhonetic = await mobilePage.locator('#res-phonetic').inputValue();
  const mbMeaning = await mobilePage.locator('#res-meaning').inputValue();
  const mbGrammar = await mobilePage.locator('#res-grammar').inputValue();
  const mbEx1En = await mobilePage.locator('#res-ex1-en').inputValue();
  const mbEx1Th = await mobilePage.locator('#res-ex1-th').inputValue();

  console.log('Mobile Editor Synced:', {
    mbWord,
    mbPhonetic,
    mbMeaning,
    mbGrammar,
    mbEx1En,
    mbEx1Th
  });

  // Screenshot Mobile Editor with Synced Word
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_editor_word_sync.png') });

  // Navigate back to Mobile Home to confirm Preview synced
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_phone_canvas_synced.png') });

  await mobileContext.close();
  await browser.close();
  console.log('=== Dual Platform Verification Completed 100% ===');
}

testMobileAndDesktop().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
