#!/usr/bin/env python3
"""Apply durable, privacy-safe SEO corrections to the preserved static site."""

import json
import re
import sys
from pathlib import Path


SOCIAL_PROFILES = [
    "https://www.facebook.com/setupandseen",
    "https://www.instagram.com/setupandseen",
]

OG_URLS = {
    "competition/terms/index.html": "https://www.setupandseen.co.uk/competition/terms",
    "privacy/index.html": "https://www.setupandseen.co.uk/privacy",
    "terms/index.html": "https://www.setupandseen.co.uk/terms",
}

SCHEMA_PATTERN = re.compile(
    r'(<script type="application/ld\+json">)(.*?)(</script>)', re.DOTALL
)


def includes_business_type(schema_type):
    types = schema_type if isinstance(schema_type, list) else [schema_type]
    return "Organization" in types or "ProfessionalService" in types


def update_schema(match):
    schema = json.loads(match.group(2))
    if (
        schema.get("@id") == "https://www.setupandseen.co.uk/#business"
        and includes_business_type(schema.get("@type"))
    ):
        schema["sameAs"] = SOCIAL_PROFILES
    return match.group(1) + json.dumps(
        schema, ensure_ascii=False, separators=(",", ":")
    ) + match.group(3)


def apply_html_fixes(site_root):
    updated = 0
    for path in sorted(site_root.rglob("*.html")):
        if path.name == "404.html":
            continue

        source = path.read_text(encoding="utf-8")
        corrected = SCHEMA_PATTERN.sub(update_schema, source)

        relative_path = path.relative_to(site_root).as_posix()
        if relative_path in OG_URLS:
            corrected, replacement_count = re.subn(
                r'<meta property="og:url" content="[^"]*"/>',
                f'<meta property="og:url" content="{OG_URLS[relative_path]}"/>',
                corrected,
                count=1,
            )
            if replacement_count != 1:
                raise RuntimeError(f"Expected one og:url tag in {relative_path}")

        if corrected != source:
            path.write_text(corrected, encoding="utf-8")
            updated += 1

    return updated


def apply_sitemap_fixes(site_root):
    sitemap = site_root / "sitemap.xml"
    source = sitemap.read_text(encoding="utf-8")
    corrected = re.sub(r"\n?<lastmod>[^<]+</lastmod>", "", source)
    corrected, replacement_count = re.subn(
        r"<loc>https://www\.setupandseen\.co\.uk</loc>",
        "<loc>https://www.setupandseen.co.uk/</loc>",
        corrected,
        count=1,
    )
    if replacement_count == 0 and (
        corrected.count("<loc>https://www.setupandseen.co.uk/</loc>") != 1
    ):
        raise RuntimeError("Expected one homepage URL in sitemap")
    if replacement_count > 1:
        raise RuntimeError("Expected only one homepage URL in sitemap")
    if corrected != source:
        sitemap.write_text(corrected, encoding="utf-8")


def validate(site_root):
    for path in sorted(site_root.rglob("*.html")):
        if path.name == "404.html":
            continue
        source = path.read_text(encoding="utf-8")
        business_schemas = []
        for match in SCHEMA_PATTERN.finditer(source):
            schema = json.loads(match.group(2))
            if schema.get("@id") == "https://www.setupandseen.co.uk/#business":
                business_schemas.append(schema)
        if not business_schemas:
            raise RuntimeError(f"Missing business schema in {path.relative_to(site_root)}")
        if any(schema.get("sameAs") != SOCIAL_PROFILES for schema in business_schemas):
            raise RuntimeError(f"Incorrect sameAs data in {path.relative_to(site_root)}")

    for relative_path, expected_url in OG_URLS.items():
        source = (site_root / relative_path).read_text(encoding="utf-8")
        expected_tag = f'<meta property="og:url" content="{expected_url}"/>'
        if source.count(expected_tag) != 1:
            raise RuntimeError(f"Incorrect og:url in {relative_path}")

    sitemap = (site_root / "sitemap.xml").read_text(encoding="utf-8")
    if "<lastmod>" in sitemap:
        raise RuntimeError("Sitemap still contains unverified lastmod dates")
    if sitemap.count("<loc>https://www.setupandseen.co.uk/</loc>") != 1:
        raise RuntimeError("Sitemap homepage URL is not canonical")


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: apply-seo-fixes.py SITE_ROOT")
    site_root = Path(sys.argv[1])
    if not (site_root / "sitemap.xml").is_file():
        raise SystemExit(f"Not a static site root: {site_root}")

    updated_html_files = apply_html_fixes(site_root)
    apply_sitemap_fixes(site_root)
    validate(site_root)
    print(f"SEO fixes applied; {updated_html_files} HTML files updated")


if __name__ == "__main__":
    main()
