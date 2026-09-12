# Managed website billing: deployment and release checks

Status on 12 September 2026: implementation prepared; monthly checkout is not live.
The existing one-off payment page and links are unchanged by this branch.

Preview verification: Netlify deploy `6aa5765e462970000878add9` is ready for
commit `3ca87ed05c75c44b0eb5a28106948f62d65412d9`. Node 24 built the function and
ran the type check and local tests. A real POST to the preview endpoint returned
503 and `Billing is not configured`, as expected without secure configuration.

Stripe checkout brand settings were updated and independently read back:
background `#f7f2e9`, button and primary/accent colour `#315f8c`, white button text.
Stripe's hosted font remains its default because the site's Fraunces/DM Sans are
not available in Stripe's supported font list. Logo upload is still pending:
the public favicon is only 64 by 64 pixels and is unsuitable as a sharp checkout
logo. Do not upscale it and claim original high-resolution artwork was used.

## Commercial scope

- Managed website starter: GBP 149 monthly for 12 billing periods, GBP 1,788 total.
- Only start after an accepted written proposal confirming scope and terms.
- No VAT added; the owner confirmed that the business is not VAT registered.
- The schedule cancels at the end of its single 12-month phase. It does not release
  the subscription into indefinite billing and does not add a GBP 49 continuation.
- Any support after the agreed term requires a separate agreement.
- This is a fixed-duration service schedule, not a guarantee of 12 successful
  collections. Failed payments, recovery and any early termination must follow
  the accepted agreement and be handled separately; never extend the billing term
  to recover an unsuccessful payment.

## Runtime

`POST /api/stripe/fixed-term` receives signed Stripe Checkout events. It checks the
exact Payment Link, price, GBP amount, quantity, tax, discount, mode and subscription
metadata before creating a native Stripe subscription schedule. The phase uses
`duration: { interval: 'month', interval_count: 12 }` and `end_behavior: 'cancel'`.

The function imports the existing subscription first, then updates its schedule,
as Stripe requires two API calls for this migration. Both calls use stable
idempotency keys. Duplicate events verify the existing schedule without moving
the end date. An unrecognised existing schedule is not overwritten. An API error
returns 500 to request redelivery; absent configuration returns 503. These
responses do not themselves stop an existing subscription. Do not launch before
the full test below passes and failed delivery monitoring is enabled.

## Secure configuration

Use the existing Netlify project `setup-and-seen`. Add only these dedicated
environment variables, scoped to Functions. Use test credentials and test object
IDs in the deploy-preview context; use live credentials and live IDs only in the
production context. Do not put production credentials in preview builds.

| Variable | Value |
| --- | --- |
| `SUS_STRIPE_RESTRICTED_KEY` | Restricted server key for the matching mode; secret |
| `SUS_STRIPE_WEBHOOK_SECRET` | Signing secret of the matching endpoint; secret |
| `SUS_STRIPE_MANAGED_PRICE_ID` | Approved GBP 149 monthly recurring price ID |
| `SUS_STRIPE_MANAGED_LINK_ID` | The specific approved monthly Payment Link ID |
| `SUS_STRIPE_LIVEMODE` | `false` for sandbox; `true` only for production |

The function needs subscription retrieval and subscription-schedule read/create/
update access. Grant the minimum corresponding permissions presented by Stripe's
restricted-key editor and verify them in the sandbox. It does not need access to
bank details, payouts, refunds, account ownership or creating payment links.
Store keys directly in Netlify's secret environment settings, not in chat, source
files, terminal commands, build logs or a pull request. Do not list unrelated
environment-variable values to find them.

Known live catalogue price: `price_1UEsPdErQXsuC4WayxkQddWr`.
There is no approved monthly Payment Link or webhook endpoint yet. Do not reuse
the existing one-off links for the monthly plan.

## Checkout and endpoint setup

1. Use an existing authorised Stripe sandbox. Do not create an account or charge
   a real card for testing. Create a matching test product and monthly price.
2. Configure a test Payment Link with one GBP 149 recurring item, quantity one,
   automatic tax off, no trial, no discounts, and no adjustable quantity.
3. Require agreement to the published terms and collection of business name and
   proposal reference. Set `subscription_data.metadata.sus_fixed_term` to
   `sus-managed-12-months-v1`. Check the customer-facing description contains
   commercial terms, not implementation instructions. Use the existing original
   logo when a suitable original asset is available; the brand colours have
   already been saved through Stripe's branding API.
4. Register the preview endpoint for `checkout.session.completed` and
   `checkout.session.async_payment_succeeded`. Use a snapshot event destination
   with an API version compatible with the installed Stripe SDK (22.6.2, API
   2026-08-26.dahlia), and store its signing secret securely.
5. Add the exact test link and price IDs and the dedicated restricted key to the
   preview's Functions environment, then redeploy.

## Required release verification

`npm run check:billing` runs TypeScript and seven local tests. These cover schedule
parameters, date boundaries, duplicate delivery, retry after partial success,
unexpected amounts and scope, real SDK signature verification and fail-closed
responses. Stripe network responses are stubbed in these tests.

Before publishing a monthly button, complete an actual sandbox Checkout, inspect
the resulting native schedule and invoices, and verify the accepted proposal
reference, GBP 149 amount, no VAT, receipts and return journey. Exercise the handler
with a test-clock subscription matching the sandbox Checkout and advance through
the full 12-month term. Confirm 12 invoices of GBP 149, no thirteenth invoice and
cancellation at the agreed end. Also verify duplicate event delivery, temporary
delivery failure/retry, a failed collection, and end-of-month dates. Record the
actual Stripe test object IDs and outcomes here after execution, rather than
marking them passed based on local stubs.

Then configure the separate production endpoint and restricted key, verify the
live link's exact settings without submitting a real payment, and only then add
the monthly choice to `/pay` and the package journey. Recheck desktop and the
owner's actual iPhone screenshot, including cookie and message overlays. The
existing one-off checkout also still needs an end-to-end sandbox payment test.

## Operations and recovery

Enable Stripe failed-webhook notifications and monitor new managed subscriptions
for an attached verified fixed-term schedule. If configuration fails, investigate
before the next billing date; retry the original event. Stripe's idempotency cache
is not permanent: a create-only failure unresolved beyond the cache window may
require an operator to identify the original schedule and apply the agreed term.
Never create a replacement subscription or extend the term as a recovery shortcut.
If a previously verified schedule is later edited, the webhook rejects it on
redelivery, but this function is not a continuous audit of Dashboard edits.

Keep the monthly link disabled/unpublished if the endpoint, credentials or
monitoring are not operational. Existing subscriptions need their attached native
schedules preserved even if the website function is rolled back. A working
native schedule continues to enforce its end without the webhook running again.

References: [Stripe subscription schedules](https://docs.stripe.com/billing/subscriptions/subscription-schedules),
[create a schedule](https://docs.stripe.com/api/subscription_schedules/create),
[restricted keys](https://docs.stripe.com/keys/restricted-api-keys).
