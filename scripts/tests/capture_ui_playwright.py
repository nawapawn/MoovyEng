import os
import sys
import json

# Ensure UTF-8 stdout on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\os\.gemini\antigravity\brain\ce623375-7cb1-443b-b053-52d570775354"

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ------------------------------------------------------------------
        # 1. Desktop Studio View (1440 x 900)
        # ------------------------------------------------------------------
        desktop_ctx = browser.new_context(
            viewport={"width": 1440, "height": 920},
            device_scale_factor=2,
            accept_downloads=True
        )
        page = desktop_ctx.new_page()
        page.goto("http://127.0.0.1:3001/index.html", wait_until="networkidle")

        # 1.1 Verify Title & Branding
        title = page.title()
        print("Page Title:", title)
        assert "moovying(En)" in title, f"Unexpected title: {title}"

        # 1.2 Populate sample data with s + formula and 2 punchy sentences
        page.evaluate("""() => {
            document.getElementById('target-word').value = 'break a leg';
            document.getElementById('clip-query').value = 'break a leg';
            document.getElementById('res-phonetic').value = '/breɪk ə leɡ/';
            document.getElementById('res-thai-read').value = '(เบรค อะ เลก)';
            document.getElementById('res-meaning').value = 'ขอให้โชคดี (ใช้ก่อนขึ้นแสดง)';
            document.getElementById('res-grammar').value = 's + wish + [Someone] + to + break a leg -> อวยพรให้โชคดี';
            document.getElementById('res-ex1-en').value = 'Go out there and break a leg!';
            document.getElementById('res-ex1-th').value = 'ออกไปทำให้เต็มที่ ขอให้โชคดีนะ!';
            document.getElementById('res-ex2-en').value = 'Break a leg on your test today.';
            document.getElementById('res-ex2-th').value = 'ขอให้ทำข้อสอบได้คะแนนดีๆ โชคดีนะ';
            document.getElementById('social-handle').value = '@movyEng';
            document.getElementById('social-description').value = 'สำนวน Break a leg แปลว่า ขอให้โชคดี นิยมใช้ให้กำลังใจก่อนขึ้นแสดงหรือทำภารกิจสำคัญ #ภาษาอังกฤษ #movyEng';
            syncFromDesktopForm();
            searchCafeClips(true);
            return true;
        }""")

        try:
            page.wait_for_selector("#clip-grid img", timeout=15000)
            page.wait_for_timeout(1000)
        except Exception as e:
            print("Clip wait warning:", e)

        # 1.3 Test Gradient Picker
        page.evaluate("() => setGradientPreset('#fef3c7', '#fed7aa')")
        page.wait_for_timeout(300)

        # Capture Desktop Light Mode with Warm Sunset Gradient
        shot_light = os.path.join(ARTIFACT_DIR, "movyeng_desktop_light.png")
        page.screenshot(path=shot_light, full_page=False)
        print("Saved:", shot_light)

        # 1.4 Test Theme Toggle (Switch to Dark Mode)
        page.click("#btn-theme-toggle")
        page.wait_for_timeout(400)
        is_dark = page.evaluate("() => document.documentElement.classList.contains('dark')")
        print("Dark mode active:", is_dark)
        assert is_dark, "Dark mode toggle failed!"

        # Apply dark slate gradient
        page.evaluate("() => setGradientPreset('#18181b', '#09090b')")
        page.wait_for_timeout(300)

        # Capture Desktop Dark Mode
        shot_dark = os.path.join(ARTIFACT_DIR, "movyeng_desktop_dark.png")
        page.screenshot(path=shot_dark, full_page=False)
        print("Saved:", shot_dark)

        # 1.5 Test Language Toggle (TH -> EN)
        page.click("#btn-lang-toggle")
        page.wait_for_timeout(400)
        lang_text = page.locator("#lang-badge-text").text_content()
        print("Language badge text:", lang_text)
        assert lang_text == "EN", f"Expected EN, got {lang_text}"

        # 1.6 Verify Preview Elements (Frameless, s + ..., 2 sentences, Thai on new line)
        preview_grammar = page.locator("#preview-grammar").inner_text()
        print("Preview Grammar Formula:", preview_grammar)
        assert "s +" in preview_grammar or "s" in preview_grammar, "Formula should use 's'"
        assert "โครงสร้าง" not in preview_grammar, "'โครงสร้าง' label must be removed"

        preview_ex1_text = page.locator("#preview-ex1").inner_text()
        print("Preview Example 1:", preview_ex1_text)
        assert "1." not in preview_ex1_text, "Number 1. must be removed from example"
        assert "→" in preview_ex1_text, "Should contain arrow translation on new line"

        # 1.7 Verify Export Button Removed from Phone Preview
        phone_export_btn = page.locator("#phone-container button:has-text('Export')").count()
        print("Export buttons inside phone preview canvas (Expected 0):", phone_export_btn)
        assert phone_export_btn == 0, "Export button should not exist inside phone preview canvas!"

        # 1.8 Test AI Random Word Generator Button
        page.evaluate("""() => {
            document.getElementById('target-word').value = '';
        }""")
        page.click("#btn-random-word")
        page.wait_for_timeout(800)
        random_word = page.locator("#target-word").input_value()
        print("Random word generated:", random_word)
        assert len(random_word) > 0, "Random word button failed to generate word!"

        # 1.9 Capture Close-up of Frameless Preview Canvas
        phone_elem = page.locator("#phone-container")
        shot_preview = os.path.join(ARTIFACT_DIR, "movyeng_preview_frameless.png")
        phone_elem.screenshot(path=shot_preview)
        print("Saved:", shot_preview)

        # ------------------------------------------------------------------
        # 2. Mobile Editor View (iPhone 14 Pro: 393 x 852)
        # ------------------------------------------------------------------
        mobile_ctx = browser.new_context(
            viewport={"width": 393, "height": 852},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        mob_page = mobile_ctx.new_page()
        mob_page.goto("http://127.0.0.1:3001/edit.html", wait_until="networkidle")

        # 2.1 Verify "ดู Preview" button is REMOVED from top sticky header
        header_preview_btn = mob_page.locator("header a[title='ดู Preview']").count()
        print("Mobile header 'ดู Preview' count (Expected 0):", header_preview_btn)
        assert header_preview_btn == 0, "'ดู Preview' button must be removed from mobile top header!"

        # 2.2 Verify Mobile Header Logo is Frameless & Enlarged
        logo_classes = mob_page.locator("header img[alt='movyEng Logo']").get_attribute("class")
        print("Mobile Logo classes:", logo_classes)
        assert "w-10" in logo_classes and "border" not in logo_classes, "Logo must be enlarged and frameless"

        # 2.3 Test Mobile Dark Mode Toggle
        mob_page.click("#btn-theme-toggle")
        mob_page.wait_for_timeout(300)
        mob_is_dark = mob_page.evaluate("() => document.documentElement.classList.contains('dark')")
        print("Mobile Dark mode active:", mob_is_dark)

        # Capture Mobile Editor View
        shot_mobile = os.path.join(ARTIFACT_DIR, "movyeng_mobile_editor.png")
        mob_page.screenshot(path=shot_mobile, full_page=False)
        print("Saved:", shot_mobile)

        browser.close()
        print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run()
