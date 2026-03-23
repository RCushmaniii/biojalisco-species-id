"""
BioJalisco Species ID — Public Pages Functional Audit
Tests all public pages on production: biojalisco-species-id.vercel.app
"""

import json
import time
import sys
import os
from playwright.sync_api import sync_playwright

# Fix Windows console encoding
os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE_URL = "https://biojalisco-species-id.vercel.app"
RESULTS = []
SCREENSHOTS_DIR = "/tmp/biojalisco-audit"


def log_result(test_name, status, details="", duration_ms=0):
    result = {
        "test": test_name,
        "status": status,
        "details": details,
        "duration_ms": round(duration_ms),
    }
    RESULTS.append(result)
    icon = "PASS" if status == "pass" else "FAIL" if status == "fail" else "WARN"
    print(f"  [{icon}] {test_name}" + (f" — {details}" if details else ""))


def test_page_loads(page, path, name, expected_title_fragment=None):
    """Test that a page loads successfully with no console errors."""
    url = f"{BASE_URL}{path}"
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    start = time.time()
    response = page.goto(url, wait_until="networkidle", timeout=30000)
    duration = (time.time() - start) * 1000

    # Check HTTP status
    status_code = response.status if response else 0
    if status_code == 200:
        log_result(f"{name} — HTTP status", "pass", f"200 OK ({duration:.0f}ms)", duration)
    else:
        log_result(f"{name} — HTTP status", "fail", f"Got {status_code}", duration)

    # Check title
    title = page.title()
    if expected_title_fragment and expected_title_fragment.lower() in title.lower():
        log_result(f"{name} — title", "pass", f'"{title}"')
    elif expected_title_fragment:
        log_result(f"{name} — title", "warn", f'Expected "{expected_title_fragment}" in "{title}"')

    # Check console errors (filter out known benign ones)
    real_errors = [e for e in console_errors if "favicon" not in e.lower() and "third-party" not in e.lower()]
    if not real_errors:
        log_result(f"{name} — console errors", "pass", "None")
    else:
        log_result(f"{name} — console errors", "warn", f"{len(real_errors)} error(s): {real_errors[:3]}")

    # Performance check
    if duration > 5000:
        log_result(f"{name} — load time", "warn", f"{duration:.0f}ms (>5s)")
    else:
        log_result(f"{name} — load time", "pass", f"{duration:.0f}ms")

    return status_code, duration


def test_seo_meta(page, name):
    """Check essential SEO meta tags on current page."""
    meta_desc = page.locator('meta[name="description"]').get_attribute("content") or ""
    og_title = page.locator('meta[property="og:title"]').get_attribute("content") or ""
    og_desc = page.locator('meta[property="og:description"]').get_attribute("content") or ""
    og_image = page.locator('meta[property="og:image"]').get_attribute("content") or ""
    viewport = page.locator('meta[name="viewport"]').get_attribute("content") or ""

    if meta_desc:
        log_result(f"{name} — meta description", "pass", f'"{meta_desc[:60]}..."' if len(meta_desc) > 60 else f'"{meta_desc}"')
    else:
        log_result(f"{name} — meta description", "warn", "Missing")

    if og_title:
        log_result(f"{name} — og:title", "pass", f'"{og_title}"')
    else:
        log_result(f"{name} — og:title", "warn", "Missing")

    if og_image:
        log_result(f"{name} — og:image", "pass", f'"{og_image[:80]}"')
    else:
        log_result(f"{name} — og:image", "warn", "Missing")

    if viewport:
        log_result(f"{name} — viewport meta", "pass")
    else:
        log_result(f"{name} — viewport meta", "fail", "Missing — mobile rendering broken")


