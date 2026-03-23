"""Check what [role=dialog] elements exist on the observations page."""
import sys, os
os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

BASE_URL = "https://biojalisco-species-id.vercel.app"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    page.goto(f"{BASE_URL}/observations", wait_until="networkidle", timeout=30000)

    # Check what the main test's selectors actually find
    cards = page.locator('[class*="observation"], [class*="card"], article').all()
    print(f"Cards selector found {len(cards)} elements:")
    for i, c in enumerate(cards[:5]):
        tag = c.evaluate("el => el.tagName")
        cls = c.evaluate("el => el.className")
        text = c.inner_text()[:50]
        print(f"  [{i}] <{tag}> class='{cls}' text='{text}'")

    # Check for any dialog elements
    dialogs = page.locator('[role="dialog"]').all()
    print(f"\n[role=dialog] elements: {len(dialogs)}")
    for d in dialogs:
        cls = d.evaluate("el => el.className")
        visible = d.is_visible()
        print(f"  class='{cls}' visible={visible}")

    # Check for lightbox/modal/overlay elements
    overlays = page.locator('[class*="lightbox"], [class*="modal"], [class*="overlay"]').all()
    print(f"\nLightbox/modal/overlay elements: {len(overlays)}")
    for o in overlays:
        cls = o.evaluate("el => el.className")
        visible = o.is_visible()
        print(f"  class='{cls}' visible={visible}")

    browser.close()
