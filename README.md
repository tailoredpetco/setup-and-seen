# Set Up & Seen

The production website is the saved HTML, CSS, fonts and scripts in `netlify-site/`.
Netlify publishes this directory directly from `main`. Use a branch and pull
request preview to check changes before merging.

## Website maintenance

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