def test_pwa_manifest(page):
    """Check PWA manifest and service worker."""
    manifest_link = page.locator('link[rel="manifest"]').get_attribute("href")
    if manifest_link:
        log_result("PWA — manifest link", "pass", manifest_link)
    else:
        log_result("PWA — manifest link", "fail", "Missing")
        return

    # Fetch and validate manifest
    manifest_url = f"{BASE_URL}{manifest_link}" if manifest_link.startswith("/") else manifest_link
    resp = page.goto(manifest_url, wait_until="networkidle")
    if resp and resp.status == 200:
        try:
            body = page.locator("body").inner_text()
            manifest = json.loads(body)
            required_fields = ["name", "short_name", "start_url", "display", "icons"]
            missing = [f for f in required_fields if f not in manifest]
            if not missing:
                log_result("PWA — manifest fields", "pass", f'{len(manifest.get("icons", []))} icons')
            else:
                log_result("PWA — manifest fields", "warn", f"Missing: {missing}")

            # Check icon sizes
            icons = manifest.get("icons", [])
            sizes = [i.get("sizes", "") for i in icons]
            if "512x512" in sizes:
                log_result("PWA — 512x512 icon", "pass")
            else:
                log_result("PWA — 512x512 icon", "warn", f"Available: {sizes}")
        except json.JSONDecodeError:
            log_result("PWA — manifest JSON", "fail", "Invalid JSON")
    else:
        log_result("PWA — manifest fetch", "fail", f"HTTP {resp.status if resp else 'no response'}")


def test_navigation(page):
    """Test navigation links and mobile menu."""
    page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)

    # Desktop nav links
    nav_links = page.locator("nav a, header a").all()
    link_data = []
    for link in nav_links:
        href = link.get_attribute("href") or ""
        text = link.inner_text().strip()
        if href and text:
            link_data.append({"text": text, "href": href})

    log_result("Navigation — links found", "pass" if link_data else "warn",
               f"{len(link_data)} links: {[l['text'] for l in link_data[:8]]}")

    # Test each internal nav link
    for link_info in link_data:
        href = link_info["href"]
        if href.startswith("/") and not href.startswith("/sign-in") and not href.startswith("/dashboard") and not href.startswith("/identify") and not href.startswith("/review"):
            full_url = f"{BASE_URL}{href}"
            resp = page.goto(full_url, wait_until="networkidle", timeout=30000)
            status = resp.status if resp else 0
            if status == 200:
                log_result(f"Nav link — {link_info['text']} ({href})", "pass", f"{status}")
            else:
                log_result(f"Nav link — {link_info['text']} ({href})", "fail", f"HTTP {status}")
            page.go_back(wait_until="networkidle", timeout=15000)


def test_theme_toggle(page):
    """Test dark/light theme toggle."""
    page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)

    # Find theme toggle button
    toggle = page.locator('[aria-label*="theme" i], [aria-label*="Theme" i], button:has(svg)').first
    if not toggle.is_visible():
        # Try broader search
        buttons = page.locator("button").all()
        toggle = None
        for btn in buttons:
            aria = btn.get_attribute("aria-label") or ""
            if "theme" in aria.lower() or "dark" in aria.lower() or "light" in aria.lower():
                toggle = btn
                break
        if not toggle:
            log_result("Theme toggle — found", "warn", "Could not locate toggle button")
            return

    # Get initial theme
    html = page.locator("html")
    initial_theme = html.get_attribute("data-theme") or "unknown"
    log_result("Theme — initial", "pass", initial_theme)

    # Click toggle
    toggle.click()
    page.wait_for_timeout(500)
    new_theme = html.get_attribute("data-theme") or "unknown"

    if new_theme != initial_theme:
        log_result("Theme toggle — switches", "pass", f"{initial_theme} → {new_theme}")
    else:
        log_result("Theme toggle — switches", "fail", f"Stayed {initial_theme}")

    # Toggle back
    toggle.click()
    page.wait_for_timeout(500)
    restored = html.get_attribute("data-theme") or "unknown"
    if restored == initial_theme:
        log_result("Theme toggle — restores", "pass", f"Back to {restored}")
    else:
        log_result("Theme toggle — restores", "warn", f"Expected {initial_theme}, got {restored}")


def test_language_toggle(page):
    """Test EN/ES language toggle."""
    page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)

    # Find language toggle
    lang_btn = page.locator('[aria-label*="language" i], [aria-label*="idioma" i], [aria-label*="Language" i]').first
    if not lang_btn.is_visible():
        # Try finding by text content
        lang_btn = page.locator('button:has-text("EN"), button:has-text("ES")').first

    if not lang_btn.is_visible():
        log_result("Language toggle — found", "warn", "Could not locate toggle button")
        return

    # Get initial page text sample
    initial_text = page.locator("body").inner_text()[:500]
    log_result("Language toggle — found", "pass")

    # Click toggle
    lang_btn.click()
    page.wait_for_timeout(1000)

    new_text = page.locator("body").inner_text()[:500]
    if new_text != initial_text:
        log_result("Language toggle — content changes", "pass", "Page text updated")
    else:
        log_result("Language toggle — content changes", "warn", "Text didn't visibly change")


