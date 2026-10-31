/**
 * ============================================================================
 * Suite 01 — Studio Header, Theme/Lang Switch, Undo/Redo & AI Auth Auto-Detect
 * ============================================================================
 */
import assert from 'node:assert/strict';
import { StudioDashboardPage } from '../pages/StudioDashboardPage.js';
import { VocabAndClipsPage } from '../pages/VocabAndClipsPage.js';

export async function runSuite01(page, recordResult) {
  const studio = new StudioDashboardPage(page);
  const vocab = new VocabAndClipsPage(page);

  await studio.goto(true);

  // Test 1.1: Theme Switcher (Light <-> Dark)
  await recordResult('TC-01.1: สลับโหมดธีมสว่าง (Light) และมืด (Dark) พร้อมบันทึกใน localStorage', async () => {
    const initialIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    await studio.toggleTheme();
    const afterFirstClick = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    assert.notEqual(initialIsDark, afterFirstClick, 'Theme class on <html> should toggle');
    await studio.toggleTheme();
    const afterSecondClick = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    assert.equal(initialIsDark, afterSecondClick, 'Theme class should return to original');
  });

  // Test 1.2: Language Switcher (TH <-> EN) Across Entire UI
  await recordResult('TC-01.2: สลับภาษา TH <-> EN ครบทุกส่วน (Header, Steps 1-4, Formatting Toolbar)', async () => {
    const initialLangText = (await studio.langBtn.textContent())?.trim();
    assert.equal(initialLangText, 'TH', 'Default language badge should be TH');

    await studio.toggleLanguage();
    const enLangText = (await studio.langBtn.textContent())?.trim();
    assert.equal(enLangText, 'EN', 'Language badge should switch to EN');

    const step1TitleEn = await page.locator('#tool-sec-ai .tool-card-header').textContent();
    assert.ok(step1TitleEn?.includes('AI Model & API Key'), `Expected English Step 1 title, got: ${step1TitleEn}`);

    // Switch back to TH
    await studio.toggleLanguage();
    const thLangText = (await studio.langBtn.textContent())?.trim();
    assert.equal(thLangText, 'TH', 'Language badge should switch back to TH');
  });

  // Test 1.3: API Key Auto-Detection (Groq, Gemini, OpenAI)
  await recordResult('TC-01.3: ระบบตรวจจับผู้ให้บริการ AI อัตโนมัติจากรหัส API Key (Groq gsk_, Gemini AIza, OpenAI sk-)', async () => {
    await studio.enterApiKey('gsk_test_groq_key_123456789');
    await page.waitForTimeout(150);
    const groqBadge = (await studio.detectedProviderBadge.textContent())?.trim().toUpperCase();
    assert.ok(groqBadge?.includes('GROQ'), `Expected GROQ badge, got: ${groqBadge}`);

    await studio.enterApiKey('AIzaSyTestGeminiKey123456789');
    await page.waitForTimeout(150);
    const geminiBadge = (await studio.detectedProviderBadge.textContent())?.trim().toUpperCase();
    assert.ok(geminiBadge?.includes('GEMINI'), `Expected GEMINI badge, got: ${geminiBadge}`);

    await studio.enterApiKey('sk-proj-testOpenAiKey123456789');
    await page.waitForTimeout(150);
    const openaiBadge = (await studio.detectedProviderBadge.textContent())?.trim().toUpperCase();
    assert.ok(openaiBadge?.includes('OPENAI'), `Expected OPENAI badge when typing sk-proj-... key, got: ${openaiBadge}`);

    await studio.enterApiKey('');
  });

  // Test 1.4: Undo / Redo History Stack
  await recordResult('TC-01.4: ระบบย้อนกลับ (Undo) และทำซ้ำ (Redo) เมื่อแก้ไขคำศัพท์', async () => {
    await vocab.wordInput.fill('piece of cake');
    await page.waitForTimeout(600); // Wait for 450ms debounce history snapshot
    const previewAfterEdit = await page.locator('#preview-word').textContent();
    assert.equal(previewAfterEdit?.trim(), 'piece of cake');

    await studio.undoBtn.click();
    await page.waitForTimeout(150);
    const previewAfterUndo = await page.locator('#preview-word').textContent();
    assert.equal(previewAfterUndo?.trim(), 'break a leg', 'Undo should restore previous word');

    await studio.redoBtn.click();
    await page.waitForTimeout(150);
    const previewAfterRedo = await page.locator('#preview-word').textContent();
    assert.equal(previewAfterRedo?.trim(), 'piece of cake', 'Redo should reapply word');
  });

  // Test 1.5: Reset All Data Consistency Check
  await recordResult('TC-01.5: ปุ่มรีเซ็ตข้อมูลทั้งหมด (Reset All) ต้องคืนค่าพื้นหลัง #ffffff, ชื่อช่อง @MoovyEng และฟอนต์เริ่มต้นครบทุกช่อง', async () => {
    // Modify background, channel, and word
    await page.locator('#social-handle').fill('@custom_test_channel');
    // Open Studio Color Laboratory for background if closed, or click Slate preset
    if (await page.locator('#btn-bg-color-picker-trigger').isVisible()) {
      await page.locator('#btn-bg-color-picker-trigger').click();
      await page.waitForTimeout(100);
    }
    const slatePreset = page.locator('#tool-sec-ratio button[title="#52525B"], #tool-sec-ratio button[title="#18181B"], #tool-sec-ratio button[title="Slate"]').first();
    if (await slatePreset.isVisible()) {
      await slatePreset.click();
    }
    await page.waitForTimeout(150);

    // Trigger Reset All and confirm
    await studio.triggerResetAllAndConfirm();
    await page.waitForTimeout(200);

    const resetChannel = await page.locator('#social-handle').inputValue();
    const resetBgColor = (await vocab.bgColorHexText.textContent())?.trim();
    const wordAlign = await page.locator('#preview-word').evaluate((el) => getComputedStyle(el).textAlign);

    assert.equal(resetChannel, '@MoovyEng', `Expected channel to reset to '@MoovyEng', but got '${resetChannel}'`);
    assert.equal(resetBgColor?.toLowerCase(), '#ffffff', `Expected bgColor to reset to '#ffffff', but got '${resetBgColor}'`);
    assert.equal(wordAlign, 'center', `Expected #preview-word textAlign to remain 'center' after Reset All, but got '${wordAlign}'`);
  });
}
