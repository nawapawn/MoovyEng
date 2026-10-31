const { chromium } = require('playwright');

async function debugWordEvent() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const initialWord = await page.locator('#target-word').inputValue();
  console.log('Initial word in UI:', initialWord);

  // Evaluate updateWord directly in browser window or click random button
  await page.evaluate(() => {
    const input = document.getElementById('target-word');
    console.log('DOM input element exists:', !!input);
  });

  // Click random word button
  console.log('Clicking random word button...');
  await page.locator('#btn-random-word').click();
  await page.waitForTimeout(2000);

  const randWord = await page.locator('#target-word').inputValue();
  const randPhonetic = await page.locator('#res-phonetic').inputValue();
  const randMeaning = await page.locator('#res-meaning').inputValue();
  console.log('After Random Click:', { randWord, randPhonetic, randMeaning });

  await browser.close();
}

debugWordEvent().catch(console.error);