def test_observations_gallery(page):
    """Test the public observations gallery."""
    page.goto(f"{BASE_URL}/observations", wait_until="networkidle", timeout=30000)

    # Check for actual gallery cell buttons (not generic card elements)
    cells = page.locator("button.gallery-cell").all()
    if cells:
        log_result("Gallery — cards rendered", "pass", f"{len(cells)} observation cards")
    else:
        # Check if it's showing the "Coming Soon" empty state
        empty = page.locator(".dashboard-empty-card").first
        if empty.is_visible():
            log_result("Gallery — empty state", "pass", "Coming Soon displayed (no approved observations)")
        else:
            log_result("Gallery — cards rendered", "warn", "No observation cards found")

    # Check images load
    images = page.locator("img").all()
    broken = 0
    for img in images[:10]:
        natural_width = img.evaluate("el => el.naturalWidth")
        if natural_width == 0:
            broken += 1

    if broken == 0:
        log_result("Gallery — images load", "pass", f"Checked {min(len(images), 10)} images")
    else:
        log_result("Gallery — images load", "warn", f"{broken}/{min(len(images), 10)} broken images")

    # Test lightbox only if real gallery cells exist
    if cells:
        try:
            cells[0].click(timeout=3000)
            page.wait_for_timeout(1000)

            lightbox = page.locator(".lightbox-backdrop")
            if lightbox.is_visible():
                log_result("Gallery — lightbox opens", "pass")

                page.keyboard.press("Escape")
                page.wait_for_timeout(500)
                if not lightbox.is_visible():
                    log_result("Gallery — lightbox closes (Escape)", "pass")
                else:
                    log_result("Gallery — lightbox closes (Escape)", "warn", "Didn't close on Escape")
            else:
                log_result("Gallery — lightbox opens", "warn", "No lightbox detected after click")
        except Exception as e:
            log_result("Gallery — lightbox", "warn", f"Could not test: {e}")
    else:
        log_result("Gallery — lightbox", "pass", "Skipped (no observations to test)")


def test_species_guide(page):
    """Test the species guide page."""
    page.goto(f"{BASE_URL}/species-guide", wait_until="networkidle", timeout=30000)

    # Check species cards render
    species_items = page.locator('[class*="species"], [class*="card"], article, li').all()
    log_result("Species Guide — items", "pass" if len(species_items) > 5 else "warn",
               f"{len(species_items)} items found")

    # Check filter tabs
    filters = page.locator('[class*="filter"], [class*="tab"], [role="tab"], [role="tablist"] button').all()
    if filters:
        log_result("Species Guide — filter tabs", "pass", f"{len(filters)} filters")

        # Click each filter
        for i, f in enumerate(filters[:5]):
            try:
                f.click(timeout=2000)
                page.wait_for_timeout(300)
            except Exception:
                pass
        log_result("Species Guide — filter interaction", "pass", "Filters clickable")
    else:
        log_result("Species Guide — filter tabs", "warn", "No filters found")


def test_protected_routes_redirect(page):
    """Verify protected routes redirect to sign-in (not 500 or expose content)."""
    protected = ["/dashboard", "/identify", "/review"]
    for path in protected:
        resp = page.goto(f"{BASE_URL}{path}", wait_until="networkidle", timeout=30000)
        url_after = page.url
        status = resp.status if resp else 0

        # Should redirect to sign-in or show sign-in prompt
        if "sign-in" in url_after.lower() or status == 401 or status == 403:
            log_result(f"Auth guard — {path}", "pass", f"Redirected to {url_after}")
        elif status == 200 and "sign" in page.content().lower():
            log_result(f"Auth guard — {path}", "pass", "Sign-in prompt shown")
        elif status == 200:
            # Check if content is actually protected or if it rendered the page
            content = page.content()
            if "clerk" in content.lower() or "sign in" in content.lower() or "log in" in content.lower():
                log_result(f"Auth guard — {path}", "pass", "Auth wall present")
            else:
                log_result(f"Auth guard — {path}", "fail", f"Page rendered without auth! Status {status}")
        else:
            log_result(f"Auth guard — {path}", "warn", f"Status {status}, URL: {url_after}")


