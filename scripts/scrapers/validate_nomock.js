const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();

  const indexUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  const editUrl = 'file:///' + path.resolve('edit.html').replace(/\\/g, '/');

  // 1. Desktop / PC View of index.html (1440x920)
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 920 } });
  await desktopPage.goto(indexUrl);
  await desktopPage.waitForTimeout(1000);

  const initialOptions = await desktopPage.$$eval('#ai-provider option', opts => opts.length);
  const isWrapperHidden = await desktopPage.$eval('#model-selector-wrapper', el => el.classList.contains('hidden'));
  console.log('Initial hardcoded models count:', initialOptions);
  console.log('Model selector hidden before API key:', isWrapperHidden);
  await desktopPage.screenshot({ path: 'screenshots/04_preview_desktop.png' });

  // Test entering an OpenRouter key prefix to verify auto-detection & dynamic model fetching
  await desktopPage.fill('#api-key', 'sk-or-v1-testkey');
  await desktopPage.waitForTimeout(2000);
  const badgeText = await desktopPage.$eval('#detected-provider-badge', el => el.textContent.trim());
  const detectedModelsCount = await desktopPage.$$eval('#ai-provider option', opts => opts.length);
  console.log('Detected Provider Badge:', badgeText);
  console.log('Dynamically fetched models after API key:', detectedModelsCount);

  // 2. Mobile View of edit.html (414x896)
  const mobilePage = await browser.newPage({ viewport: { width: 414, height: 896 } });
  await mobilePage.goto(editUrl);
  await mobilePage.waitForTimeout(1000);
  const editInitialOptions = await mobilePage.$$eval('#ai-provider option', opts => opts.length);
  console.log('Edit page initial hardcoded models count:', editInitialOptions);
  await mobilePage.screenshot({ path: 'test_edit_nomock.png' });

  await browser.close();
  console.log('Validation complete!');
})();
