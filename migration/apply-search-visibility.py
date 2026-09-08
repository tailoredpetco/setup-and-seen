#!/usr/bin/env python3
"""Keep SEO copy consistent across HTML, render data and the homepage client.

The preserved homepage is a client component. Patch its matching client module
as well as the initial HTML, then version the affected import graph so visitors
cannot receive a year-cached older bundle. Existing bundles stay available for
older cached documents. No form, consent, routing or campaign logic is changed.
"""
from html import escape
from pathlib import Path
import json
import re
import sys

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "netlify-site")

PAGE_META = {
    "index.html": (
        "Web Design Worcestershire | Set Up & Seen",
        "Web design, branding and social media for small businesses in Worcestershire and across the UK. Explore website packages from £495 and request a quote.",
    ),
    "packages/index.html": (
        "Small Business Website Packages & Prices | Set Up & Seen",
        "Compare website packages from £495 and a £149 monthly plan over 12 months (£1,788 total). See inclusions, hosting costs and request a clear quote.",
    ),
    "services/website-design/index.html": (
        "Small Business Website Design UK | Set Up & Seen",
        "Mobile-friendly websites for start-ups and small businesses, from £495. Based in Worcestershire, working UK-wide. View real projects and request a quote.",
    ),
    "services/branding-logo-design/index.html": (
        "Logo Design & Branding Worcestershire | Set Up & Seen",
        "Logo design and branding for small businesses in Worcestershire and across the UK, from £495. Explore the process and request a clear quote.",
    ),
    "services/social-media-setup/index.html": (
        "Social Media Setup for Small Businesses | Set Up & Seen",
        "Professional social media setup for UK small businesses from £395. Get consistent profiles, branded graphics and launch posts. Ask about your business.",
    ),
    "services/social-media-management/index.html": (
        "Small Business Social Media Management | Set Up & Seen",
        "Facebook and Instagram content planning, captions, graphics and scheduling for UK small businesses from £325 a month. Explore the scope and enquire.",
    ),
    "services/website-hosting-care/index.html": (
        "Website Hosting & Maintenance UK | Set Up & Seen",
        "Managed website hosting and care from £49 a month, with SSL, backups, form checks and a small monthly update. See what is included and enquire.",
    ),
    "services/website-audit/index.html": (
        "Small Business Website Audit UK | Set Up & Seen",
        "Find what to improve on your website with a £195 audit of design, mobile usability, content, enquiries and SEO basics. See the scope and book an audit.",
    ),
    "services/express-websites/index.html": (
        "Five-Day Website Design UK | Set Up & Seen",
        "Priority website design for £999, within five working days once content, payment and access are ready. Check the scope and ask about availability.",
    ),
    "services/one-day-website/index.html": (
        "One-Day Website Design UK | Set Up & Seen",
        "A one-page website for £495, prepared for launch within one booked working day once everything is ready. Hosting is separate. Check availability.",
    ),
    "services/managed-website-starter/index.html": (
        "Pay Monthly Website Design UK | Set Up & Seen",
        "A five-page website with domain, hosting and care for £149 a month over 12 months (£1,788 total). Explore the scope and enquire about the monthly plan.",
    ),
    "our-work/index.html": (
        "Small Business Website Design Portfolio | Set Up & Seen",
        "See websites created for Clent Auto Repairs, Clent Hills Campers & Vans and The Tailored Pet Co. Explore the projects and discuss your website.",
    ),
    "advice/index.html": (
        "Small Business Website Advice & Guides | Set Up & Seen",
        "Practical advice on small business websites, branding and online visibility. Read the guides, compare your options and ask for advice on your next step.",
    ),
    "advice/diy-website-or-professional-website/index.html": (
        "DIY vs Professional Website Design | Set Up & Seen",
        "Should you build your own business website or hire a designer? Compare time, cost and practical trade-offs, then explore the website packages.",
    ),
}

