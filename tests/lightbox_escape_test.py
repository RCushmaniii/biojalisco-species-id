"""Quick test to debug lightbox Escape key behavior."""
import sys
import os
os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

BASE_URL = "https://biojalisco-species-id.vercel.app"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})

    page.goto(f"{BASE_URL}/observations", wait_until="networkidle", timeout=30000)

    # Find gallery buttons
    buttons = page.locator("button.gallery-cell").all()
    print(f"Found {len(buttons)} gallery cell buttons")

    if not buttons:
        print("No gallery items - cannot test lightbox")
        browser.close()
        sys.exit(0)

    # Click first gallery cell
    buttons[0].click()
    page.wait_for_timeout(1000)

    # Check lightbox
    backdrop = page.locator(".lightbox-backdrop")
    print(f"Lightbox visible: {backdrop.is_visible()}")
    page.screenshot(path="/tmp/biojalisco-audit/lightbox_open.png")

    # Check what has focus
    focused = page.evaluate("document.activeElement?.tagName + '.' + (document.activeElement?.className || '')")
    print(f"Focused element: {focused}")

    # Try pressing Escape on the page
    page.keyboard.press("Escape")
    page.wait_for_timeout(500)

    visible_after_escape = backdrop.is_visible() if backdrop.count() > 0 else False
    print(f"Lightbox visible after Escape: {visible_after_escape}")

    if visible_after_escape:
        # Try dispatching keydown directly on window
        print("Trying dispatchEvent on document...")
        page.evaluate("document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}))")
        page.wait_for_timeout(500)
        visible_after_dispatch = backdrop.is_visible() if backdrop.count() > 0 else False
        print(f"Lightbox visible after dispatchEvent: {visible_after_dispatch}")

        if visible_after_dispatch:
            # Try clicking the backdrop directly
            print("Trying click on backdrop...")
            backdrop.click(position={"x": 10, "y": 10})
            page.wait_for_timeout(500)
            visible_after_click = backdrop.is_visible() if backdrop.count() > 0 else False
            print(f"Lightbox visible after backdrop click: {visible_after_click}")

    page.screenshot(path="/tmp/biojalisco-audit/lightbox_after_escape.png")
    browser.close()
    print("Done")
