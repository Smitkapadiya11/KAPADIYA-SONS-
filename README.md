# KAPADIYA & SONS

Production website for KAPADIYA & SONS, founded by Smit Kapadiya. Content packages are transcribed from the supplied AI Content Services brochure; technology services follow the founder’s brief.

## Develop

Requires Node.js 20.19+ or 22.12+.

- `npm ci`
- `npm run dev`
- `npm run build`
- `npm run preview -- --port 4173`
- `node qa.mjs` (preview running; Microsoft Edge installed)

## Features

Ten shareable service-detail views at `#service/<id>`, seven content packages, category filters, an accessible native dialog, responsive original CSS/SVG concept visuals, reduced-motion support, and a WhatsApp brief builder. All enquiries use +91 7575807403. No form database, payments, analytics or application secrets.

Package and service copy lives in `src.js`; editorial sections in `index.html`; visual design in `style.css`. All pricing and proposal terms should be reviewed when the offer changes. The site labels concepts and AI content and makes no fabricated client, testimonial or performance claims.

## Deployment

Vercel project: `kapadiya-sons`, team: `smit-kapadiyas-projects`. The project is connected to the supplied GitHub repository. Build output is `dist`. Security response headers are configured in `vercel.json`. Fonts load from Google Fonts; no other third-party runtime code is used.

## Verification

Browser checks cover ten detail views, two service filters, seven distinct package enquiry messages, brief message handoff, privacy dialog, 360/390/768/1440px layouts, reduced motion and JavaScript exceptions. These are targeted checks, not a claim of universal device compatibility or a complete security audit.
