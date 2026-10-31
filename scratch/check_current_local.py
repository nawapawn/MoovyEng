import asyncio
from playwright.async_api import async_playwright
import json

async def read_current_storage():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto('http://localhost:3000')
        await page.wait_for_timeout(1000)
        
        # Check current localStorage in browser
        storage = await page.evaluate("() => ({ movy_editor_draft: localStorage.getItem('movy_editor_draft'), movy_element_positions: localStorage.getItem('movy_element_positions') })")
        print("STORED IN LOCALSTORAGE:")
        print(json.dumps(storage, indent=2, ensure_ascii=False))
        await browser.close()

if __name__ == '__main__':
    asyncio.run(read_current_storage())
