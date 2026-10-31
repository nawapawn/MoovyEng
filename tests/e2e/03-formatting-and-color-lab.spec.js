/**
 * ============================================================================
 * Suite 03 — Text Formatting Suite, 14 Fonts A-Z, Channel Styling & Luxury Color Picker
 * ============================================================================
 */
import assert from 'node:assert/strict';
import { StudioDashboardPage } from '../pages/StudioDashboardPage.js';
import { FormattingAndCanvasPage } from '../pages/FormattingAndCanvasPage.js';

export async function runSuite03(page, recordResult) {
  const studio = new StudioDashboardPage(page);
  const fmt = new FormattingAndCanvasPage(page);

  await studio.goto(true);

  // Test 3.1: Scroll Arrows on Target Selector Tabs
  await recordResult('TC-03.1: ปุ่มลูกศรซ้าย-ขวาเลื่อนแถบเลือกเป้าหมายข้อความ (Scroll Tabs Left/Right)', async () => {
    await assert.doesNotReject(async () => {
      await fmt.scrollRightBtn.waitFor({ state: 'visible' });
      await fmt.scrollRightBtn.click();
      await page.waitForTimeout(250);
      await fmt.scrollLeftBtn.click();
      await page.waitForTimeout(250);
    });
  });

  // Test 3.2: Font Dropdown Sorted A-Z with 14 Fonts + Handwriting Fonts & Live Preview
  await recordResult('TC-03.2: ดรอปดาวน์ฟอนต์เรียงตามตัวอักษร A-Z ครบ 14 ฟอนต์ พร้อมฟอนต์ลายมือใหม่และพรีวิวตัวอย่างฟอนต์', async () => {
    // Open font dropdown
    const fontDropdownBtn = fmt.toolbarContainer.locator('button[title="แบบอักษร"], button[title="Font Family"]').first();
    await fontDropdownBtn.click();

    const fontItems = fmt.toolbarContainer.locator('div.z-\\[70\\] button.w-full');
    const count = await fontItems.count();
    assert.equal(count, 14, `Expected 14 fonts in dropdown, found ${count}`);

    // Verify alphabetical order A -> Z
    const fontNames = [];
    for (let i = 0; i < count; i++) {
      const name = await fontItems.nth(i).locator('span.text-xs.font-bold').textContent();
      fontNames.push(name?.trim());
    }
    const sorted = [...fontNames].sort((a, b) => a.localeCompare(b));
    assert.deepEqual(fontNames, sorted, `Fonts should be sorted A-Z: ${fontNames.join(', ')}`);

    // Verify new fonts exist: Biscuit, Lemon, MiPancake, MN PangPing
    for (const requiredFont of ['Biscuit', 'Lemon', 'MiPancake', 'MN PangPing']) {
      assert.ok(fontNames.includes(requiredFont), `Missing required font ${requiredFont}`);
    }

    // Select 'Biscuit' font and verify it closes menu
    await fontItems.first().click();
    await page.waitForTimeout(100);
  });

  // Test 3.3: Luxury Spectrum Color Picker (2D Canvas, Hue Slider, RGB/HEX Sync & External Reset Sync)
  await recordResult('TC-03.3: ถาดสี Minimalist Luxury Light Color Picker (Canvas 2D, Hue Slider, HEX/RGB Sync และการรีเซ็ตสี)', async () => {
    await fmt.selectTargetTab('คำศัพท์');
    await fmt.colorBtn.click();
    await fmt.colorCanvas.waitFor({ state: 'visible' });

    // Type HEX directly
    await fmt.inputHex.fill('#FF5733');
    await page.waitForTimeout(100);

    const rVal = await fmt.inputR.inputValue();
    const gVal = await fmt.inputG.inputValue();
    const bVal = await fmt.inputB.inputValue();
    assert.equal(rVal, '255', 'R channel should sync to 255 for #FF5733');
    assert.equal(gVal, '87', 'G channel should sync to 87 for #FF5733');
    assert.equal(bVal, '51', 'B channel should sync to 51 for #FF5733');

    // Now click the toolbar Reset button while the Color Picker is still open
    const resetStyleBtn = fmt.toolbarContainer.locator('button').filter({ hasText: /รีเซ็ต|Reset/ }).first();
    await resetStyleBtn.click();
    await page.waitForTimeout(150);

    // Check if hexInput inside CanvaColorPicker synced with the external reset!
    const hexAfterReset = await fmt.inputHex.inputValue();
    assert.notEqual(
      hexAfterReset,
      '#FF5733',
      `CanvaColorPicker #inputHex remained stuck at '${hexAfterReset}' after external style Reset!`
    );
  });

  // Test 3.4: Channel Name (@move0nyoung) Formatting (Font Family 'Kanit', Font Size, Underline)
  await recordResult('TC-03.4: การปรับแต่งชื่อช่อง (@move0nyoung) ต้องรองรับการเปลี่ยนฟอนต์ (เช่น Kanit), ขนาดฟอนต์ และขีดเส้นใต้ได้ครบถ้วน', async () => {
    // Scroll tabs right to see Channel tab
    await fmt.scrollRightBtn.click();
    await page.waitForTimeout(200);
    await fmt.selectTargetTab('ชื่อช่อง');

    // Select 'Kanit' font for Channel
    const fontDropdownBtn = fmt.toolbarContainer.locator('button[title="แบบอักษร"], button[title="Font Family"]').first();
    await fontDropdownBtn.click();
    await fmt.toolbarContainer.locator('div.z-\\[70\\] button.w-full').filter({ hasText: 'Kanit' }).first().click();

    // Increase font size to 28 and toggle Underline
    const sizeInput = fmt.toolbarContainer.locator('input[type="number"]').first();
    await sizeInput.fill('28');
    const underlineBtn = fmt.toolbarContainer.locator('button[title="ขีดเส้นใต้"], button[title="Underline"]').first();
    await underlineBtn.click();
    await page.waitForTimeout(150);

    const channelStyles = await fmt.previewChannel.evaluate((el) => ({
      fontFamily: el.style.fontFamily,
      fontSize: el.style.fontSize,
      textDecoration: el.style.textDecoration
    }));

    assert.ok(
      channelStyles.fontFamily.includes('Kanit'),
      `Expected #preview-top-channel fontFamily to include 'Kanit', got '${channelStyles.fontFamily}'`
    );
    assert.equal(
      channelStyles.fontSize,
      '28px',
      `Expected #preview-top-channel fontSize to be '28px', got '${channelStyles.fontSize}'`
    );
    assert.ok(
      channelStyles.textDecoration.includes('underline'),
      `Expected #preview-top-channel textDecoration to include 'underline', got '${channelStyles.textDecoration}'`
    );
  });
}
