# Diwali offer data

The current preview uses `offers.js` as the single source of truth for all eight plans. It generates the static price cards, highlights, metadata, structured offers and service-detail pricing. WhatsApp messages use the same objects.

The October 26 brief replaces every earlier quotation and discount rule. There is no blanket discount and no additional reduction on the listed offers. Do not restore historic package counts or bonuses.

The two content-routine plans are named Content Essentials and Content Extended in the customer experience to meet the instruction not to name a generation vendor. Their supplied prices, savings, unit figures and deliverables are unchanged. The explicit decimal savings and per-reel figures in the brief are retained rather than rounded away.

No end date, countdown, scarcity counter or conversion guarantee is supplied or displayed. Availability, taxes, payment terms, revisions and dates are confirmed before booking. Custom technology work is quoted separately.

# Preview release

Branch: `preview/chrome-lime-diwali`.
Production approval is required by the latest user brief. Do not merge or promote this preview without it.

# Validation

`npm run build`
`node qa-preview.mjs`
`node qa-preview-flows.mjs`

The older QA scripts describe prior versions; use the preview scripts for the changed offer and motion experience. Tests intercept the brief URL and never send messages.
