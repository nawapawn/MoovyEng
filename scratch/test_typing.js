const { chromium } = require('playwright');

async function testTypingWord() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const targetInput = page.locator('#target-word');
  await targetInput.fill('see eye to eye');
  await targetInput.press('Enter');
  await page.waitForTimeout(1500);

  const phonetic = await page.locator('#res-phonetic').inputValue();
  const meaning = await page.locator('#res-meaning').inputValue();
  const grammar = await page.locator('#res-grammar').inputValue();

  console.log('Test "see eye to eye" Output:', { phonetic, meaning, grammar });

  await targetInput.fill('once in a blue moon');
  await targetInput.press('Enter');
  await page.waitForTimeout(1500);

  const phonetic2 = await page.locator('#res-phonetic').inputValue();
  const meaning2 = await page.locator('#res-meaning').inputValue();
  const grammar2 = await page.locator('#res-grammar').inputValue();

  console.log('Test "once in a blue moon" Output:', { phonetic2, meaning2, grammar2 });

  await context.close();
  await browser.close();
}

testTypingWord().catch(console.error);
