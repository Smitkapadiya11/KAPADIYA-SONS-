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