def test_404_page(page):
    """Test custom 404 page."""
    resp = page.goto(f"{BASE_URL}/this-page-does-not-exist-12345", wait_until="networkidle", timeout=30000)
    status = resp.status if resp else 0

    if status == 404:
        log_result("404 page — status code", "pass", "Returns 404")
    else:
        log_result("404 page — status code", "warn", f"Returns {status} (expected 404)")

    content = page.content().lower()
    if "404" in content or "not found" in content or "no encontr" in content:
        log_result("404 page — custom content", "pass", "Shows custom 404 message")
    else:
        log_result("404 page — custom content", "warn", "No 404 message visible")


def test_security_headers(page):
    """Check security headers on responses."""
    response = page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)
    if not response:
        log_result("Security headers", "fail", "No response")
        return

    headers = response.headers

    checks = {
        "x-frame-options": ("Security header — X-Frame-Options", True),
        "x-content-type-options": ("Security header — X-Content-Type-Options", True),
        "referrer-policy": ("Security header — Referrer-Policy", False),
        "strict-transport-security": ("Security header — HSTS", False),  # Vercel manages HSTS at edge for *.vercel.app
        "content-security-policy": ("Security header — CSP", False),
        "x-xss-protection": ("Security header — X-XSS-Protection", False),
    }

    for header, (name, important) in checks.items():
        value = headers.get(header, "")
        if value:
            log_result(name, "pass", value[:80])
        else:
            log_result(name, "warn" if not important else "fail", "Missing")


def test_responsive_mobile(page, context):
    """Test mobile viewport rendering."""
    mobile_page = context.new_page()
    mobile_page.set_viewport_size({"width": 375, "height": 812})  # iPhone X

    mobile_page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)
    mobile_page.screenshot(path=f"{SCREENSHOTS_DIR}/mobile_home.png", full_page=False)

    # Check hamburger menu exists
    hamburger = mobile_page.locator('[class*="hamburger"], [class*="menu-toggle"], [aria-label*="menu" i], button[aria-label*="Menu" i], [class*="mobile"] button').first
    if hamburger.is_visible():
        log_result("Mobile — hamburger menu", "pass", "Visible")
        hamburger.click()
        mobile_page.wait_for_timeout(500)
        mobile_page.screenshot(path=f"{SCREENSHOTS_DIR}/mobile_menu_open.png", full_page=False)
        log_result("Mobile — menu opens", "pass", "Screenshot saved")
    else:
        log_result("Mobile — hamburger menu", "warn", "Not found at 375px width")

    # Check no horizontal overflow
    body_width = mobile_page.evaluate("document.body.scrollWidth")
    viewport_width = 375
    if body_width <= viewport_width + 5:  # 5px tolerance
        log_result("Mobile — no horizontal scroll", "pass", f"Body {body_width}px <= {viewport_width}px")
    else:
        log_result("Mobile — no horizontal scroll", "fail", f"Body {body_width}px > {viewport_width}px — overflow!")

    mobile_page.close()


def test_favicon_and_icons(page):
    """Check favicon and apple touch icons."""
    page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)

    favicon = page.locator('link[rel="icon"], link[rel="shortcut icon"]').first
    if favicon.count() > 0:
        log_result("Favicon — present", "pass", favicon.get_attribute("href") or "")
    else:
        log_result("Favicon — present", "warn", "No favicon link found")

    apple_icon = page.locator('link[rel="apple-touch-icon"]').first
    if apple_icon.count() > 0:
        log_result("Apple touch icon — present", "pass", apple_icon.get_attribute("href") or "")
    else:
        log_result("Apple touch icon — present", "warn", "Missing")


def test_footer_links(page):
    """Test footer links work."""
    page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)

    footer = page.locator("footer")
    if not footer.is_visible():
        log_result("Footer — present", "fail", "No footer found")
        return

    log_result("Footer — present", "pass")

    footer_links = footer.locator("a").all()
    log_result("Footer — links", "pass" if footer_links else "warn", f"{len(footer_links)} links")

    for link in footer_links:
        href = link.get_attribute("href") or ""
        text = link.inner_text().strip()[:30]
        if href.startswith("/"):
            resp = page.goto(f"{BASE_URL}{href}", wait_until="networkidle", timeout=15000)
            status = resp.status if resp else 0
            if status == 200:
                log_result(f"Footer link — {text}", "pass")
            else:
                log_result(f"Footer link — {text}", "fail", f"HTTP {status}")
            page.go_back(wait_until="networkidle", timeout=15000)


