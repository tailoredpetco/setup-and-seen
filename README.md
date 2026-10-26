# Set Up & Seen

The production website is the saved HTML, CSS, fonts, artwork and scripts in
`netlify-site/`. Netlify publishes this directory from `main`.

## Current creative direction

The 26 October 2026 decision uses **we, us and our** for Set Up & Seen business
copy. This supersedes the 18 October singular-voice brief. The marketing-support
page and its linked enquiry copy are maintained by
`migration/apply-marketing-support.cjs`, applied after the retained creative pass.
Older pages and the historical creative sources still contain singular wording;
use the latest voice when reviewing them. Preserve genuine client quotations,
customer questions and consent statements. The Office Partner and The Tailored
Pet Co are owned businesses and must be labelled accordingly. They demonstrate
design work and must not be presented as independent endorsements.

The homepage, relevant service examples and portfolio motion are maintained in
`migration/apply-creative-review.cjs`, `migration/creative-home.html`,
`migration/creative-review.css` and `migration/creative-motion.js`.
See `migration/CREATIVE_REVIEW_20261018.md` for the implementation and QA notes.

Keep the original logo artwork and proportions, self-hosted Playfair Display and
DM Sans, and existing brand palette. Genuine screenshots and approved artwork
are used without fabricated results or altered portfolio features.

## Maintenance

- Make content available in HTML rather than inserting it after page load.
- Run `npm ci`, `npm run build:static` and `npm test`. Also run
  `node migration/test-vehicle-advert-service.cjs` when that service changes.
- Commit both maintenance sources and generated site files. Review a branch
  before publishing, unless direct publication is explicitly authorised.
- `build:static` applies the current creative review. Earlier migration scripts
  are retained as historical transformations and must not be chained against
  the new layout: they reintroduce obsolete sections and wording.
- Use Git history to restore a previous version. The historical
  `migration/rebuild-current-live.sh` expects the former rendering payload.

The homepage animation loads only on eligible desktop viewports when visible,
with a pause control. Mobile, reduced-motion and data-saving preferences receive
still images. The work-page portfolio video is user-controlled. The former
40-second introduction remains archived in `netlify-site/assets/video/`.

Preserve the Netlify enquiry form name, field contract, honeypot, success/error
behaviour and service preselection. Tests simulate network submissions rather
than sending live enquiries. Keep Analytics and advertising consent separate;
tracking must remain disabled until the appropriate permission is given.

Do not change prices, payment links, offer deadlines or legal terms as part of a
design change. The £199 offer and optional £29 care plan have their own published
terms; standard website packages, the £149 monthly plan and its £1,788 minimum
commitment remain separate. Confirm current scope before any future promotion.
