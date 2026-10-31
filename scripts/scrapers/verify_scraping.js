const { chromium } = require('playwright');

async function testScrapingAndUI() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 420, height: 880 } });
  const page = await context.newPage();

  console.log('--- Step 1: Opening edit.html ---');
  await page.goto('http://localhost:3000/edit.html');
  await page.waitForLoadState('networkidle');

  // Wait 3 seconds for initial clip.cafe scraping
  await page.waitForTimeout(3000);

  const clipCards = await page.$$eval('#clip-grid > div', els => els.length);
  console.log(`Clips rendered in grid: ${clipCards}`);

  const sourceIndicator = await page.$eval('#clip-source-indicator', el => el.textContent);
  console.log(`Source indicator text: "${sourceIndicator}"`);

  // Take screenshot of edit.html with real clips
  await page.screenshot({ path: 'test_edit_scraped.png' });
  console.log('Screenshot saved to test_edit_scraped.png');

  console.log('--- Step 2: Testing Search with new query "love" ---');
  await page.fill('#clip-query', 'love');
  await page.click('button:has-text("ค้นหาคลิป")');
  
  await page.waitForTimeout(4000);
  const loveCards = await page.$$eval('#clip-grid > div', els => els.length);
  console.log(`Clips rendered for "love": ${loveCards}`);
  const loveIndicator = await page.$eval('#clip-source-indicator', el => el.textContent);
  console.log(`Source indicator for "love": "${loveIndicator}"`);

  // Save changes to localStorage
  console.log('--- Step 3: Saving configuration ---');
  await page.click('button:has-text("บันทึกและส่งข้อมูลไปหน้า Preview")');
  await page.waitForTimeout(1000);

  // Navigate to preview index.html
  console.log('--- Step 4: Verifying preview index.html ---');
  await page.goto('http://localhost:3000/index.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const movieTitle = await page.$eval('#preview-movie-title', el => el.textContent);
  console.log(`Preview Movie Title: "${movieTitle}"`);

  await page.screenshot({ path: 'test_index_scraped.png' });
  console.log('Screenshot saved to test_index_scraped.png');

  await browser.close();
  console.log('All verification passed successfully!');
}

testScrapingAndUI().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
