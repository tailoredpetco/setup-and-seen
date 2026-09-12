# Set Up & Seen payment setup

Updated 12 September 2026. The owner confirmed that Set Up & Seen is not VAT registered. No VAT or automatic Stripe Tax is added to the two one-off Payment Links.

## Live one-off payments

These are payments against an accepted, written £495 Website Starter proposal, not an instant purchase of unspecified bespoke work.

| Item | Stripe reference |
| --- | --- |
| Website Starter product | sus_website_starter |
| £495 full payment price | price_1UEsOzErQXsuC4WaLXrBmzy7 |
| £247.50 initial payment price | price_1UEsPUErQXsuC4WaO5fFieVM |
| Full payment link | https://buy.stripe.com/28E8wP9QSg6U7pp4cR1sQ00 |
| Initial payment link | https://buy.stripe.com/cNi6oH1kmdYM3996kZ1sQ01 |

Both links collect a required proposal reference and business name, and require acceptance of the published service terms and written proposal. The initial payment leaves £247.50 due before launch. No automated fulfilment or delivery is triggered. Verify payment in Stripe, check the proposal, then confirm the start date.

The public /pay page is noindex and links from the website footer and package comparison. Do not label these links Buy now without first agreeing a fixed instant-purchase scope and changing the proposal-first terms.

## Monthly catalogue item, not a live monthly checkout

- Product: sus_managed_website_starter
- Price: price_1UEsPdErQXsuC4WayxkQddWr, GBP 149 per month.
- Contract: 12 monthly billing periods, £1,788 total. Metadata records this intention; metadata alone DOES NOT stop billing.
- No Payment Link or customer subscription has been created for this price.
- Use a Stripe subscription schedule with an explicit twelve-month phase and end_behavior=cancel for each agreed customer. Do not publish an indefinite recurring Payment Link.
- Continuing care from £49 after the term is optional and separately agreed, not an automatic second phase.
- A self-service monthly checkout requires a secured backend and verified Stripe events to apply the fixed schedule. Keep the monthly route as an enquiry until this is implemented and tested in a connected sandbox.

## Checks and outstanding work

Stripe reported charges_enabled=true and payouts_enabled=true. No current account requirements were due at inspection.

Hosted one-off checkouts were inspected for amount, terms link, proposal reference, business-name collection and the absence of VAT. No real or simulated payment was submitted through the live account.

Stripe Dashboard branding was blank and its support details differed from the website. These settings have not been changed. The connected API did not expose an account-update operation and the cloud browser showed a separate Dashboard sign-in screen.

Automatic approval review rejected an attempt to list Netlify environment variables because the tool could expose unrelated secrets. No environment values were retrieved or changed. Do not repeat a broad environment-variable read.
