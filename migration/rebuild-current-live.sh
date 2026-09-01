#!/usr/bin/env bash
set -euo pipefail

readonly source_origin="https://www.setupandseen.co.uk"
readonly migration_stage="$(mktemp -d)"

fetch_file() {
  local source_path="$1"
  local destination="$2"
  mkdir -p "$(dirname "$destination")"
  curl --compressed --fail --silent --show-error --location --retry 3 \
    --user-agent "Set Up and Seen migration preservation" \
    "${source_origin}${source_path}" \
    --output "$destination"
}

fetch_page() {
  local route="$1"
  local destination="$2"
  fetch_file "$route" "$migration_stage/$destination/index.html"
}

fetch_file "/" "$migration_stage/index.html"
fetch_page "/advice" "advice"
fetch_page "/advice/diy-website-or-professional-website" "advice/diy-website-or-professional-website"
fetch_page "/competition" "competition"
fetch_page "/competition/terms" "competition/terms"
fetch_page "/competition/thank-you" "competition/thank-you"
fetch_page "/our-work" "our-work"
fetch_page "/packages" "packages"
fetch_page "/privacy" "privacy"
fetch_page "/services/branding-logo-design" "services/branding-logo-design"
fetch_page "/services/express-websites" "services/express-websites"
fetch_page "/services/marketing-support" "services/marketing-support"
fetch_page "/services/social-media-management" "services/social-media-management"
fetch_page "/services/social-media-setup" "services/social-media-setup"
fetch_page "/services/website-audit" "services/website-audit"
fetch_page "/services/website-design" "services/website-design"
fetch_page "/services/website-hosting-care" "services/website-hosting-care"
fetch_page "/terms" "terms"
fetch_page "/thank-you" "thank-you"

fetch_file "/assets/competition-form-CrbGSLgY.js" "$migration_stage/assets/competition-form-CrbGSLgY.js"
fetch_file "/assets/cookie-consent-MCS1Jtf1.js" "$migration_stage/assets/cookie-consent-MCS1Jtf1.js"
fetch_file "/assets/framework-CXnKph_e.js" "$migration_stage/assets/framework-CXnKph_e.js"
fetch_file "/assets/index-BBEjx44v.css" "$migration_stage/assets/index-BBEjx44v.css"
fetch_file "/assets/index-DPnhzAdT.js" "$migration_stage/assets/index-DPnhzAdT.js"
fetch_file "/assets/layout-segment-context-BsgctYr0.js" "$migration_stage/assets/layout-segment-context-BsgctYr0.js"
fetch_file "/assets/link-DDLuDF7C.js" "$migration_stage/assets/link-DDLuDF7C.js"
fetch_file "/assets/page-CRbireym.js" "$migration_stage/assets/page-CRbireym.js"
fetch_file "/assets/rolldown-runtime-S-ySWqyJ.js" "$migration_stage/assets/rolldown-runtime-S-ySWqyJ.js"

fetch_file "/clent-auto-repairs.webp" "$migration_stage/clent-auto-repairs.webp"
fetch_file "/clent-hills-campers-vans.webp" "$migration_stage/clent-hills-campers-vans.webp"
fetch_file "/tailored-pet-co-website.webp" "$migration_stage/tailored-pet-co-website.webp"
fetch_file "/favicon-v2.png" "$migration_stage/favicon-v2.png"
fetch_file "/og.png" "$migration_stage/og.png"
fetch_file "/robots.txt" "$migration_stage/robots.txt"
fetch_file "/sitemap.xml" "$migration_stage/sitemap.xml"

curl --compressed --silent --show-error --location --retry 3 \
  --user-agent "Set Up and Seen migration preservation" \
  "$source_origin/404-migration-preservation-check" \
  --output "$migration_stage/404.html"
cp "$migration_stage/404.html" "$migration_stage/404.txt"

cp netlify-site/_headers "$migration_stage/_headers"
cp netlify-site/_redirects "$migration_stage/_redirects"
cp netlify-site/netlify-migration-v1.js "$migration_stage/netlify-migration-v1.js"

MIGRATION_STAGE="$migration_stage" python3 <<'PY'
import os
import re
from pathlib import Path

