"""Apply the reviewed copy and test-harness corrections. Safe to repeat."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]

def replace(text, old, new):
    if new in text:
        return text
    if old not in text:
        raise ValueError('Expected source not found: ' + old[:100])
    return text.replace(old, new)

p = ROOT / 'migration/add-vehicle-advert-service.py'
s = p.read_text()
changes = [
    ("('Do I need a new website?'", "('Is a new website needed?'"),
    ("('What do I need to supply?'", "('What information is required?'"),
    ("('Can I start with a smaller trial?'", "('Is a smaller trial available?'"),
    ('before either of us commits to ongoing support.', 'before you commit to ongoing support.'),
    ('Send your vehicle details and photographs. We will prepare your listings and keep your online stock up to date through your existing system.', 'Send us your vehicle details and photographs. We prepare your descriptions, organise your images and update your listings through the website or stock system we agree with you.'),
    ('<p class="eyebrow">A clearly scoped starting package</p>', '<p class="eyebrow">Monthly support, quoted around your stock</p>'),
    ('<p class="vehicle-price">£300 <span>per month</span></p>', '<p class="vehicle-price"><span>From </span>£300 <span>per month</span></p>'),
    ('For one existing stock-management system, subject to a setup review and an agreed scope.', 'For up to eight new listings each month through one existing stock-management system. We confirm the monthly price after reviewing your setup and stock volume.'),
    ('No payment is taken when you enquire. The scope, terms, working hours and turnaround times are confirmed in writing before work starts.', 'No payment is taken when you enquire. Your written quote confirms the active-stock limit, amendment allowance, working hours, turnaround times, any minimum term, cancellation notice and extra-work prices before you decide.'),
    ('<h3>What the starting package covers</h3>', '<h3>The starting scope</h3>'),
    ('<li>A weekly stock review using the information you provide</li>', '<li>A weekly review of the active stock included in your quote</li>'),
    ('<li>A defined allowance for price and availability amendments, agreed in your quote</li>', '<li>A price and sold-status amendment allowance, agreed in your quote</li>'),
    ('<div class="vehicle-exclusions"><strong>Kept separate</strong><p>', '<div class="vehicle-exclusions"><strong>Clear limits, agreed first</strong><p>Eight new listings does not mean unlimited ongoing stock management. We agree how many active adverts we maintain and what counts as one amendment.</p><strong>Kept separate</strong><p>'),
    ('Advertising subscriptions, platform fees, photography visits, buyer enquiries, website repairs and additional manual uploads. Any extra work is quoted before it is carried out.', 'Advertising subscriptions, platform fees, paid advertising campaigns, photography visits, buyer enquiries, website repairs and additional manual uploads. We quote for extra work before carrying it out.'),
    ('Remote support across the UK. Your setup is checked before work is agreed.', 'Remote support across the UK. Listing preparation and updates, not paid advertising campaigns or buyer enquiry handling.')
]
for old, new in changes:
    s = replace(s, old, new)
old = "    ('Is a smaller trial available?', 'Yes. Ask about a paid trial covering three listings. The scope and price are agreed after reviewing your system, before you commit to ongoing support.')"
new = old + ",\n    ('How much existing stock is covered?', 'The eight-listing guide refers to new adverts prepared each month, not an unlimited number of active vehicles. Your quote sets the maximum active-stock count, the included price and sold-status amendment allowance, what counts as an amendment, and charges for extra work. The weekly review covers that agreed stock only.'),\n    ('What are the payment and cancellation terms?', 'Your written quote confirms the monthly fee, payment schedule, any minimum term and cancellation notice before you accept. These are not assumed to be the same as our website-build packages. No payment is taken when you enquire.')"
s = replace(s, old, new)
p.write_text(s)

p = ROOT / 'migration/test-vehicle-advert-service.cjs'
s = p.read_text()
changes = [
    ("const {JSDOM} = require('jsdom');", "const {JSDOM, VirtualConsole} = require('jsdom');"),
    ('// Set Up & Seen speaks as we/us. Customer-voiced FAQ questions are distinct.', '// Keep the complete service copy, including FAQ headings, free of singular voice.'),
    ('/We will prepare your listings/', '/We prepare your descriptions/'),
    ('.vehicle-service p, .vehicle-service a, .vehicle-service li', '.vehicle-service p, .vehicle-service a, .vehicle-service li, .vehicle-service summary'),
    ("assert.match(d.querySelector('.vehicle-package').textContent, /£300/);", "assert.match(d.querySelector('.vehicle-price').textContent, /^From £300 per month$/);\nassert.match(d.querySelector('.vehicle-package').textContent, /active-stock limit/);\nassert.match(d.querySelector('.vehicle-package').textContent, /cancellation notice/);\nassert.match(d.querySelector('.vehicle-package').textContent, /not mean unlimited/);"),
    ("assert.equal(d.querySelectorAll('.faq-list details').length, 7);", "assert.equal(d.querySelectorAll('.faq-list details').length, 9);"),
    ("  assert.equal(detail.querySelector('p').textContent, faq.mainEntity[i].acceptedAnswer.text);", "  assert.equal(detail.querySelector('p').textContent, faq.mainEntity[i].acceptedAnswer.text);\n  assert.equal(detail.querySelector('summary').childNodes[0].textContent, faq.mainEntity[i].name);\n  assert.doesNotMatch(faq.mainEntity[i].name, /\\b(?:I|me|my|mine|myself)\\b/);"),
    ("  const dom = new JSDOM(homeMarkup,", "  const jsdomErrors = [];\n  const virtualConsole = new VirtualConsole();\n  virtualConsole.on('jsdomError', error => jsdomErrors.push(String(error.stack || error)));\n  const dom = new JSDOM(homeMarkup,"),
    ("runScripts: 'outside-only', pretendToBeVisual: true", "runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole"),
    ("  const w = dom.window;", "  const w = dom.window;\n  // Track real observers so teardown cannot call into an already closed window.\n  const observers = [];\n  const OriginalMutationObserver = w.MutationObserver;\n  w.MutationObserver = class extends OriginalMutationObserver {\n    constructor(callback) { super(callback); observers.push(this); }\n  };"),
    ("  dom.window.close();\n  console.log", "  await new Promise(resolve => setImmediate(resolve));\n  assert.deepEqual(jsdomErrors, [], 'No unhandled errors during enquiry interactions');\n  observers.forEach(observer => observer.disconnect());\n  dom.window.close();\n  await new Promise(resolve => setImmediate(resolve));\n  assert.deepEqual(jsdomErrors, [], 'No unhandled errors after window teardown');\n  console.log")
]
for old, new in changes:
    s = replace(s, old, new)
p.write_text(s)
subprocess.run(['python', 'migration/add-vehicle-advert-service.py'], cwd=ROOT, check=True)
print('CLEAR copy, FAQ schema and strict test cleanup applied.')
