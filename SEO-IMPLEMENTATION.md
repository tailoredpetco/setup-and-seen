# Search visibility implementation, 15 September 2026

## Implemented scope

- Two original service pages: garage and automotive website design; pet-business website design.
- Three individual case studies using the existing published portfolio: Clent Auto Repairs, Clent Hills Campers & Vans, The Tailored Pet Co.
- Links from the homepage, website-design page, managed plan and portfolio.
- Local service titles and descriptions for branding and social media management.
- Clear pay-monthly heading on the existing managed plan.
- Canonicals, social metadata, appropriate structured data, sitemap entries and explicit Netlify rewrites for all five new pages.
- Existing brand assets, pricing, payment routes, form contracts, consent and interaction scripts preserved.

The existing HTML is the production source. These pages need no new rendering framework. Run `npm test` and `node migration/test-specialist-seo.cjs` when maintaining them.

## Evidence and limits

Project details are based on the existing approved portfolio. No new reviews, qualifications, traffic figures or sales results have been invented. The new specialist pages describe the service offered; they do not present proposed grooming designs as completed client projects. New editorial copy uses Maria's first-person voice; approved shared branding and navigation are preserved.

Target phrases are initial editorial choices, not measured keyword-volume or ranking-difficulty claims. Google Search Console and Google Business Profile performance data were not connected during this implementation. A crawlable page is not proof that Google has indexed or ranked it.

## Remaining account and ongoing work

1. Read Search Console Performance, Pages, Sitemaps and URL Inspection for the verified domain. Record the available baseline before judging changes.
2. Check Business Profile verification, services, categories and public contact details while keeping the service-area address hidden.
3. Review genuine customer-review opportunities. No review requests or other messages have been sent as part of this code change.
4. Identify relevant local organisations and editorial opportunities. Do not buy bulk links or publish repetitive town pages.
5. Review the existing cost and DIY guides against actual search queries before choosing more advice content.
6. Compare non-branded impressions, clicks, relevant queries and enquiries over appropriate periods. New-site data may be sparse.

No ranking position, indexing time or enquiry volume is guaranteed. No paid subscription or advertising spend is part of this change.

## Follow-through review, 22 September 2026

Prepared on `improvement/seo-follow-through-2026-09-22`; production publication requires Maria's approval.

- Add permanent, path-preserving redirects for the two known duplicate Netlify hostnames before all path rewrites, including `/pay`. Other branch/deploy-preview hostnames are not matched. Keep the established canonical paths and genuine 404 statuses.
- Replace the plain error page with a branded, noindex 404 containing useful service, package and contact links.
- Correct the Tailored Pet Co image's intrinsic dimensions to 1400 × 740 on home and portfolio, retaining the existing CSS frames.
- Make the homepage's Worcestershire focus explicit and explain working directly with Maria. Keep the main design page focused on UK-wide small-business delivery, a clear process and links to the existing individual case studies.
- Add distinct grooming and automotive requirements to the existing sector pages, with separately scoped booking/stock features and no invented project results.
- Record actual modification dates for the five changed sitemap pages.
- Fix the Playfair font preload's missing `as="font"` attribute. Browser inspection found the old preload was ignored. Set the HTML attribute explicitly in the maintenance generator and protect it with a regression assertion; preserve fonts and styles.

The September case studies already include design decisions, scope and relevant package links. Those claims have not been expanded. Prices, testimonials, payment links, form fields, consent behaviour and competition dates are unchanged. The competition remains open until its existing September closing date.

Checks: `npm run build:static`, `npm test`, `node migration/test-specialist-seo.cjs` and `node migration/test-vehicle-advert-service.cjs`. Form tests use local network mocks; no live enquiry or competition submission was made. Browser layout and menu checks cover home, design, garage, pet, portfolio and error pages at 1440, 390 and 320 pixels. These are local implementation checks, not Google field-performance results.

Before production: review the Netlify deploy preview, then after an approved merge verify the two hostname redirects on real nested URLs and query strings, plus the branded 404 response. A preview hostname cannot prove the production-host redirect behaviour. Do not redirect arbitrary unknown URLs to the homepage or add broad preview-host redirect rules.

Still account-dependent: Search Console indexing/canonical/UK-query baseline; Business Profile verification, category, real service area and address privacy; CrUX/PageSpeed performance evidence; GA4 and qualified-enquiry measurement. No such account changes, review requests or directory submissions were made. Query overlap alone is not evidence to merge pages, and no ranking or lead increase is claimed.
