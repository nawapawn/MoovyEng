import asyncio
from playwright.async_api import async_playwright

async def verify_about():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1440, 'height': 900})
        
        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
        
        # 1. Open /about
        await page.goto('http://localhost:3000/about', wait_until='networkidle')
        title = await page.title()
        print('Page title:', title)
        
        # 2. Verify language toggle works
        lang_btn = page.locator('button:has-text("TH"), button:has-text("EN")').first
        await lang_btn.click()
        await page.wait_for_timeout(300)
        btn_text = await lang_btn.text_content()
        print('Language toggled to:', btn_text.strip())
        
        # 3. Test interactive gallery tabs
        await page.locator('button:has-text("ElevenLabs Luxury Dark Theme")').click()
        await page.wait_for_timeout(300)
        await page.locator('button:has-text("Mobile Creator Interface")').click()
        await page.wait_for_timeout(300)
        print('Gallery tabs interacted smoothly!')
        
        # 4. Verify picture sources exist
        picture = page.locator('picture source[type="image/avif"]')
        count = await picture.count()
        assert count > 0, "AVIF source element not found!"
        print(f"Verified AVIF picture element source! (Count: {count})")
        
        assert len(console_errors) == 0, f"Found console errors: {console_errors}"
        print("ALL ABOUT PAGE VERIFICATIONS PASSED 100%!")
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify_about())
