/**
 * ============================================================================
 * Page Object Model (POM) — FormattingAndCanvasPage
 * Covers: TextFormattingSuite (Scroll arrows, 14 Fonts A-Z dropdown,
 *         Luxury Spectrum Color Picker, Bold/Italic/Underline/Align/Reset)
 *         and PhonePreview Canvas elements
 * ============================================================================
 */
export class FormattingAndCanvasPage {
  /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  get toolbarContainer() {
    return this.page.locator('.canva-text-tools-container');
  }

  get scrollLeftBtn() {
    return this.page.locator('button[aria-label="Scroll Tabs Left"]');
  }

  get scrollRightBtn() {
    return this.page.locator('button[aria-label="Scroll Tabs Right"]');
  }

  get colorBtn() {
    return this.page.locator('#btn-canva-color');
  }

  get colorCanvas() {
    return this.page.locator('#colorCanvas');
  }

  get hueSlider() {
    return this.page.locator('#hueSlider');
  }

  get inputHex() {
    return this.page.locator('#inputHex');
  }

  get inputR() {
    return this.page.locator('#inputR');
  }

  get inputG() {
    return this.page.locator('#inputG');
  }

  get inputB() {
    return this.page.locator('#inputB');
  }

  // Phone Preview elements
  get phoneContainer() {
    return this.page.locator('#phone-container');
  }

  get previewWord() {
    return this.page.locator('#preview-word');
  }

  get previewPhonetic() {
    return this.page.locator('#preview-phonetic');
  }

  get previewThaiRead() {
    return this.page.locator('#preview-thai-read');
  }

  get previewMeaning() {
    return this.page.locator('#preview-meaning');
  }

  get previewGrammar() {
    return this.page.locator('#preview-grammar');
  }

  get previewChannel() {
    return this.page.locator('#preview-top-channel');
  }

  get previewMovieCredit() {
    return this.page.locator('#preview-movie-credit');
  }

  async selectTargetTab(tabLabelOrId) {
    const btn = this.toolbarContainer.locator('button').filter({ hasText: tabLabelOrId }).first();
    await btn.click();
  }
}
