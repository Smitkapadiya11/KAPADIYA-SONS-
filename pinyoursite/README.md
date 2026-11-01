# PinYourSite by Kapadiya & Sons

A standalone property demonstration based on the public Radhe viewer. Uses local geometry/data, local gallery images and an independently implemented front end. It does not connect to the reference project’s lead database or reuse its credentials.

## Included

- Full-screen masterplan with 63 keyboard-accessible polygon hotspots.
- Drag, wheel/pinch zoom, reset, selected-plot camera animation and side dimensions.
- Status legend with Available / Builder / Sold visibility switches.
- Plot-number search and four size filters.
- Shareable `?plot=24` links; legacy `#plot-24` links also resolve.
- Desktop detail sidebar; collapsed and expanded mobile sheets.
- Project details, amenities, Kapadiya contact links and WhatsApp enquiry preparation.
- Fourteen-image gallery with zoom, full screen, download, thumbnails and previous/next navigation.
- Nearby landmark links and a branded PDF catalogue.
- Satellite map with positioned project overlay, zoom, recenter, overlay toggle and directions.

## Data

`plots.json` stores publicly displayed geometry, status and area as a frozen demonstration fixture. `geometry.js` calculates dimensions using the source viewer’s polygon-area method. These are not surveying measurements or live sales inventory.

The gallery and plan are the client-supplied reference project’s public visualisations. Some embedded project signage remains in the images; the surrounding experience is rebranded and clearly labeled demonstration.

Satellite view uses Leaflet with attributed Esri imagery. It uses the public reference location/overlay configuration. It does not require or reuse the reference’s Google Maps API key. Enquiries open the visitor’s WhatsApp draft rather than submitting into the reference’s backend.

## Commands

```sh
npm ci
npm run dev -- --port 4176
npm run build
vercel deploy --prod --yes
```
