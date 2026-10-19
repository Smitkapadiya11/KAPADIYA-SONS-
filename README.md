# KAPADIYA & SONS

Production website for KAPADIYA & SONS, founded by Smit Kapadiya. Content packages are transcribed from the supplied AI Content Services brochure; technology services follow the founder’s brief.

## Develop

Requires Node.js 20.19+ or 22.12+.

- `npm ci`
- `npm run dev`
- `npm run build`
- `npm run preview -- --port 4174`
- `node qa.mjs` (preview running; Microsoft Edge installed)

## Features

Ten shareable service-detail views at `#service/<id>`, seven content packages, category filters, an accessible native dialog, four original GPT Image concepts, an authentic founder portrait, a GSAP scroll-driven creative gallery, reduced-motion support, and a WhatsApp brief builder. All enquiries use +91 7575807403. No form database, payments, analytics or application secrets.

Package and service copy lives in `src.js`; editorial sections in `index.html`; base styling in `style.css`, the second-edition design in `experience.css`, and choreography in `motion.js`. Asset provenance and exact generation prompts are in `ASSETS.md`. All pricing and proposal terms should be reviewed when the offer changes. The site labels concepts and AI content and makes no fabricated client, testimonial or performance claims.

## Deployment

Vercel project: `kapadiya-sons`, team: `smit-kapadiyas-projects`. The project is connected to the supplied GitHub repository. Build output is `dist`. Security response headers are configured in `vercel.json`. Images, fonts and the bundled animation library are served locally; there are no third-party runtime network requests.

## Verification

Browser checks cover ten detail views, two service filters, seven distinct package enquiry messages, brief message handoff, privacy dialog, 360/390/768/950/1440px layouts, gallery scroll transforms and controls, mobile navigation, motion pause, reduced motion, deep links, automated WCAG A/AA checks and JavaScript exceptions. These are targeted checks, not a claim of universal device compatibility or a complete security audit.


