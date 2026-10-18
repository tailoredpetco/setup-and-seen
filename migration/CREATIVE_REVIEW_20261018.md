# October creative review implementation

The current published source is `netlify-site/`, served directly by Netlify. The 18 October brief supersedes the older studio voice and homepage structure. The approved logos, colours, fonts, package prices, legal terms, forms, consent controls and existing routes are retained.

`npm run build:static` now applies `apply-creative-review.cjs` to the saved HTML. The older migration scripts describe historic transformations and are retained for reference; running that entire historical chain against the new layout would reintroduce obsolete sections. Edit `creative-home.html`, `creative-review.css`, `creative-motion.js` and the current review pass when maintaining this direction. The pass writes versioned CSS and JavaScript and is repeatable.

The motion assets are the previously created portfolio edits, using published website screenshots and original brand artwork. The Office Partner and The Tailored Pet Co are owned-business examples. No client performance claims have been added.

Homepage motion loads only when its section is visible on a desktop viewport. Reduced-motion preferences, data-saving preferences and mobile viewports receive genuine still images. A pause control is visible during the animation, which also pauses when the page is hidden or the section leaves the viewport. The separate work-page reel is user-controlled with no preload.

Run `npm run build:static` and `npm test` before publication. The tests cover internal links, metadata, assets, form field contracts, local success/error simulations, service selection, menu controls, analytics and marketing consent, motion behaviour and price/ownership assertions. They do not send a real enquiry.

No browser QA was available in the managed session used for this change. Responsive CSS was reviewed and tested structurally, but desktop/mobile visual rendering, physical-device playback and live email delivery were not verified.

The £199 offer remains governed by its existing 31 October 2026 deadline and published terms. All social posts remain unpublished; the website request does not authorise posting to social accounts.
