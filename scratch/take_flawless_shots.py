import asyncio
from playwright.async_api import async_playwright

async def capture_clean():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        ctx = await browser.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=2)
        page = await ctx.new_page()
        await page.goto('http://localhost:3000', wait_until='networkidle')
        await page.wait_for_timeout(1000)
        
        # Capture Standalone Phone Card
        phone = page.locator('#phone-container')
        await phone.wait_for(state='visible')
        await phone.screenshot(path='public/screenshots/phone_standalone.png')
        print("phone_standalone.png captured!")

        # Capture Desktop Full Studio
        await page.screenshot(path='public/screenshots/desktop_preview_clean.png')
        print("desktop_preview_clean.png captured!")

        # Dark mode
        await page.evaluate("() => { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }")
        await page.wait_for_timeout(500)
        await page.screenshot(path='public/screenshots/desktop_dark_clean.png')
        print("desktop_dark_clean.png captured!")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(capture_clean())
