/**
 * ============================================================================
 * Page Object Model (POM) — StudioDashboardPage
 * Covers: StudioHeader, Theme & Language Switcher, Undo/Redo, Tool Search,
 *         Step 1 AI Model & API Key Auto-Detection
 * ============================================================================
 */
export class StudioDashboardPage {
  /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async goto(resetStorage = true) {
    await this.page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    if (resetStorage) {
      await this.page.evaluate(() => {
        localStorage.clear();
      });
      await this.page.reload({ waitUntil: 'networkidle' });
      await this.page.waitForTimeout(250);
    }
    await this.page.waitForSelector('#phone-container', { state: 'visible', timeout: 15000 });
  }

  // Header Controls
  get themeBtn() {
    return this.page.locator('#btn-theme-toggle');
  }

  get langBtn() {
    return this.page.locator('#btn-lang-toggle');
  }

  get undoBtn() {
    return this.page.locator('#btn-desktop-undo');
  }

  get redoBtn() {
    return this.page.locator('#btn-desktop-redo');
  }

  get resetAllBtn() {
    return this.page.locator('#btn-trash-reset');
  }

  get exportModalBtn() {
    return this.page.locator('#btn-export-studio');
  }

  get toolSearchInput() {
    return this.page.locator('#desktop-tool-search');
  }

  // Step 1 AI Controls
  get apiKeyInput() {
    return this.page.locator('#api-key');
  }

  get detectedProviderBadge() {
    return this.page.locator('#detected-provider-badge');
  }

  get verifyKeyBtn() {
    return this.page.locator('#btn-verify-key');
  }

  // Actions
  async toggleTheme() {
    await this.themeBtn.click();
  }

  async toggleLanguage() {
    await this.langBtn.click();
  }

  async enterApiKey(key) {
    await this.apiKeyInput.fill(key);
  }

  async triggerResetAllAndConfirm() {
    await this.resetAllBtn.click();
    await this.page.waitForSelector('#custom-browser-dialog', { state: 'visible' });
    await this.page.locator('#custom-dialog-confirm').click();
  }
}
