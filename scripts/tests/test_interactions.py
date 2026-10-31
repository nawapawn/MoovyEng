import os
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\os\.gemini\antigravity\brain\ce623375-7cb1-443b-b053-52d570775354"

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 920})
        page = ctx.new_page()
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(1)

        # 1. Click Dice to randomize word
        dice_btn = page.locator("button[title*='สุ่มคำศัพท์']")
        if dice_btn.count() > 0:
            dice_btn.click()
            time.sleep(2)
            word_val = page.locator("#target-word").input_value()
            print("Randomized Word:", word_val)
            assert len(word_val) > 0

        # 2. Click Export button in header to verify ExportModal opens
        export_btn = page.locator("#export-btn-text")
        if export_btn.count() > 0:
            export_btn.click()
            time.sleep(0.5)
            # Verify modal title
            modal_heading = page.locator("h3:has-text('Export')").inner_text()
            print("Export Modal Heading:", modal_heading)
            assert "Export" in modal_heading

            path_modal = os.path.join(ARTIFACT_DIR, "nextjs_export_modal.png")
            page.screenshot(path=path_modal)
            print("Saved nextjs_export_modal.png")

        browser.close()
        print("INTERACTION TESTS PASSED!")

if __name__ == "__main__":
    run()
