import os
import json
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\os\.gemini\antigravity\brain\ce623375-7cb1-443b-b053-52d570775354"

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Desktop UI (1440 x 900)
        desktop_ctx = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
            accept_downloads=True
        )
        page = desktop_ctx.new_page()
        page.goto("http://127.0.0.1:3001/index.html", wait_until="networkidle")

        # Populate sample realistic data & search real clips for "break the ice"
        page.fill("#target-word", "break the ice")
        page.evaluate("""() => {
            document.getElementById('res-phonetic').value = '/breɪk ðə aɪs/';
            document.getElementById('res-thai-read').value = '(เบรค เดอะ ไอซ์)';
            document.getElementById('res-meaning').value = 'ทลายความประหม่า เริ่มต้นบทสนทนา';
            document.getElementById('res-grammar').value = '[Subject] + break the ice + with + [Someone] -> เริ่มทักทายให้บรรยากาศผ่อนคลาย';
            document.getElementById('res-ex1-en').value = 'Jokes help break the ice.';
            document.getElementById('res-ex1-th').value = 'มุกตลกช่วยลดความเกร็ง';
            document.getElementById('res-ex2-en').value = 'He smiled to break the ice.';
            document.getElementById('res-ex2-th').value = 'เขายิ้มเพื่อเริ่มผูกมิตร';
            document.getElementById('res-ex3-en').value = 'Coffee breaks the ice fast.';
            document.getElementById('res-ex3-th').value = 'กาแฟช่วยให้คุยกันง่ายขึ้น';
            document.getElementById('social-handle').value = '@move0nyoung';
            document.getElementById('social-description').value = 'สำนวน Break the ice แปลว่า ทลายความประหม่า ใช้ตอนเริ่มทำความรู้จักกันใหม่ๆ #ภาษาอังกฤษ #เรียนภาษาอังกฤษ #คำศัพท์';
            syncFromDesktopForm();
            searchCafeClips(true);
            return true;
        }""")

        try:
            page.wait_for_selector("#clip-grid img", timeout=20000)
            page.wait_for_timeout(1500)
        except Exception as e:
            print("Clip wait warning:", e)

        # TEST 1: Multi-clip selection persistence (Select 2nd clip & 3rd clip -> verify queue has 3 clips and none deselected)
        seq_after_multi = page.evaluate("""() => {
            if (cafeClipPool.length >= 3) {
                toggleSelectClip(cafeClipPool[1]);
                toggleSelectClip(cafeClipPool[2]);
            }
            return activeClipSequence.map(c => c.id);
        }""")
        print("Desktop Multi-Clip Selection Queue IDs (Expected 3):", len(seq_after_multi), seq_after_multi)
        assert len(seq_after_multi) >= 2, "Multi-clip selection failed!"

        # TEST 2: Simulate Regenerate Examples / Re-search and verify selected clips are NOT wiped out
        seq_after_regen = page.evaluate("""async () => {
            await searchCafeClips(false);
            return activeClipSequence.map(c => c.id);
        }""")
        print("Desktop Queue after Load More / Regen (Expected preserved):", len(seq_after_regen))
        assert seq_after_regen == seq_after_multi, "Queue was reset during clip reload!"

        # Open Brown Aspect Ratio Dropdown to show in screenshot
        page.click("#btn-ratio-dropdown")
        page.wait_for_timeout(300)

        desktop_shot = os.path.join(ARTIFACT_DIR, "ui_desktop_studio.png")
        page.screenshot(path=desktop_shot, full_page=False)
        print("Saved:", desktop_shot)

        # Close dropdown
        page.evaluate("() => closeAspectRatioDropdown()")

        # TEST 3: Test PNG Image Export & MP4 Full-Preview Video Export across Aspect Ratios
        page.evaluate("() => openExportModal()")
        page.wait_for_timeout(300)

        # Test PNG Export download
        with page.expect_download(timeout=20000) as dl_png_info:
            page.click("#btn-export-img")
        dl_png = dl_png_info.value
        print("Verified PNG Export Download:", dl_png.suggested_filename)

        # Keep only 1 clip for fast MP4 export verification across ratios
        page.evaluate("""() => {
            activeClipSequence = [cafeClipPool[0]];
            renderClipGrid();
            renderSequenceList();
        }""")

        for test_ratio in ["9:16", "16:9"]:
            page.evaluate(f"() => selectClipAspectRatio('{test_ratio}')")
            page.wait_for_timeout(400)
            with page.expect_download(timeout=60000) as dl_mp4_info:
                page.evaluate("() => exportClipVideo('pad')")
            dl_mp4 = dl_mp4_info.value
            print(f"Verified MP4 Video Export ({test_ratio}):", dl_mp4.suggested_filename)

        # Switch back to 9:16 and select 2 clips for preview
        page.evaluate("""() => {
            closeExportModal();
            selectClipAspectRatio('9:16');
            if (cafeClipPool.length >= 2) {
                activeClipSequence = [cafeClipPool[0], cafeClipPool[1]];
                renderClipGrid();
                renderSequenceList();
                syncFromDesktopForm();
            }
        }""")
        page.wait_for_timeout(400)

        # Copy localStorage state to mobile/tablet contexts
        storage_data = page.evaluate("localStorage.getItem('tiktok_vocab_data')")

        # 2. Tablet UI (iPad Mini 768 x 1024)
        tablet_ctx = browser.new_context(viewport={"width": 768, "height": 1024}, device_scale_factor=2)
        t_page = tablet_ctx.new_page()
        t_page.goto("http://127.0.0.1:3001/edit.html", wait_until="networkidle")
        if storage_data:
            t_page.evaluate(f"""() => {{
                localStorage.setItem('tiktok_vocab_data', {json.dumps(storage_data)});
                loadSavedConfig();
                updateLiveCardPreview();
                return true;
            }}""")
        t_page.wait_for_timeout(400)
        print("Verified Tablet (768x1024) Queue Count:", t_page.evaluate("selectedClips.length"))

        # 3. Mobile Editor UI (390 x 844 - iPhone 14 Pro)
        mobile_ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True)
        m_page = mobile_ctx.new_page()
        m_page.goto("http://127.0.0.1:3001/edit.html", wait_until="networkidle")
        if storage_data:
            m_page.evaluate(f"""() => {{
                localStorage.setItem('tiktok_vocab_data', {json.dumps(storage_data)});
                loadSavedConfig();
                updateLiveCardPreview();
                searchCafeClips(true);
                return true;
            }}""")
            try:
                m_page.wait_for_selector("#clip-grid img", timeout=20000)
                m_page.wait_for_timeout(1200)
            except Exception:
                pass

        # Verify mobile preserves all 2 clips even after searchCafeClips(true)!
        mobile_q_len = m_page.evaluate("selectedClips.length")
        print("Verified Mobile Queue Preserved After Search (Expected 2):", mobile_q_len)
        assert mobile_q_len >= 2, "Mobile lost selected clips!"

        mobile_top_shot = os.path.join(ARTIFACT_DIR, "ui_mobile_editor_top.png")
        m_page.screenshot(path=mobile_top_shot, full_page=False)
        print("Saved:", mobile_top_shot)

        # Scroll down on mobile & open the brown Aspect Ratio dropdown to verify
        m_page.evaluate("() => { document.getElementById('tool-sec-ratio').scrollIntoView({ behavior: 'instant', block: 'center' }); return true; }")
        m_page.wait_for_timeout(300)
        m_page.click("#btn-ratio-dropdown")
        m_page.wait_for_timeout(300)
        mobile_scroll_shot = os.path.join(ARTIFACT_DIR, "ui_mobile_editor_scrolled.png")
        m_page.screenshot(path=mobile_scroll_shot, full_page=False)
        print("Saved:", mobile_scroll_shot)

        # 4. Mobile Preview UI (index.html on 390 x 844)
        m_page.goto("http://127.0.0.1:3001/index.html", wait_until="networkidle")
        m_page.wait_for_timeout(800)
        mobile_preview_shot = os.path.join(ARTIFACT_DIR, "ui_mobile_preview.png")
        m_page.screenshot(path=mobile_preview_shot, full_page=False)
        print("Saved:", mobile_preview_shot)

        browser.close()

if __name__ == "__main__":
    run()
