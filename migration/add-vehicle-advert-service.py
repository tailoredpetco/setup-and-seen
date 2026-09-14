"""Add the approved vehicle-advert service without changing the site shell.
Run from the repository root. Safe to repeat.
"""
from pathlib import Path
import json
import re
from html import escape

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'netlify-site'
ROUTE = '/services/vehicle-advert-management'
URL = 'https://www.setupandseen.co.uk' + ROUTE
CTA = '/?service=Vehicle%20advert%20management#contact'
TITLE = 'Vehicle Advert Management for Van Dealers | Set Up & Seen'
DESC = 'Remote vehicle advert management for independent UK van dealers. Advert writing, photo preparation and stock updates. Monthly support from £300.'

def replace_once(text, old, new):
    if new in text:
        return text
    if text.count(old) != 1:
        raise ValueError('Expected one exact match: ' + old[:90])
    return text.replace(old, new, 1)

marketing_path = SITE / 'services/marketing-support/index.html'
marketing = marketing_path.read_text()
# Preserve the approved wordmark, navigation, consent, messaging and footer.
page = marketing
page = re.sub(r'<title>.*?</title>', '<title>' + TITLE.replace('&', '&amp;') + '</title>', page, count=1)
page = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + DESC + '">', page, count=1)
page = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="' + URL + '">', page, count=1)
for key, value in [('og:title', TITLE), ('og:description', DESC), ('og:url', URL), ('twitter:title', TITLE), ('twitter:description', DESC)]:
    page = re.sub(r'(<meta (?:property|name)="' + re.escape(key) + r'" content=")[^"]*(">)', lambda m: m[1] + value.replace('&', '&amp;') + m[2], page, count=1)
page = page.replace('</head>', '<link rel="stylesheet" href="/assets/vehicle-advert-service.css?v=1"></head>', 1)

