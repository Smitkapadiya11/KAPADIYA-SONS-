# Reconstruction verification

## Implemented and checked

- The initial desktop and mobile masterplan framing matches the reference measurements.
- Search filters expose all 63 fixture plots; three plots have an area >= 200 square yards.
- Plot 24 displays 1,028.43 ft² / 114.27 Var and 50.94 ft × 20.19 ft, matching the reference.
- Plot selection zooms into the plan and dims the surrounding plots. Mobile selection first opens a compact summary and then a 75dvh sheet.
- Gallery opens as a grid of 14 images; next/previous image controls, thumbnails and the lightbox work.
- Satellite imagery, project overlay and navigation controls load independently of the reference website.
- Kapadiya contact links, demo labeling and the new brochure are included.

## Deliberate differences / limitations

- Brand, project copy and contact details use Kapadiya & Sons, as requested.
- Fixtures are a demonstration snapshot, not live realtime availability.
- Enquiries prepare a WhatsApp draft; the original lead-storage/admin backend is not copied.
- Satellite imagery is served by Esri through Leaflet, with attribution. The basemap stays north-up while the plan overlay uses its reference bearing. The original Google Maps key is not reused.
- The viewer does not request the visitor’s GPS location; directions open in Google Maps.
- Keyboard access, reduced-motion handling and clear external-link labels were added.
- Property images retain any embedded signage belonging to the reference project and are labeled demonstration imagery.

No numeric fidelity score is claimed. Local comparison screenshots and source evidence are available under RECON; they are excluded from deployment.
