# Current public form contracts and Netlify replacement

Captured from the public `https://www.setupandseen.co.uk` HTML and client bundles on 1 September 2026. This file records the behaviour that must be preserved before any domain cutover.

## Protected source reference

- GitHub repository: `tailoredpetco/setup-and-seen`
- Production branch: `main`
- Unmodified migration base commit: `651ee9eec87df1ddd2e63a4cb43a3fd2add72463`
- Migration branch: `migration/current-live-site`

## Enquiry form

Current endpoint: `POST /api/enquiries`

| Field | Type | Required | Notes |
|---|---|---:|---|
| `form-name` | hidden | no | Current value: `enquiry` |
| `website` | text | no | Visually hidden honeypot |
| `name` | text | yes | Customer name |
| `business` | text | no | Business name |
| `email` | email | yes | Customer email address |
| `phone` | tel | no | Contact number |
| `service` | select | yes | See preserved public HTML for current option labels |
| `message` | textarea | yes | Project details |
| `privacy-consent` | checkbox | yes | Value `accepted` |

The live form uses browser required-field and email validation, submits asynchronously, resets after success and replaces the form with an inline `Enquiry received` confirmation. Failures display an inline retry message.

### Netlify replacement

The migration keeps the visible form and its field contract, but registers it as a Netlify Form named `enquiry`. The existing honeypot is declared through `data-netlify-honeypot`. A small migration adapter submits URL-encoded data to Netlify Forms and preserves the inline success/error experience.

Submissions will be available in Netlify's Forms dashboard and through its CSV export. Notification recipients can be configured in the Netlify UI without storing an email credential or API secret in GitHub.

## Website Starter prize-draw form

Current endpoint: `POST /api/competition`

| Field | Type | Required | Notes |
|---|---|---:|---|
| `website` | text | no | Visually hidden honeypot |
| `full-name` | text | yes | Entrant name |
| `email` | email | yes | Entrant email |
| `phone` | tel | no | Optional telephone |
| `business-name` | text | yes | Business name |
| `business-stage` | select | yes | Trading, launching or planning |
| `website-status` | select | yes | Current website position |
| `business-description` | textarea | yes | Maximum 1,500 characters |
| `website-goal` | textarea | yes | Maximum 600 characters |
| `platform-followed` | select | yes | Facebook, Instagram or both |
| `social-profile` | text | yes | Maximum 180 characters |
| `consider-package` | select | yes | Non-winner package interest; not marketing consent |
| `winner-publicity` | select | yes | Publicity preference |
| `eligibility-confirmed` | checkbox | yes | Value `yes` |
| `terms-accepted` | checkbox | yes | Value `yes` |
| `privacy-accepted` | checkbox | yes | Value `yes` |
| `marketing-email` | checkbox | no | Separate optional consent, value `yes` |
| `marketing-phone` | checkbox | no | Separate optional consent, value `yes` |

The live client closes entry at `2026-09-30T22:59:00Z`, equivalent to 11:59 pm UK time on 30 September 2026. A successful entry replaces the form with an inline `Entry received` / `You are in the draw` confirmation. A closed response has its own message. The published terms permit one entry per person and business; when duplicates exist, only the first complete valid entry is eligible.

### Netlify replacement

The migration registers a Netlify Form named `website-starter-prize-draw-2026`, retains the honeypot, validates every required field in the browser and blocks the form after the published UTC closing instant. It submits URL-encoded data asynchronously and preserves the current inline confirmation/error states.

Netlify Forms stores the submitted fields and submission time. Entries can be reviewed and exported from Netlify as CSV. Before the draw, the owner must export the Netlify entries, remove clearly labelled preview tests, reject submissions after the closing instant, and apply the published first-valid-entry rule using normalised entrant email and business name. This produces an auditable eligible-entry list without exposing a database key or credential in GitHub.

## Existing ChatGPT Sites data boundary

The connected ChatGPT account does not expose the current Sites project as owned or editable. The private `/api/enquiries` and `/api/competition` implementation and its stored submissions therefore cannot be inspected or exported from this account.

No existing data has been changed or deleted. Before cutover, the owner of the original ChatGPT Site must export all existing enquiries and prize-draw entries from the owning account or obtain them from the existing delivery destination. Those records must be retained unchanged, then combined with the post-migration Netlify CSV. The final draw list must apply the same eligibility, deadline and first-valid-entry duplicate rules across both sources.