faqs = [
    ('Do I need a new website?', 'Not usually. The service works through your existing website or stock-management system where suitable access is available. Your setup is checked before work is agreed. Website rebuilds, development and stock-feed repairs are separate services.'),
    ('Which websites and advertising platforms can you update?', 'That depends on your system and permissions. The starting package covers one existing stock-management system. Any connected website or advertising feeds are confirmed before work starts. Separate manual uploads to additional platforms are quoted separately; support for every platform is not assumed.'),
    ('What do I need to supply?', 'Complete vehicle details, the correct price and any applicable VAT wording, current mileage, confirmed specification, history and warranty information, plus your original photographs. You confirm the accuracy of the information and your permission to use the photographs. Missing facts are checked with you, not guessed.'),
    ('How are photographs prepared?', 'Your supplied photographs can be ordered, cropped and resized for the agreed platform. This does not include on-site photography, advanced retouching, or editing that hides damage or changes the vehicle’s condition.'),
    ('How quickly are adverts and changes made?', 'Working hours and turnaround times are agreed in writing after your setup is reviewed. The turnaround starts once all required details, photographs and approvals have been received. Please report sold vehicles and price changes promptly; the weekly review does not replace those notifications.'),
    ('Are advertising fees or sales enquiries included?', 'No. Advertising subscriptions and platform charges remain your responsibility. The service does not include answering buyer enquiries, taking deposits, negotiating sales, photography visits or repairing website integrations. Extra work is quoted separately.'),
    ('Can I start with a smaller trial?', 'Yes. Ask about a paid trial covering three listings. The scope and price are agreed after reviewing your system, before either of us commits to ongoing support.')
]
graph = {'@context': 'https://schema.org', '@graph': [
    {'@type': 'Service', '@id': URL + '#service', 'name': 'Vehicle advert management', 'description': DESC, 'url': URL, 'serviceType': 'Remote vehicle advert and stock-listing management', 'provider': {'@id': 'https://www.setupandseen.co.uk/#business'}, 'areaServed': {'@type': 'Country', 'name': 'United Kingdom'}},
    {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faqs]},
    {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.setupandseen.co.uk/'},
        {'@type': 'ListItem', 'position': 2, 'name': 'Marketing support', 'item': 'https://www.setupandseen.co.uk/services/marketing-support'},
        {'@type': 'ListItem', 'position': 3, 'name': 'Vehicle advert management', 'item': URL}
    ]}
]}
page = re.sub(r'<script type="application/ld\+json">\{"@context":"https://schema.org","@graph":.*?</script>', '<script type="application/ld+json">' + json.dumps(graph, ensure_ascii=False, separators=(',', ':')) + '</script>', page, count=1)
article = '''<article class="service-page vehicle-service">
<nav class="vehicle-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/services/marketing-support">Marketing support</a><span aria-hidden="true">/</span><span aria-current="page">Vehicle advert management</span></nav>
<header class="vehicle-hero section-pad">
<div class="vehicle-hero-copy"><p class="eyebrow">Vehicle advert management</p><h1>You sell the vans.<br><em>Leave the adverts to us.</em></h1><p class="vehicle-lead">Advert writing, photo preparation and stock updates for independent van dealers.</p><p class="vehicle-intro">Send your vehicle details and photographs. We will prepare your listings and keep your online stock up to date through your existing system.</p><a href="CTA" class="button primary">Enquire about advert support <span aria-hidden="true">↗</span></a><p class="vehicle-caption">Remote support across the UK. Your setup is checked before work is agreed.</p></div>
<aside class="vehicle-workflow" aria-label="An example of the advert preparation process"><div class="vehicle-workflow-top"><span>YOUR STOCK, CLEARLY PRESENTED</span><span class="vehicle-workflow-dot" aria-hidden="true"></span></div><h2>A clearer stock routine.</h2><p>From the details you supply to a listing you approve.</p><ol><li><span class="vehicle-step-number">01</span><div><strong>Details together</strong><span>Vehicle facts and original photographs.</span></div></li><li><span class="vehicle-step-number">02</span><div><strong>Advert prepared</strong><span>Clear wording and an organised photo set.</span></div></li><li><span class="vehicle-step-number">03</span><div><strong>Ready for your approval</strong><span>You confirm the facts before publishing.</span></div></li></ol><div class="vehicle-workflow-bottom">Your vehicles. Your facts. Your final approval.</div></aside>
</header>
<section class="vehicle-benefits section-pad" aria-label="The service at a glance"><article><span class="vehicle-small-number" aria-hidden="true">01</span><h2>Adverts written</h2><p>Clear descriptions based on the vehicle information you confirm.</p></article><article><span class="vehicle-small-number" aria-hidden="true">02</span><h2>Photos prepared</h2><p>Your images ordered, cropped and resized for the agreed platform.</p></article><article><span class="vehicle-small-number" aria-hidden="true">03</span><h2>Stock kept current</h2><p>Agreed price and availability updates when you report a change.</p></article></section>
<section class="service-page-section section-pad"><div class="section-heading"><div><p class="eyebrow">Built around your existing setup</p><h2>Less listing admin.<br>More time for your business.</h2></div><p>For independent dealers who already have a website or stock system but need someone to prepare the adverts and handle agreed updates. No new website is required where your current setup is suitable.</p></div><div class="vehicle-fit"><div><h3>A good fit when…</h3><p>You have the vehicle facts and photographs, but preparing listings and keeping them current keeps slipping down the to-do list.</p></div><div><h3>A clear division of work</h3><p>You remain responsible for vehicle facts, prices, approvals and buyer enquiries. We handle the agreed preparation and listing work.</p></div></div></section>
<section class="vehicle-package section-pad" id="monthly-support" aria-labelledby="vehicle-package-title"><div><p class="eyebrow">A clearly scoped starting package</p><h2 id="vehicle-package-title">Practical monthly support.</h2><p class="vehicle-price">£300 <span>per month</span></p><p>For one existing stock-management system, subject to a setup review and an agreed scope.</p><a href="CTA" class="button primary">Enquire about advert support <span aria-hidden="true">↗</span></a><p class="vehicle-package-note">No payment is taken when you enquire. The scope, terms, working hours and turnaround times are confirmed in writing before work starts.</p></div><div class="vehicle-package-detail"><h3>What the starting package covers</h3><ul><li>Up to eight new vehicle listings each month</li><li>Descriptions written from your confirmed vehicle details</li><li>Ordering, cropping and resizing of supplied photographs</li><li>Publishing through one agreed system, with your approval</li><li>A weekly stock review using the information you provide</li><li>A defined allowance for price and availability amendments, agreed in your quote</li></ul><div class="vehicle-exclusions"><strong>Kept separate</strong><p>Advertising subscriptions, platform fees, photography visits, buyer enquiries, website repairs and additional manual uploads. Any extra work is quoted before it is carried out.</p></div></div></section>
<section class="service-page-section section-pad"><div class="section-heading"><div><p class="eyebrow">How it works</p><h2>From your forecourt<br>to online.</h2></div><p>A simple process, with your approval built in. Suitable authorised access is agreed without sharing your personal password.</p></div><div class="service-process vehicle-process"><article><span class="vehicle-small-number" aria-hidden="true">01</span><h3>Check the setup</h3><p>Share your website address, stock system and typical listing volume. The access, scope and price are agreed first.</p></article><article><span class="vehicle-small-number" aria-hidden="true">02</span><h3>Send your stock</h3><p>Supply complete details and original photographs using an agreed form or shared folder.</p></article><article><span class="vehicle-small-number" aria-hidden="true">03</span><h3>Approve and publish</h3><p>Review the wording, price and image order. Once approved, the listing is published and checked on the agreed channels.</p></article><article><span class="vehicle-small-number" aria-hidden="true">04</span><h3>Keep it current</h3><p>Report sales and price changes promptly. Agreed updates are made within the working hours and response times in your quote.</p></article></div></section>
<section class="service-faq section-pad"><div><p class="eyebrow">Before you enquire</p><h2>A few useful answers.</h2></div><div class="faq-list">FAQS</div></section>
<section class="service-page-cta section-pad"><p class="eyebrow">Start with your current setup</p><h2>Tell us about your stock.</h2><p>Include your website address, the system you use and roughly how many vans you list each month. We will check the setup and recommend a clear scope. A smaller paid trial can also be discussed.</p><a href="CTA" class="button primary">Enquire about advert support <span aria-hidden="true">↗</span></a><p class="vehicle-return"><a href="/services/marketing-support">Explore other marketing support <span aria-hidden="true">→</span></a></p></section>
</article>'''
article = article.replace('CTA', CTA).replace('FAQS', ''.join('<details><summary>' + escape(q) + '<span aria-hidden="true">+</span></summary><p>' + escape(a) + '</p></details>' for q, a in faqs))
start = page.index('<article class="service-page">')
end = page.index('<footer class="simple-footer">', start)
page = page[:start] + article + page[end:]
new_dir = SITE / ROUTE.lstrip('/')
new_dir.mkdir(parents=True, exist_ok=True)
(new_dir / 'index.html').write_text(page)