COST_ANSWER = (
    "Website Starter begins at £495 for up to five pages, normally completed in 2–4 weeks. "
    "The One-Day Website is £495 for one page within a booked working day once everything is ready. "
    "Express Website Set Up is £999 for a priority build of up to five pages. "
    "Managed Website Starter is £149 a month for 12 months (£1,788 total), including hosting and care during the plan. "
    "Domain and hosting costs are separate for the one-off packages. Your written proposal confirms the scope and total cost."
)
OLD_COST_ANSWERS = [
    "Our Website Starter begins at £495 and is normally completed within 2–4 weeks. Our priority Express Website Set Up is £999 and is completed within a maximum of five working days once everything required is ready. Larger websites and combined launch packages start from the prices shown above.",
    "Our Website Starter begins at £495 and is normally completed within 2–4 weeks. The priority Express Website Set Up is £999 and is completed within a maximum of five working days once everything required is ready. Larger or more complex websites receive a clear, bespoke quote before work begins.",
    "Our One-Day Website and standard Website Starter both begin at £495. The Managed Website Starter is £149 a month for 12 months, with managed hosting and care included during the plan. Express Website Set Up is £999 for a priority five-page build. Larger projects receive a clear quote before work begins.",
]

HOME_COPY = [
    ("Get your business", "Web design for"),
    ("set up & seen.", "small businesses."),
    ("Websites, branding and social media for UK small businesses", "Worcestershire web design, branding and social media"),
    ("We help new and growing businesses build a clear, professional online presence — from branding and websites to social media — so customers can find them, trust them and choose them.",
     "We create professional websites, branding and social media for start-ups, sole traders and small businesses. Based in Worcestershire and working UK-wide, we make it easy for customers to understand your services and enquire."),
    ("Choose what your", "Website packages for"),
    ("business needs.", "small businesses."),
    ("£1,250", "£1,595"),
    ("£1,750", "£2,295"),
    ("Our most popular choice", "Best for a complete business launch"),
    ("Most popular", "Recommended for a full launch"),
]


def replace_copy(source, old, new):
    # These are the encodings present in HTML and the embedded Vinext stream.
    pairs = {(old, new), (escape(old), escape(new)),
             (old.replace("&", r"\u0026"), new.replace("&", r"\u0026"))}
    for before, after in sorted(pairs, key=lambda pair: len(pair[0]), reverse=True):
        source = source.replace(before, after)
    return source


def set_metadata(source, title, description):
    source, count = re.subn(r"<title>.*?</title>", lambda _: "<title>" + escape(title) + "</title>", source, count=1)
    assert count == 1
    values = {"description": description, "og:title": title, "og:description": description,
              "twitter:title": title, "twitter:description": description}
    for selector, value in values.items():
        source = re.sub(r'(<meta (?:name|property)="' + selector + r'" content=")[^"]*',
                        lambda m: m[1] + escape(value), source)

    def update_chunk(text):
        text = re.sub(r'(\["\$","title",[^,]+,\{"children":)"(?:[^"\\]|\\.)*"',
                      lambda m: m[1] + json.dumps(title, ensure_ascii=False), text)
        for selector, value in values.items():
            text = re.sub(r'(\["\$","meta",[^,]+,\{"(?:name|property)":"' + selector + r'","content":)"(?:[^"\\]|\\.)*"',
                          lambda m: m[1] + json.dumps(value, ensure_ascii=False), text)
        return text
    source = map_chunks(source, update_chunk)
    return source


CHUNK = re.compile(r'self\.__VINEXT_RSC_CHUNKS__\.push\(("(?:[^"\\]|\\.)*")\)')


def map_chunks(source, transform):
    def update(match):
        text = transform(json.loads(match[1]))
        encoded = json.dumps(text, ensure_ascii=False).replace("<", r"\u003c").replace("&", r"\u0026")
        return "self.__VINEXT_RSC_CHUNKS__.push(" + encoded + ")"
    return CHUNK.sub(update, source)


def correct_text_lengths(text):
    # Flight T records count UTF-8 bytes, not characters. Existing service
    # schema records must be remeasured whenever an embedded FAQ changes.
    def correct(match):
        start = match.end()
        _, end = json.JSONDecoder().raw_decode(text[start:])
        length = len(text[start:start + end].encode("utf-8"))
        return match[1] + format(length, "x") + ","
    return re.sub(r'((?:^|\n)[a-f0-9]+:T)[a-f0-9]+,', correct, text)


