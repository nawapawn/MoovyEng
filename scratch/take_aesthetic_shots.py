import asyncio
from playwright.async_api import async_playwright

async def capture_aesthetic_shots():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        # 1. Desktop Full Studio Light Mode (High-DPI Retina scale 2 for razor-sharp text)
        ctx = await browser.new_context(viewport={'width': 1440, 'height': 880}, device_scale_factor=2)
        page = await ctx.new_page()
        await page.goto('http://localhost:3000', wait_until='networkidle')
        await page.wait_for_timeout(1200)
        await page.screenshot(path='public/screenshots/hero_studio_1440.png')
        print("Captured hero_studio_1440.png")

        # 2. Desktop Full Studio Dark Mode
        await page.evaluate("() => { document.documentElement.classList.add('dark'); localStorage.setItem('movy_theme', 'dark'); }")
        await page.wait_for_timeout(600)
        await page.screenshot(path='public/screenshots/studio_dark_1440.png')
        print("Captured studio_dark_1440.png")

        # 3. Dedicated Smartphone View - iPhone 14 Pro style (Mobile Editor /edit)
        mob_ctx = await browser.new_context(viewport={'width': 414, 'height': 820}, device_scale_factor=2)
        mob_page = await mob_ctx.new_page()
        await mob_page.goto('http://localhost:3000/edit', wait_until='networkidle')
        await mob_page.wait_for_timeout(1200)
        await mob_page.screenshot(path='public/screenshots/mobile_editor_touch.png')
        print("Captured mobile_editor_touch.png")

        await browser.close()
        print("All high quality screenshots captured successfully!")

if __name__ == '__main__':
    asyncio.run(capture_aesthetic_shots())
