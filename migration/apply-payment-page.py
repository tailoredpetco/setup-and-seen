#!/usr/bin/env python3
"""Build a payment route for accepted £495 Website Starter proposals."""
from pathlib import Path
import re, sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else "netlify-site")
template = (root / "your-first-business-website/index.html").read_text()
head = template.split("</head>")[0] + "</head>"
head = re.sub(r"<title>.*?</title>", "<title>Pay an Agreed Project | Set Up &amp; Seen</title>", head)
head = head.replace("/your-first-business-website", "/pay")
head = re.sub(r'<script defer src="/package-finder-v1.js"></script>', "", head)
head = re.sub(r'<meta name="robots"[^>]*>', "", head)
head = re.sub(r'(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*', r'\1Secure payments for accepted Set Up &amp; Seen Website Starter proposals.', head)
head = re.sub(r'(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*', r'\1Pay an Agreed Project | Set Up &amp; Seen', head)
head = head.replace("</head>", '<meta name="robots" content="noindex,follow"/><style>.payment-page h1{max-width:900px}.payment-page .payment-notice{padding:24px;border-left:4px solid #315f8c;background:#fff;margin:28px 0;max-width:940px}.payment-page .payment-notice p{margin:8px 0 0}.payment-page .payment-notice .button{margin-top:20px}.payment-page .payment-card .button{margin-top:auto}.payment-page .payment-card h2{color:#315f8c}.payment-page .payment-card ul{margin-bottom:30px}</style></head>')
header = re.search(r'<div class="announcement">.*?</header>', template, re.S)[0]
footer = re.search(r'<footer class="simple-footer">.*?</footer>', template, re.S)[0]
body = (Path(__file__).parent / "payment-page-content.html").read_text()
page = head + '<body data-static-offer-page="true"><main id="main-content"><a class="skip-link" href="#main-content">Skip to main content</a>' + header + body + footer + '</main><button type="button" class="cookie-settings" aria-expanded="false">Cookie settings</button></body></html>'
dest = root / "pay/index.html"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(page)
redirects = root / "_redirects"
text = redirects.read_text()
rule = "/pay /pay/index.html 200!"
if rule not in text:
    text = rule + "\n" + text
redirects.write_text(text)
print("Payment page and route generated.")