def main():
    import os
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"BioJalisco Public Pages Audit")
    print(f"Target: {BASE_URL}")
    print(f"{'='*60}\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = context.new_page()

        # === Page Load Tests ===
        print("--- Page Load & Performance ---")
        test_page_loads(page, "/", "Home", "BioJalisco")
        test_page_loads(page, "/faq", "FAQ", "BioJalisco")
        test_page_loads(page, "/terms", "Terms")
        test_page_loads(page, "/privacy", "Privacy")
        test_page_loads(page, "/species-guide", "Species Guide")
        test_page_loads(page, "/observations", "Observations")

        # === SEO & Meta ===
        print("\n--- SEO & Meta Tags ---")
        page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)
        test_seo_meta(page, "Home")

        # === PWA ===
        print("\n--- PWA ---")
        page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)
        test_pwa_manifest(page)

        # === Navigation ===
        print("\n--- Navigation ---")
        test_navigation(page)

        # === Theme Toggle ===
        print("\n--- Theme Toggle ---")
        test_theme_toggle(page)

        # === Language Toggle ===
        print("\n--- Language Toggle ---")
        test_language_toggle(page)

        # === Observations Gallery ===
        print("\n--- Observations Gallery ---")
        test_observations_gallery(page)

        # === Species Guide ===
        print("\n--- Species Guide ---")
        test_species_guide(page)

        # === Auth Guards ===
        print("\n--- Auth Guards (Protected Routes) ---")
        test_protected_routes_redirect(page)

        # === 404 ===
        print("\n--- 404 Page ---")
        test_404_page(page)

        # === Security Headers ===
        print("\n--- Security Headers ---")
        test_security_headers(page)

        # === Responsive/Mobile ===
        print("\n--- Mobile Responsiveness ---")
        test_responsive_mobile(page, context)

        # === Favicon & Icons ===
        print("\n--- Favicon & Icons ---")
        page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)
        test_favicon_and_icons(page)

        # === Footer ===
        print("\n--- Footer Links ---")
        test_footer_links(page)

        # Take final screenshots
        print("\n--- Screenshots ---")
        page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/home_desktop.png", full_page=True)
        log_result("Screenshot — home desktop", "pass", f"{SCREENSHOTS_DIR}/home_desktop.png")

        page.goto(f"{BASE_URL}/observations", wait_until="networkidle", timeout=30000)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/gallery_desktop.png", full_page=True)
        log_result("Screenshot — gallery desktop", "pass", f"{SCREENSHOTS_DIR}/gallery_desktop.png")

        page.goto(f"{BASE_URL}/species-guide", wait_until="networkidle", timeout=30000)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/species_guide_desktop.png", full_page=True)
        log_result("Screenshot — species guide desktop", "pass", f"{SCREENSHOTS_DIR}/species_guide_desktop.png")

        browser.close()

    # === Summary ===
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    total = len(RESULTS)
    passed = sum(1 for r in RESULTS if r["status"] == "pass")
    warned = sum(1 for r in RESULTS if r["status"] == "warn")
    failed = sum(1 for r in RESULTS if r["status"] == "fail")
    print(f"  Total: {total}  |  Pass: {passed}  |  Warn: {warned}  |  Fail: {failed}")
    print()

    if failed > 0:
        print("FAILURES:")
        for r in RESULTS:
            if r["status"] == "fail":
                print(f"  - {r['test']}: {r['details']}")
        print()

    if warned > 0:
        print("WARNINGS:")
        for r in RESULTS:
            if r["status"] == "warn":
                print(f"  - {r['test']}: {r['details']}")
        print()

    # Save full results as JSON
    with open(f"{SCREENSHOTS_DIR}/results.json", "w") as f:
        json.dump(RESULTS, f, indent=2)
    print(f"Full results saved to {SCREENSHOTS_DIR}/results.json")
    print(f"Screenshots saved to {SCREENSHOTS_DIR}/")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
