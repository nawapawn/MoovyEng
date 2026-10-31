import asyncio
from playwright.async_api import async_playwright

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()
        
        # 1. Main Studio
        await page.goto('http://localhost:3000', wait_until='networkidle')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='public/screenshots/hero_studio_1440.png')
        
        # 2. Dark mode studio
        await page.evaluate("() => { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }")
        await page.wait_for_timeout(500)
        await page.screenshot(path='public/screenshots/studio_dark_1440.png')

        # 3. Mobile touch view
        mob_context = await browser.new_context(viewport={'width': 414, 'height': 896})
        mob_page = await mob_context.new_page()
        await mob_page.goto('http://localhost:3000/edit', wait_until='networkidle')
        await mob_page.wait_for_timeout(1000)
        await mob_page.screenshot(path='public/screenshots/mobile_editor_touch.png')

        await browser.close()
        print('Captured all clean screenshots successfully!')

if __name__ == '__main__':
    asyncio.run(capture())
