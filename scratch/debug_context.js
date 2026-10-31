const { chromium } = require('playwright');

async function debugContext() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Type character by character with Playwright pressSequentially or fill
  const input = page.locator('#target-word');
  await input.click();
  await input.fill('');
  await input.pressSequentially('see eye to eye');
  console.log('Filled input, now pressing Enter...');
  await input.press('Enter');
  
  await page.waitForTimeout(2000);

  const wordVal = await page.locator('#target-word').inputValue();
  const phonetic = await page.locator('#res-phonetic').inputValue();
  const meaning = await page.locator('#res-meaning').inputValue();
  console.log('Result after Enter:', { wordVal, phonetic, meaning });

  await browser.close();
}

debugContext().catch(console.error);