# One contextual route beneath Marketing support; no extra homepage card.
related = '''<section class="service-page-section section-pad vehicle-related" id="vehicle-advert-support" aria-labelledby="vehicle-related-title"><div class="section-heading"><div><p class="eyebrow">Specialist support for independent van dealers</p><h2 id="vehicle-related-title">Vehicle adverts, taken care of.</h2></div><p>Advert writing, photo preparation and stock updates through your existing website or stock-management system. Monthly support starts at £300, with suitability and scope checked before work is agreed.</p></div><a href="/services/vehicle-advert-management" class="button primary">Explore vehicle advert management <span aria-hidden="true">↗</span></a></section>'''
if 'id="vehicle-advert-support"' not in marketing:
    marker = '<section class="service-page-section section-pad"><div class="section-heading"><div><p class="eyebrow">How it works</p>'
    marketing = replace_once(marketing, marker, related + marker)
    marketing_path.write_text(marketing)

# Preserve Netlify field names and submission behaviour.
home_path = SITE / 'index.html'
home = home_path.read_text()
old = '<option>Marketing support</option>'
new = old + '<option>Vehicle advert management</option>'
home_path.write_text(replace_once(home, old, new))
redirect_path = SITE / '_redirects'
redirects = redirect_path.read_text()
rule = ROUTE + ' ' + ROUTE + '/index.html 200!\n'
if rule not in redirects:
    marker = '/services/marketing-support /services/marketing-support/index.html 200!\n'
    redirects = replace_once(redirects, marker, marker + rule)
    redirect_path.write_text(redirects)
sitemap_path = SITE / 'sitemap.xml'
sitemap = sitemap_path.read_text()
if '<loc>' + URL + '</loc>' not in sitemap:
    sitemap = replace_once(sitemap, '</urlset>', '<url><loc>' + URL + '</loc><lastmod>2026-09-14</lastmod></url>\n</urlset>')
    sitemap_path.write_text(sitemap)
print('Vehicle advert service and its contextual links are ready.')
