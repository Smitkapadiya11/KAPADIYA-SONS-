# KAPADIYA & SONS

Production website for KAPADIYA & SONS, founded by Smit Kapadiya. Content packages are transcribed from the supplied AI Content Services brochure; technology services follow the founder’s brief.

## Develop

Requires Node.js 20.19+ or 22.12+.

- `npm ci`
- `npm run dev`
- `npm run build`
- `npm run preview -- --port 4174`
- `node qa.mjs` (preview running; Microsoft Edge installed)
- `node qa-glass.mjs` (service artwork and dialog checks; defaults to port 4175)
- `node qa-identity.mjs` (header, footer, navigation and accessibility at six widths; port 4175)
- Set `SITE_URL` to test a different preview or production URL.

## Features

Ten shareable service-detail views at `#service/<id>`, seven content packages, category filters, a glass service explorer with persistent navigation and enquiry controls, fourteen original GPT Image concepts, an authentic founder portrait, a GSAP scroll-driven creative gallery, reduced-motion support, and a WhatsApp brief builder. Every service has its own complete 3:2 artwork, with responsive WebP previews and no face-cropping cover treatment. All enquiries use +91 7575807403. No form database, payments, analytics or application secrets.

Package and service copy lives in `src.js`; editorial sections in `index.html`; base styling in `style.css`, the second-edition design in `experience.css`, the third-edition glass surfaces and service layouts in `glass.css`, and choreography in `motion.js`. Asset provenance is in `ASSETS.md`; the ten new exact image prompts are in `service-art-prompts.json`. All pricing and proposal terms should be reviewed when the offer changes. The site labels concepts and AI content and makes no fabricated client, testimonial or performance claims.

## Deployment

Vercel project: `kapadiya-sons`, team: `smit-kapadiyas-projects`. The project is connected to the supplied GitHub repository. Build output is `dist`. Security response headers are configured in `vercel.json`. Images, fonts and the bundled animation library are served locally; there are no third-party runtime network requests.

## Verification

Browser checks cover ten detail views, two service filters, seven distinct package enquiry messages, brief message handoff, privacy dialog, 360/390/768/950/1440px layouts, gallery scroll transforms and controls, mobile navigation, motion pause, reduced motion, deep links, automated WCAG A/AA checks and JavaScript exceptions. These are targeted checks, not a claim of universal device compatibility or a complete security audit.

`qa-glass.mjs` additionally verifies all ten thumbnail/full images decode, distinct service enquiry messages, preserved image proportions, persistent controls, scroll reset when switching services, no horizontal dialog overflow, and automated accessibility scans inside the mobile and desktop dialogs.

## Identity

The eye-and-K vector identity, colour HEX codes, typography and international contact formatting are documented in `BRAND.md`. `identity.css` defines the brand tokens, refined header/footer, legibility improvements and numeric typography. `qa-identity.mjs` checks the brand layout at six widths, visible footer navigation, hidden floating controls at the footer, working contact links, canonical URL, mobile menu labels, privacy access and back-to-top.



## Indian Diwali edition

The Avatar Demo base plan is a fixed INR 4,000 for four videos. Seasonal styling lives in festival.css; ten new Indian festive service concepts are documented in festive-art-prompts.json. Anime.js animates the mobile and desktop experience; GSAP ScrollTrigger retains desktop pinning/navigation. Run node qa-festival.mjs for mobile scroll, pause and reduced-motion checks (preview port 4175). Private prospect data remains outside this repository.
