/**
 * ============================================================================
 * Page Object Model (POM) — ExportAndMobilePage
 * Covers: Step 4 Social Profile/Avatar/Caption, ExportModal, Mobile `/edit`
 * ============================================================================
 */
export class ExportAndMobilePage {
  /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  get channelInput() {
    return this.page.locator('#social-handle');
  }

  get captionInput() {
    return this.page.locator('#social-description');
  }

  get exportModal() {
    return this.page.locator('#export-modal');
  }

  async gotoMobileEditor() {
    await this.page.setViewportSize({ width: 390, height: 844 });
    await this.page.goto('http://localhost:3000/edit', { waitUntil: 'domcontentloaded' });
  }
}
