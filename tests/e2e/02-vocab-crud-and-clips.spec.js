/**
 * ============================================================================
 * Suite 02 — Vocabulary CRUD, Clear Vocab Dialog, Aspect Ratio & Clip Queue
 * ============================================================================
 */
import assert from 'node:assert/strict';
import { StudioDashboardPage } from '../pages/StudioDashboardPage.js';
import { VocabAndClipsPage } from '../pages/VocabAndClipsPage.js';

export async function runSuite02(page, recordResult) {
  const studio = new StudioDashboardPage(page);
  const vocab = new VocabAndClipsPage(page);

  await studio.goto(true);

  // Test 2.1: Real-time Two-Way Sync of All Vocabulary Fields to PhonePreview
  await recordResult('TC-02.1: การกรอกข้อมูลคำศัพท์ทั้ง 9 ช่อง ซิงค์กับหน้าจอพรีวิวแบบเรียลไทม์', async () => {
    await vocab.fillAllVocabFields({
      word: 'bite the bullet',
      phonetic: '/baɪt ðə ˈbʊlɪt/',
      thaiRead: '(ไบท์ เดอะ บูลเล็ท)',
      meaning: 'กัดฟันสู้',
      grammar: 'have to + bite the bullet (จำใจต้องทำสิ่งที่ยากลำบาก)',
      ex1En: 'I had to bite the bullet and pay the bill.',
      ex1Th: 'ฉันต้องกัดฟันจ่ายบิลนั้น',
      ex2En: 'Just bite the bullet and tell the truth.',
      ex2Th: 'กัดฟันพูดความจริงไปเถอะ'
    });

    assert.equal((await page.locator('#preview-word').textContent())?.trim(), 'bite the bullet');
    assert.equal((await page.locator('#preview-phonetic').textContent())?.trim(), '/baɪt ðə ˈbʊlɪt/');
    assert.equal((await page.locator('#preview-thai-read').textContent())?.trim(), '(ไบท์ เดอะ บูลเล็ท)');
    assert.equal((await page.locator('#preview-meaning').textContent())?.trim(), 'กัดฟันสู้');
    assert.ok((await page.locator('#preview-grammar').textContent())?.includes('bite the bullet'));
    assert.equal((await page.locator('[data-preview-field="ex1En"]').textContent())?.trim(), 'I had to bite the bullet and pay the bill.');
    assert.equal((await page.locator('[data-preview-field="ex2En"]').textContent())?.trim(), 'Just bite the bullet and tell the truth.');
  });

  // Test 2.2: Clear Vocabulary Data Modal & Empty State Handling
  await recordResult('TC-02.2: ปุ่มถังขยะล้างข้อมูลคำศัพท์ทั้งหมด (Clear Vocabulary Data) และตรวจสอบหน้าพรีวิวไม่พังเมื่อข้อมูลว่าง', async () => {
    await vocab.clearAllVocabAndConfirm();
    await page.waitForTimeout(150);

    assert.equal(await vocab.wordInput.inputValue(), '', 'Word input should be empty');
    assert.equal(await vocab.meaningInput.inputValue(), '', 'Meaning input should be empty');
    assert.equal((await page.locator('#preview-word').textContent())?.trim(), '', 'Preview word should be empty without crashing');

    // Restore curated word via Random Word button
    await vocab.randomWordBtn.click();
    await page.waitForTimeout(400);
    const pickedWord = await vocab.wordInput.inputValue();
    assert.ok(pickedWord.length > 0, 'Random word should populate a non-empty English idiom');
  });

  // Test 2.3: Aspect Ratio 9:16 vs 16:9 Switching
  await recordResult('TC-02.3: การสลับสัดส่วนวิดีโอ 9:16 (แนวตั้ง) และ 16:9 (แนวนอน) ปรับขนาดกรอบพรีวิวถูกต้อง', async () => {
    await vocab.selectAspectRatio('9:16');
    await page.waitForTimeout(350);
    const box916 = await page.locator('#phone-container').boundingBox();
    assert.ok(box916 && box916.height > box916.width, `9:16 container should be portrait, got ${box916?.width}x${box916?.height}`);

    await vocab.selectAspectRatio('16:9');
    await page.waitForTimeout(350);
    const box169 = await page.locator('#phone-container').boundingBox();
    assert.ok(box169 && box169.width > box169.height, `16:9 container should be landscape, got ${box169?.width}x${box169?.height}`);

    // Switch back to 9:16
    await vocab.selectAspectRatio('9:16');
    await page.waitForTimeout(350);
  });
}
