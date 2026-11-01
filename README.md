# Kapadiya & Sons — Motion Edition

Two Vite projects share this repository:

- `/`: Kapadiya.tech, the studio website.
- `/pinyoursite`: PinYourSite by Kapadiya & Sons, the independent interactive property demonstration.

## Run and build

```sh
npm ci
npm run dev -- --port 4175
npm run build
node scripts/verify-content.mjs
node scripts/verify-geometry.mjs

cd pinyoursite
npm ci
npm run dev -- --port 4176
npm run build
```

## Content and design

`offers.js` is the source of truth for all eight packages, prices, booking links and structured offers. Diamond’s Cut is enquiry-only because no demo price was supplied. `services.js` preserves the original ten capabilities; `green.js` adds PinYourSite, music videos and short films.

The homepage uses original service imagery, a hand-built SVG contour drawing, and the user-supplied Motion Next system adapted to this layout. GSAP drives line drawing, masked text and image reveals, property routes, the film viewfinder, pricing and the final contact scene. Lenis smooths wheel input without replacing native touch scrolling. Mobile uses shorter scenes without the desktop manifesto pin. Pause motion and OS reduced-motion settings restore the static page.

The three supplied videos are full-length 720p H.264/AAC exports with fast-start metadata and poster images. They total about 45 MB. Video is loaded on demand, has native controls and plays inline. It pauses offscreen and when the tab is hidden. `ugc-latest.mp4` is the default selection.

PinYourSite is linked from the homepage at https://pinyoursite-kapadiya.vercel.app. The preview screenshot is `public/images/pinyoursite-demo.png`.

## Deployment

Main Vercel project: `kapadiya-sons` (root directory).
PinYourSite Vercel project: `pinyoursite-kapadiya` (directory `pinyoursite`).

Run `vercel deploy --prod --yes` from each linked project directory. Local `.vercel` account metadata is excluded from Git. No API secrets are required. The property viewer loads public satellite tiles only when GPS is opened.

Forms prepare WhatsApp messages for visitors to review and send; there is no hidden lead submission, booking system or payment collection.

## Verification

The content script checks the eight exact package prices, seven structured offers, destination links, seasonal-copy removal, media files, unique plot data, gallery and PDF assets. Geometry tests verify all 63 polygons, reference dimensions and desktop/mobile camera positioning. Browser checks cover responsive layouts, service filters/dialogs, video playback, motion pause/resume, map search/selection, gallery and satellite view. See `pinyoursite/CLONE_REPORT.md` for reconstruction scope.

A smooth 60 fps experience is a design target, not a guarantee across every device. Offscreen footage is paused, heavy satellite code is loaded on demand, and animation primarily uses transforms and opacity.

### Responsive image refinement — 1 November 2026

Image frames now constrain their contents independently of source dimensions. The founder portrait is capped at 320px on desktop and 250px on smaller screens, with automatic image height. Service grids use three desktop columns, two tablet columns and one phone column; a final unpaired card spans only when the current filter leaves an incomplete row. Phone descriptions are 14px and service titles are 24px.

Browser verification at 1440, 768, 390 and 360px found no horizontal page overflow or clipped heading, service-description or price text. Both service filters were checked for consistent image heights and correct final-card placement. All 14 PinYourSite gallery images loaded. Content/asset and plot geometry checks passed.

## Signal edition

The current entry uses `signal.css` and `signal-motion.js`: a live projected vector field, pinned hero transformation, horizontal portfolio sequence, seven scroll-driven portal backgrounds, masked typography, perspective property reveal and cinematic service/pricing entrances. The original motion package remains archived but is no longer imported. Motion pause and reduced-motion restore static layouts. The vector canvas stops rendering offscreen and in hidden tabs; pixel density is capped at 1.5.

## Spatial edition

The current persistent scene is in journey.js (Three.js). Eleven instanced mechanical layers rotate, separate and regroup along measured document chapters, with pointer parallax and a camera path. GSAP controls foreground transitions and the horizontal portfolio. Native touch scrolling is retained. Pixel ratio is capped at 1.5; pause, reduced-motion and hidden-tab handling stop continuous rendering. The old canvas is a static fallback if WebGL is unavailable.

Portfolio and service images now use contain sizing to preserve the full artwork. Service slides occupy the complete reel width, with adjacent text on desktop and stacked text on phones. The earlier grid and overlay descriptions above are historical. Both sites retain their existing content and offers.
