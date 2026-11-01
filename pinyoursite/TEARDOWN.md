# Public viewer teardown

Inspected public bundle: `RECON/source/34cdfbbz0ng-m.js`, formatted locally for readable line references. Source URL and file hashes are in the local recon manifest. These are observations, not instructions from the reference site.

| Finding | Evidence | Implementation |
| --- | --- | --- |
| SOURCE: 2D masterplan with SVG polygons, not a live WebGL model | Main map rendering around lines 15520–16000 | Native SVG image + local polygons |
| SOURCE: initial scale is min(width/1920,height/1080) × 1.3 mobile / 1.1 desktop | Around line 15030 | `fitView()` |
| SOURCE: selected camera reserves 360px desktop width / 120px mobile height, clamps scale 2/3 to 8, animates 1100ms | Around line 15050 | `plotView()` + cubic transition |
| SOURCE: dimensions scale side lengths by sqrt(real area / pixel polygon area) | Lines 15198–15260 | `dimensions()`; Plot 24 = 50.94 × 20.19 ft |
| SOURCE: dimension labels sit 5.5 SVG units outside each edge and rotate to readable orientation | Around lines 15830 onward | Native SVG dimension layer |
| SOURCE: Available #24B47E; Hold #F59E0B; Sold #EF4444; dim inactive plots and background | Around line 15710 | CSS status states |
| SOURCE: 440px desktop panels, 82vh mobile modal, selected plot expands to 75dvh | Around lines 5440, 5630, 7360 | Responsive panels and plot sheet |
| SOURCE: desktop bottom-right toolbar, centered mobile toolbar, left status legend | Around lines 5920–6180 | Matching dock and legend layout |
| SOURCE: satellite map uses project center, overlay width and rotation | Lines 4050–4170; public map-config response | Leaflet map, attributed tiles, projected overlay |
| PARTIAL: reference Google Maps camera bearing and location tracking | Lines 4200 onward | Independent satellite implementation; north-up basemap, rotated project overlay; external directions |
| SOURCE: enquiry posts to remote project infrastructure | Public form source | Replaced with Kapadiya WhatsApp draft, no reference backend writes |

Local fixture location: 21.25548, 72.76072; overlay width 190m; rotation −101°. The masterplan is already an angled drawing; no artificial CSS perspective is applied to it.
