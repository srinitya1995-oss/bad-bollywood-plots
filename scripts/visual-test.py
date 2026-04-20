"""Visual test script — screenshots every screen at mobile (375px) viewport."""
from playwright.sync_api import sync_playwright
import os

OUT = '/tmp/seedhaplot-screens'
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})

    # 1. HOME SCREEN
    page.goto('http://127.0.0.1:8080/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)  # animations
    page.screenshot(path=f'{OUT}/01-home.png', full_page=True)
    print('1. Home screen ✓')

    # 2. TAP HINDI (solo fast path)
    hi_btn = page.locator('.cinema-panel--hi')
    if hi_btn.count() > 0:
        hi_btn.click()
        page.wait_for_timeout(1500)
        page.screenshot(path=f'{OUT}/02-card-front.png', full_page=True)
        print('2. Card front ✓')

        # 3. FLIP CARD
        card = page.locator('.card-wrap')
        if card.count() > 0:
            card.click()
            page.wait_for_timeout(800)
            page.screenshot(path=f'{OUT}/03-card-back.png', full_page=True)
            print('3. Card back ✓')

            # 4. GOT IT
            got_it = page.locator('button:has-text("Got it")')
            if got_it.count() > 0:
                got_it.click()
                page.wait_for_timeout(500)
                page.screenshot(path=f'{OUT}/04-correct.png', full_page=True)
                print('4. Correct feedback ✓')

                # Play through remaining cards
                for i in range(11):
                    page.wait_for_timeout(400)
                    c = page.locator('.card-wrap:not(.flipped)')
                    if c.count() > 0:
                        c.click()
                        page.wait_for_timeout(600)
                        btn = page.locator('button:has-text("Got it")')
                        if btn.count() > 0:
                            btn.click()
                        page.wait_for_timeout(400)
                    # Check for continue screen
                    if page.locator('text=Keep going').count() > 0:
                        page.screenshot(path=f'{OUT}/05-continue.png', full_page=True)
                        print('5. Continue screen ✓')
                        page.locator('button:has-text("See results")').click()
                        page.wait_for_timeout(1500)
                        break

                # 5. RESULTS
                page.wait_for_timeout(1000)
                page.screenshot(path=f'{OUT}/06-results.png', full_page=True)
                print('6. Results screen ✓')

    # 6. HOME AGAIN — check coming-soon Tamil
    page.goto('http://127.0.0.1:8080/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    ta_btn = page.locator('.cinema-panel--ta')
    if ta_btn.count() > 0:
        ta_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path=f'{OUT}/07-tamil-coming-soon.png', full_page=True)
        print('7. Tamil coming-soon → suggest sheet ✓')
        # Close sheet
        overlay = page.locator('.sheet-overlay')
        if overlay.count() > 0:
            overlay.click(position={'x': 195, 'y': 50})
            page.wait_for_timeout(300)

    # 7. FEEDBACK SHEET
    fb_btn = page.locator('button:has-text("Feedback")')
    if fb_btn.count() > 0:
        fb_btn.first.click()
        page.wait_for_timeout(500)
        page.screenshot(path=f'{OUT}/08-feedback.png', full_page=True)
        print('8. Feedback sheet ✓')

    browser.close()

    print(f'\nAll screenshots saved to {OUT}/')
    for f in sorted(os.listdir(OUT)):
        if f.endswith('.png'):
            size = os.path.getsize(f'{OUT}/{f}')
            print(f'  {f} ({size//1024}KB)')