root = Path(os.environ["MIGRATION_STAGE"])
script_tag = '<script defer src="/netlify-migration-v1.js"></script>'

for path in root.rglob("*.html"):
    if path.name == "404.html":
        continue
    source = path.read_text(encoding="utf-8")
    source = re.sub(
        r"<script>\(function\(\)\{function c\(\).*?</script>",
        "",
        source,
        flags=re.DOTALL,
    )
    if script_tag not in source:
        source = source.replace("</head>", script_tag + "</head>", 1)
    path.write_text(source, encoding="utf-8")

home = root / "index.html"
source = home.read_text(encoding="utf-8")
source = source.replace(
    '<form name="enquiry" aria-live="polite" action="/api/enquiries" method="POST">',
    '<form name="enquiry" aria-live="polite" action="/thank-you" method="POST" data-netlify="true" data-netlify-honeypot="website">',
    1,
)
home.write_text(source, encoding="utf-8")

competition = root / "competition" / "index.html"
source = competition.read_text(encoding="utf-8")
source = source.replace(
    '<form class="draw-form" aria-label="Website Starter Prize Draw entry form" action="/api/competition" method="POST">',
    '<form class="draw-form" name="website-starter-prize-draw-2026" aria-label="Website Starter Prize Draw entry form" action="/competition/thank-you" method="POST" data-netlify="true" data-netlify-honeypot="website"><input type="hidden" name="form-name" value="website-starter-prize-draw-2026"/>',
    1,
)
competition.write_text(source, encoding="utf-8")

privacy = root / "privacy" / "index.html"
source = privacy.read_text(encoding="utf-8")
old_privacy_provider = "We use service providers only where needed to run the website and business. These include Netlify, OpenAI Sites and Cloudflare for website hosting, enquiry handling, form notifications, database storage and security; Stripe when a customer uses an agreed payment link; and our email and document providers. Information may also be shared with professional advisers or public authorities where legally required."
new_privacy_provider = "We use service providers only where needed to run the website and business. These include Netlify for website hosting, deployment, security, spam filtering, and the processing and storage of enquiries and prize draw entries submitted through Netlify Forms; Stripe when a customer uses an agreed payment link; and our email and document providers. Information may also be shared with professional advisers or public authorities where legally required."
source = source.replace(
    "Last updated 28 August 2026",
    "Last updated 1 September 2026",
)
source = source.replace(old_privacy_provider, new_privacy_provider)
privacy.write_text(source, encoding="utf-8")

homepage_bundle = root / "assets" / "page-CRbireym.js"
source = homepage_bundle.read_text(encoding="utf-8")
source = source.replace(
    "Thank you. Your message is safely with us.",
    "Thank you — we’ve received your enquiry and will be in touch shortly.",
)
source = source.replace(
    "We will review your enquiry and contact you as soon as possible. A confirmation email has also been requested for the address you supplied.",
    "No further action is needed.",
)
homepage_bundle.write_text(source, encoding="utf-8")

assert 'data-netlify="true"' in home.read_text(encoding="utf-8")
assert 'data-netlify="true"' in competition.read_text(encoding="utf-8")
assert old_privacy_provider not in privacy.read_text(encoding="utf-8")
assert privacy.read_text(encoding="utf-8").count(new_privacy_provider) == 2
assert privacy.read_text(encoding="utf-8").count("Last updated 1 September 2026") == 2
assert "confirmation email" not in homepage_bundle.read_text(encoding="utf-8").lower()
assert (root / "404.html").read_text(encoding="utf-8").strip() == "Not Found"
assert len(list(root.rglob("*.html"))) == 20
PY

python3 migration/apply-seo-fixes.py "$migration_stage"

rsync --archive --delete "$migration_stage/" netlify-site/

node --check netlify-site/netlify-migration-v1.js
test "$(find netlify-site -type f | wc -l)" -eq 40
test "$(grep -l 'data-netlify="true"' netlify-site/index.html netlify-site/competition/index.html | wc -l)" -eq 2
test "$(grep -l 'G-C860VPVLNT' netlify-site/index.html | wc -l)" -eq 1
