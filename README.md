# Set Up & Seen

The production website is the saved HTML, CSS, fonts and scripts in `netlify-site/`.
Netlify publishes this directory directly from `main`. Use a branch and pull
request preview to check changes before merging.

## Website maintenance

Website business copy uses **we, our and us**, as confirmed by Maria on 27 September 2026. Preserve genuine client quotations and customer consent wording.

- Keep current copy, package links and navigation in HTML. Do not add content
  through a delayed client-side patch.
- Headings and display text use self-hosted Playfair Display. Preserve the
  existing wordmark and decorative brand lettering, which retain their original
  styling. Keep the existing site colour palette and DM Sans body text.
- `migration/static-interactions.js` contains the native menu and enquiry
  selection behaviour. `migration/static-polish.css` contains shared refinements.
- After changing these maintenance sources, run `npm ci`, `npm run build:static`
  and `npm test`, then commit both the sources and generated site files.
- `apply-static-content.cjs` saves the previously approved navigation, package
  cards and contact links in the HTML, removes the former Sites rendering
  runtime, and generates `site-interactions-sep13.js` and `assets/site-sep13.css`.
  It reuses the established Netlify form handlers without changing form names,
  field contracts, endpoints or consent-gated lead tracking.
- `migration/rebuild-current-live.sh` is a historical migration utility that
  expects the old rendering payload. Do not use it to rebuild the current site;
  use the production Git history when a restoration is needed.

The £149 monthly plan, £1,788 minimum commitment, post-term options and existing
payment links are separate from these SEO and typography changes.

The 28 September audit corrections are maintained in `apply-yell-audit.cjs`.
`migration/analytics-consent.js` uses basic consent mode: load Google Analytics
only after acceptance, disable measurement and delete the site's Analytics
cookies on withdrawal. Advertising consent remains denied. The existing
consent-gated `generate_lead` event is preserved; reporting and conversion
imports in Google Analytics/Ads require separate account verification.

The 29 September mobile-performance and portfolio corrections are maintained in
`migration/apply-performance-case-studies.cjs`, the last static build step. It
bundles the homepage styles in their original cascade order, preloads the
approved display fonts, prevents the enhanced mobile header changing height at
startup, and preserves ordered consent and interaction scripts. The original
logo files remain unchanged; `node migration/optimise-approved-logos.cjs` creates
the lossless responsive derivatives using Sharp. Existing cached assets remain
available. Individual case studies retain their URLs, sitemap entries and
enquiry routes, with specific descriptions grounded in their existing screenshots.
