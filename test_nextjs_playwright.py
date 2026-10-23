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

        # ------------------------------------------------------------------
        # 1. Desktop Studio View (1440 x 920)
        # ------------------------------------------------------------------
        desktop_ctx = browser.new_context(
            viewport={"width": 1440, "height": 920},
            device_scale_factor=2
        )
        page = desktop_ctx.new_page()
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(1)

        title = page.title()
        print("Page Title:", title)
        assert "moovying(En)" in title or "movyEng" in title

        # Verify Phone Preview content
        word = page.locator("#preview-word").inner_text()
        print("Preview Word:", word)
        assert len(word) > 0

        # Verify Studio Header on Right
        header = page.locator("header")
        print("Studio Header exists:", header.count() > 0)
        assert header.count() > 0

        # Verify the 4 Step Cards
        ai_card = page.locator("#tool-sec-ai")
        vocab_card = page.locator("#tool-sec-vocab")
        ratio_card = page.locator("#tool-sec-ratio")
        social_card = page.locator("#tool-sec-social")
        assert ai_card.count() > 0, "Step 1 AI Card missing"
        assert vocab_card.count() > 0, "Step 2 Vocab Card missing"
        assert ratio_card.count() > 0, "Step 3 Ratio Card missing"
        assert social_card.count() > 0, "Step 4 Social Card missing"
        print("All 4 Tool Section Cards verified!")

        # Screenshot: Desktop Studio (Light)
        path_light = os.path.join(ARTIFACT_DIR, "nextjs_perfect_desktop_light.png")
        page.screenshot(path=path_light, full_page=True)
        print("Saved nextjs_perfect_desktop_light.png")

        # Toggle to Dark Mode
        page.locator("#btn-theme-toggle").click()
        time.sleep(0.5)

        # Screenshot: Desktop Studio (Dark)
        path_dark = os.path.join(ARTIFACT_DIR, "nextjs_perfect_desktop_dark.png")
        page.screenshot(path=path_dark, full_page=True)
        print("Saved nextjs_perfect_desktop_dark.png")

        # ------------------------------------------------------------------
        # 2. Phone Preview Isolated
        # ------------------------------------------------------------------
        phone_el = page.locator("#phone-container")
        path_phone = os.path.join(ARTIFACT_DIR, "nextjs_perfect_phone_preview.png")
        phone_el.screenshot(path=path_phone)
        print("Saved nextjs_perfect_phone_preview.png")

        # ------------------------------------------------------------------
        # 3. Mobile Editor View (/edit on 390 x 844)
        # ------------------------------------------------------------------
        mobile_ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2
        )
        page_mobile = mobile_ctx.new_page()
        page_mobile.goto("http://localhost:3000/edit", wait_until="networkidle")
        time.sleep(1)

        path_mobile = os.path.join(ARTIFACT_DIR, "nextjs_perfect_mobile_editor.png")
        page_mobile.screenshot(path=path_mobile, full_page=True)
        print("Saved nextjs_perfect_mobile_editor.png")

        browser.close()
        print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run()
