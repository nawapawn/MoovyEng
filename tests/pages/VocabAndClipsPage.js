/**
 * ============================================================================
 * Page Object Model (POM) — VocabAndClipsPage
 * Covers: Step 2 Vocabulary CRUD, Clear Vocab Dialog, Movie Clip Pool,
 *         Step 3 Aspect Ratio (9:16 / 16:9), Background Color, Clip Queue
 * ============================================================================
 */
export class VocabAndClipsPage {
  /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  // Step 2 Inputs
  get wordInput() {
    return this.page.locator('#target-word');
  }

  get phoneticInput() {
    return this.page.locator('#res-phonetic');
  }

  get thaiReadInput() {
    return this.page.locator('#res-thai-read');
  }

  get meaningInput() {
    return this.page.locator('#res-meaning');
  }

  get grammarInput() {
    return this.page.locator('#res-grammar');
  }

  get ex1EnInput() {
    return this.page.locator('#res-ex1-en');
  }

  get ex1ThInput() {
    return this.page.locator('#res-ex1-th');
  }

  get ex2EnInput() {
    return this.page.locator('#res-ex2-en');
  }

  get ex2ThInput() {
    return this.page.locator('#res-ex2-th');
  }

  get clearVocabBtn() {
    return this.page.locator('#btn-clear-vocab-card');
  }

  get randomWordBtn() {
    return this.page.locator('#btn-random-word');
  }

  // Step 3 Aspect Ratio & Background
  get ratioDropdownBtn() {
    return this.page.locator('#btn-ratio-dropdown');
  }

  get bgColorHexText() {
    return this.page.locator('#bg-color-hex');
  }

  async selectAspectRatio(ratio) {
    await this.ratioDropdownBtn.click();
    await this.page.locator(`#aspect-ratio-dropdown-menu button[data-ratio="${ratio}"]`).click();
  }

  // Actions
  async fillAllVocabFields({
    word,
    phonetic,
    thaiRead,
    meaning,
    grammar,
    ex1En,
    ex1Th,
    ex2En,
    ex2Th
  }) {
    if (word !== undefined) {
      await this.wordInput.click();
      await this.wordInput.fill(word);
    }
    if (phonetic !== undefined) await this.phoneticInput.fill(phonetic);
    if (thaiRead !== undefined) await this.thaiReadInput.fill(thaiRead);
    if (meaning !== undefined) await this.meaningInput.fill(meaning);
    if (grammar !== undefined) await this.grammarInput.fill(grammar);
    if (ex1En !== undefined) await this.ex1EnInput.fill(ex1En);
    if (ex1Th !== undefined) await this.ex1ThInput.fill(ex1Th);
    if (ex2En !== undefined) await this.ex2EnInput.fill(ex2En);
    if (ex2Th !== undefined) await this.ex2ThInput.fill(ex2Th);
  }

  async clearAllVocabAndConfirm() {
    await this.clearVocabBtn.click();
    await this.page.waitForSelector('#custom-browser-dialog', { state: 'visible' });
    await this.page.locator('#custom-dialog-confirm').click();
  }
}
