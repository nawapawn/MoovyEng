const { chromium } = require('playwright');

async function testInPageScript() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check in browser via evaluate
  const result = await page.evaluate(async () => {
    const input = document.getElementById('target-word');
    if (!input) return { err: 'no input' };

    // Set value and trigger input & blur
    input.value = 'see eye to eye';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));

    // Wait 1 sec
    await new Promise(r => setTimeout(r, 1000));

    return {
      word: input.value,
      phonetic: document.getElementById('res-phonetic')?.value,
      meaning: document.getElementById('res-meaning')?.value,
    };
  });

  console.log('Evaluate Result:', result);
  await browser.close();
}

testInPageScript().catch(console.error);