for path in ROOT.rglob("*.html"):
    if path.name == "404.html":
        continue
    source = path.read_text()
    relative = path.relative_to(ROOT).as_posix()
    if relative in PAGE_META:
        title, description = PAGE_META[relative]
        assert len(title) < 60 and len(description) < 155, (relative, len(title), len(description))
        source = set_metadata(source, title, description)
    source = source.replace("https://wa.me/441384492406", "https://wa.me/447999071045")
    if relative == "index.html":
        for old, new in HOME_COPY:
            source = replace_copy(source, old, new)
        # Leave Social Media Set-up at its separately approved £395 price.
        source = source.replace('Branding Only</h4><div class="support-price"><span>from</span>£395',
                                'Branding Only</h4><div class="support-price"><span>from</span>£495')
        source = source.replace('class="service-link" href="/packages#website-starter"',
                                'class="service-link" href="/services/website-design"')
        source = source.replace('href="/packages#website-starter" class="service-link"',
                                'href="/services/website-design" class="service-link"')
    if relative == "services/website-design/index.html":
        for old, new in [
            ("A website that makes your business easier to choose.", "Small business web design in Worcestershire"),
            ("Clear structure, confident wording and a simple route to enquiry help customers understand what you offer and take the next step.",
             "Whether you are launching your first website or replacing an outdated one, we plan the pages around your services and the questions customers ask. Based in Worcestershire in the West Midlands, we work remotely with businesses across the UK. Clear wording, mobile-friendly design and straightforward enquiry routes help visitors decide whether you are right for them."),
            ("Clear deliverables, with no confusing extras.", "What is included in your website design?"),
            ("A straightforward process from first chat to finish.", "How your website is planned, built and launched"),
            ("Useful answers before you enquire.", "Small business website design FAQs"),
            ("The precise scope is confirmed in your proposal. These are the core elements included in this service.",
             "Your proposal confirms the page count, content responsibilities, platform and launch arrangements. Domain, hosting and third-party fees are separate for one-off website packages. The Managed Website Starter includes a standard .co.uk domain for the first year, hosting and care during its 12-month term."),
        ]:
            source = replace_copy(source, old, new)
        for external, internal in [
            ("https://www.clentautorepairs.co.uk", "/our-work#clent-auto-repairs"),
            ("https://www.clenthillscampersandvans.co.uk", "/our-work#clent-hills-campers-and-vans"),
            ("https://www.tailoredpetco.co.uk", "/our-work#the-tailored-pet-co"),
        ]:
            # Project detail pages explain the work and retain links to the
            # live client websites. Keep these links in the same browser tab.
            source = source.replace('href="' + external + '" target="_blank" rel="noreferrer"',
                                    'href="' + internal + '"')
            def replace_project_link(text, external=external, internal=internal):
                return text.replace('"href":"' + external + '","target":"_blank","rel":"noreferrer"',
                                    '"href":"' + internal + '"')
            source = map_chunks(source, replace_project_link)
    if relative == "packages/index.html":
        source = replace_copy(source, "Compare every package", "Compare website packages")
    for old in OLD_COST_ANSWERS:
        source = replace_copy(source, old, COST_ANSWER)
    source = map_chunks(source, correct_text_lengths)
    path.write_text(source)

# Generate versioned modules as a single dependency graph. Leave the existing
# immutable files untouched so pre-existing cached HTML still works.
MODULES = ["page-CRbireym.js", "index-DPnhzAdT.js", "link-DDLuDF7C.js",
           "layout-segment-context-BsgctYr0.js", "competition-form-CrbGSLgY.js"]
renamed = {name: name.replace(".js", "-seo1.js") for name in MODULES}
for old_name, new_name in renamed.items():
    source = (ROOT / "assets" / old_name).read_text()
    if old_name == "page-CRbireym.js":
        for old, new in HOME_COPY:
            source = replace_copy(source, old, new)
        source = source.replace('title:`Branding Only`,price:`£395`', 'title:`Branding Only`,price:`£495`')
        source = source.replace('title:`Websites`,href:`/packages#website-starter`',
                                'title:`Websites`,href:`/services/website-design`')
        source = source.replace("https://wa.me/441384492406", "https://wa.me/447999071045")
        for old in OLD_COST_ANSWERS:
            source = replace_copy(source, old, COST_ANSWER)
    for old, new in renamed.items():
        source = source.replace(old, new)
    (ROOT / "assets" / new_name).write_text(source)

for path in ROOT.rglob("*.html"):
    source = path.read_text()
    for old, new in renamed.items():
        source = source.replace(old, new)
    path.write_text(source)

# The progressive enhancement must use exactly the same FAQ as the initial page.
adapter = ROOT / "netlify-migration-v2.js"
source = adapter.read_text()
for old in OLD_COST_ANSWERS:
    source = replace_copy(source, old, COST_ANSWER)
adapter.write_text(source)
print("Search visibility copy and five versioned client modules generated.")
