"""Browser QA. Offline by default; live submission requires an explicit argument."""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import json
import mimetypes
import os
import re
import shutil
import sys
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'netlify-site'
OUT = ROOT / 'qa-clear'
OUT.mkdir(exist_ok=True)
ORIGIN = 'https://www.setupandseen.co.uk'
SERVICE = '/services/vehicle-advert-management'
ENQUIRY = '/?service=Vehicle%20advert%20management#contact'
LABEL = 'CLEAR-VEHICLE-20260914'
CHROME = os.environ.get('CHROME_BIN') or shutil.which('google-chrome') or shutil.which('chromium')
assert CHROME, 'A Chromium browser is required.'

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=CHROME, headless=True, args=['--no-sandbox'])
    if '--live-enquiry' in sys.argv:
        # This mode is run once, only through an explicit workflow condition.
        context = browser.new_context(viewport={'width': 390, 'height': 844})
        context.add_init_script("localStorage.setItem('setup-and-seen-cookie-consent', 'rejected')")
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        response = page.goto(ORIGIN + ENQUIRY, wait_until='domcontentloaded')
        assert response.status == 200
        form = page.locator('form[name="enquiry"]')
        expect(form.locator('[name="service"]')).to_have_value('Vehicle advert management', timeout=10000)
        form.locator('[name="name"]').fill('Set Up & Seen website test')
        form.locator('[name="business"]').fill('Set Up & Seen - test only')
        form.locator('[name="email"]').fill('info@setupandseen.co.uk')
        form.locator('[name="message"]').fill(LABEL + ' | WEBSITE TEST ONLY. Not a customer enquiry. Checking receipt of the Vehicle advert management form after the CLEAR review. No sales follow-up is needed.')
        form.locator('[name="privacy-consent"]').check()
        with page.expect_response(lambda response: response.request.method == 'POST' and response.url.rstrip('/') == ORIGIN, timeout=30000) as posted:
            form.locator('button[type="submit"]').click()
        post_status = posted.value.status
        assert post_status == 200, post_status
        page.locator('.enquiry-confirmation').wait_for(state='visible', timeout=15000)
        page.screenshot(path=str(OUT / 'live-enquiry-confirmation.png'), full_page=False)
        (OUT / 'live-enquiry.json').write_text(json.dumps({'label': LABEL, 'http_status': post_status, 'confirmation_visible': True, 'browser_errors': errors, 'netlify_storage_verified': False, 'email_delivery_verified': False}, indent=2))
        assert not errors, errors
        print('One labelled live enquiry submitted. Storage and email delivery require independent verification.')
        context.close()
    else:
        results = []
        for width in [320, 390, 768, 1440]:
            context = browser.new_context(viewport={'width': width, 'height': 900}, device_scale_factor=1)
            posts = []
            def route_handler(route):
                request = route.request
                parsed = urlparse(request.url)
                if parsed.netloc != 'www.setupandseen.co.uk':
                    route.fulfill(status=200, content_type='application/javascript', body='')
                    return
                if request.method == 'POST':
                    posts.append(parse_qs(request.post_data or '', keep_blank_values=True))
                    route.fulfill(status=200, body='Offline test only')
                    return
                path = (SITE / parsed.path.lstrip('/')).resolve()
                if not path.is_relative_to(SITE.resolve()):
                    route.fulfill(status=403)
                    return
                if path.is_dir():
                    path /= 'index.html'
                if not path.is_file():
                    route.fulfill(status=404)
                    return
                route.fulfill(status=200, content_type=mimetypes.guess_type(str(path))[0] or 'application/octet-stream', body=path.read_bytes())
            context.route('**/*', route_handler)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(ORIGIN + SERVICE, wait_until='load')
            page.evaluate('document.fonts.ready')
            assert page.locator('h1 em').inner_text() == 'Leave the adverts to us.'
            assert not re.search(r'\b(?:I|me|my|mine|myself)\b', page.locator('.vehicle-service').inner_text())
            assert page.locator('.vehicle-price').inner_text() == 'From £300 per month'
            if width == 390:
                page.screenshot(path=str(OUT / 'vehicle-390-cookie.png'), full_page=False)
            page.locator('.cookie-reject').click()
            assert page.locator('.cookie-banner').count() == 0
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
            page.screenshot(path=str(OUT / ('vehicle-' + str(width) + '.png')), full_page=True)
            page.locator('.vehicle-package').screenshot(path=str(OUT / ('package-' + str(width) + '.png')))
            if page.locator('.menu-button').is_visible():
                page.locator('.menu-button').click()
                assert page.locator('.menu-button').get_attribute('aria-expanded') == 'true'
                page.keyboard.press('Escape')
                assert page.locator('.menu-button').get_attribute('aria-expanded') == 'false'
            page.locator('.message-us-trigger').click()
            assert page.locator('#message-us-panel').is_visible()
            page.keyboard.press('Escape')
            assert not page.locator('#message-us-panel').is_visible()
            page.locator('.faq-list summary').first.click()
            assert page.locator('.faq-list details').first.get_attribute('open') is not None
            page.locator('.vehicle-hero a.button').click()
            form = page.locator('form[name="enquiry"]')
            expect(form.locator('[name="service"]')).to_have_value('Vehicle advert management', timeout=10000)
            form.locator('[name="name"]').fill('Offline QA')
            form.locator('[name="email"]').fill('qa@example.invalid')
            form.locator('[name="message"]').fill('Intercepted offline test. No live enquiry sent.')
            form.locator('[name="privacy-consent"]').check()
            form.locator('button[type="submit"]').click()
            page.locator('.enquiry-confirmation').wait_for(state='visible')
            assert len(posts) == 1 and posts[0]['service'] == ['Vehicle advert management']
            assert posts[0]['website'] == ['']
            assert not errors, errors
            results.append({'width': width, 'overflow': False, 'menu_message_faq_enquiry': 'passed', 'browser_errors': errors})
            context.close()
        (OUT / 'browser-checks.json').write_text(json.dumps({'mode': 'offline snapshot with intercepted network', 'checks': results}, indent=2))
        print('Responsive Chromium, cookie, menu, messaging, FAQ and intercepted enquiry checks passed at four widths.')
    browser.close()
