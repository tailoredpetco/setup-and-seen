#!/usr/bin/env python3
"""Apply the customer-journey improvements to the preserved static site.

The public site is a preserved Vinext render. Visible HTML and the matching
render data both need commercial updates, while the migration adapter applies
small progressive enhancements after hydration. The website deliberately keeps
the established we/our brand voice; I/my is reserved for direct emails.
"""

from __future__ import annotations

import sys
from pathlib import Path


if len(sys.argv) != 2:
    raise SystemExit("Usage: apply-customer-journey-improvements.py <site-root>")

root = Path(sys.argv[1]).resolve()
if not (root / "index.html").is_file():
    raise SystemExit(f"Site root not found: {root}")


def replace_required(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        if new in source:
            return source
        raise AssertionError(f"Expected {label!r} was not found")
    return source.replace(old, new)


def write_updated(path: Path, transform) -> None:
    source = path.read_text(encoding="utf-8")
    updated = transform(source)
    path.write_text(updated, encoding="utf-8")


def update_packages(source: str) -> str:
    source = source.replace("£1,250", "£1,595")
    source = source.replace("£1,750", "£2,295")
    source = source.replace("Our most popular choice", "Best for a complete business launch")
    source = source.replace("MOST POPULAR", "RECOMMENDED FOR A FULL LAUNCH")
    source = source.replace(
        "See exactly what each option is designed for, what is included and where optional extras may apply. If you are still unsure, I will recommend the most sensible option rather than the most expensive one.",
        "Compare three core packages, then add Express priority delivery only if an urgent deadline makes it necessary. If you are still unsure, we will recommend the most sensible option rather than the most expensive one.",
    )
    source = source.replace(
        "See exactly what each option is designed for, what is included and where optional extras may apply. If you are still unsure, we will recommend the most sensible option rather than the most expensive one.",
        "Compare three core packages, then add Express priority delivery only if an urgent deadline makes it necessary. If you are still unsure, we will recommend the most sensible option rather than the most expensive one.",
    )
    source = source.replace(
        "Choose the right level of support.",
        "Choose the right package, then add priority if needed.",
    )
    source = source.replace(
        "Live within five working days",
        "Priority upgrade to Website Starter",
    )
    return source


# The homepage is a hydrated client component. The later search-visibility
# stage updates its HTML and a versioned client module together. This earlier
# stage continues to handle the server-rendered package and service pages.
write_updated(root / "packages" / "index.html", update_packages)


branding = root / "services" / "branding-logo-design" / "index.html"
write_updated(
    branding,
    lambda source: source.replace("£395", "£495"),
)


service_messages = {
    "website-design": (
        "A stronger, clearer presence for your business.",
        "A website that makes your business easier to choose.",
        "Thoughtful work should make business easier, not add more complexity. Everything is shaped around your audience and the action you want customers to take.",
        "Clear structure, confident wording and a simple route to enquiry help customers understand what you offer and take the next step.",
    ),
    "branding-logo-design": (
        "A stronger, clearer presence for your business.",
        "A recognisable identity you can use everywhere.",
        "Thoughtful work should make business easier, not add more complexity. Everything is shaped around your audience and the action you want customers to take.",
        "Your logo, colours, fonts and supporting graphics are designed to work together across your website, social profiles and printed materials.",
    ),
    "social-media-setup": (
        "A stronger, clearer presence for your business.",
        "Profiles that look ready for customers from day one.",
        "Thoughtful work should make business easier, not add more complexity. Everything is shaped around your audience and the action you want customers to take.",
        "Clear profile information, consistent graphics and useful launch content help people recognise your business and understand what to do next.",
    ),
    "social-media-management": (
        "A stronger, clearer presence for your business.",
        "Consistent content without the monthly scramble.",
        "Thoughtful work should make business easier, not add more complexity. Everything is shaped around your audience and the action you want customers to take.",
        "Your real photographs, updates and expertise are turned into eight planned content pieces for Facebook and Instagram each month.",
    ),
    "marketing-support": (
        "A stronger, clearer presence for your business.",
        "Practical marketing focused on the next useful action.",
        "Thoughtful work should make business easier, not add more complexity. Everything is shaped around your audience and the action you want customers to take.",
        "The work is shaped around your priorities, available budget and the channels most likely to support a genuine business goal.",
    ),
    "website-audit": (
        "A stronger, clearer presence for your business.",
        "A clear view of what is helping and what needs attention.",
        "Thoughtful work should make business easier, not add more complexity. Everything is shaped around your audience and the action you want customers to take.",
        "You receive an independent review of clarity, trust, mobile usability, enquiry routes and search foundations, followed by a prioritised action plan.",
    ),
    "website-hosting-care": (
        "A stronger, clearer presence for your business.",
        "A website that stays ready for customers.",
        "Thoughtful work should make business easier, not add more complexity. Everything is shaped around your audience and the action you want customers to take.",
        "Managed hosting, SSL, backups, monitoring and regular form checks keep the essentials looked after, with one small content update included each month.",
    ),
    "express-websites": (
        "A stronger, clearer presence for your business.",
        "A professional website for an urgent deadline.",
        "Thoughtful work should make business easier, not add more complexity. Everything is shaped around your audience and the action you want customers to take.",
        "Website Starter is prioritised and completed within five working days once the agreed payment, content, images, access and questionnaire are ready.",
    ),
}

for slug, (old_heading, new_heading, old_copy, new_copy) in service_messages.items():
    path = root / "services" / slug / "index.html"

    def update_service(source: str) -> str:
        if slug == "website-design" and (
            "Small business web design in Worcestershire" in source
            and "Whether you are launching your first website or replacing an outdated one" in source
        ):
            return source
        source = replace_required(source, old_heading, new_heading, f"{slug} outcome heading")
        source = replace_required(source, old_copy, new_copy, f"{slug} outcome copy")
        return source

    write_updated(path, update_service)


# Commercial and campaign safeguards.
packages_text = (root / "packages" / "index.html").read_text(encoding="utf-8")
assert "£1,250" not in packages_text
assert "£1,750" not in packages_text
assert "£1,595" in packages_text
assert "£2,295" in packages_text
assert "Win a professional website worth £495" in (root / "index.html").read_text(encoding="utf-8")
assert "30 September 2026" in (root / "competition" / "index.html").read_text(encoding="utf-8")
assert "From £395 one-off" in (root / "services" / "social-media-setup" / "index.html").read_text(encoding="utf-8")
assert "Branding packages from £495" in branding.read_text(encoding="utf-8")
assert "our website" in (root / "our-work" / "index.html").read_text(encoding="utf-8")
