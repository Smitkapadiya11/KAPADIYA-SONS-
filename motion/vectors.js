/*!
 * KAPADIYA & SONS — Motion Edition · vector library
 * Every vector used by kapadiya-motion.js lives here as an inline SVG string,
 * so they can be animated stroke-by-stroke (DrawSVG) and recoloured with CSS.
 * All strokes use currentColor -> colour them from CSS with `color:`.
 */

const PETAL = "M300 300 C210 210 208 70 300 30 C392 70 390 210 300 300Z";

/** 12-petal flower (the site's hero motif) as outlines — used by the preloader and the ghost backgrounds. */
export const flowerOutline = (cls = "") =>
  `<svg class="${cls}" viewBox="0 0 600 600" fill="none" aria-hidden="true" focusable="false">` +
  Array.from(
    { length: 12 },
    (_, i) =>
      `<path class="km-petal" d="${PETAL}" transform="rotate(${i * 30} 300 300)" stroke="currentColor" stroke-width="2"/>`,
  ).join("") +
  `<circle class="km-core" cx="300" cy="300" r="43" stroke="currentColor" stroke-width="2"/>` +
  `<circle class="km-core-dot" cx="300" cy="300" r="15" fill="currentColor"/>` +
  `</svg>`;

/** Filled preloader flower with the site's petal gradient. */
export const flowerFilled = () =>
  `<svg class="km-pre__flower" viewBox="0 0 600 600" aria-hidden="true" focusable="false">` +
  `<defs><linearGradient id="km-petal-grad" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dbff8a"/><stop offset=".5" stop-color="#9ddb58"/><stop offset="1" stop-color="#1e6642"/></linearGradient></defs>` +
  Array.from(
    { length: 12 },
    (_, i) =>
      `<path class="km-pre__petal" d="${PETAL}" transform="rotate(${i * 30} 300 300)" fill="url(#km-petal-grad)" fill-opacity="0" stroke="#c6f986" stroke-width="2"/>`,
  ).join("") +
  `<circle class="km-pre__core" cx="300" cy="300" r="43" fill="#10291e" stroke="#c6f986" stroke-width="2"/>` +
  `<circle class="km-pre__dot" cx="300" cy="300" r="15" fill="#c6f986"/>` +
  `</svg>`;

/** Hand-drawn underline swash placed under italic <em> words in headlines. */
export const swash = () =>
  `<svg class="km-swash" viewBox="0 0 400 34" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">` +
  `<path d="M4 24 C70 8 150 4 214 12 S330 30 396 10" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>` +
  `<path d="M40 30 C120 20 220 20 300 26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>` +
  `</svg>`;

/** Camera viewfinder corners + REC badge for the UGC film player (4 proportional corner vectors). */
const corner = (cls) =>
  `<svg class="${cls}" viewBox="0 0 28 28" fill="none"><path d="M2 26 V2 H26"/></svg>`;
export const viewfinder = () =>
  `<div class="km-vf" aria-hidden="true">` +
  ["tl", "tr", "br", "bl"]
    .map((c) => corner(`km-vf__c km-vf__c--${c}`))
    .join("") +
  `<div class="km-vf__rec"><i></i>REC</div>` +
  `<div class="km-vf__tc">00:00:00:00</div>` +
  `</div>`;

/** Map pin used on the PinYourSite preview. */
export const pin = () =>
  `<svg viewBox="0 0 24 32" aria-hidden="true" focusable="false"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#c6f986"/><circle cx="12" cy="12" r="4.5" fill="#10291e"/></svg>`;

/** Dashed route connecting the pins (viewBox in % of the map). A masked reveal keeps the dashes crisp while it draws. */
export const pinRoute = (pts, id = "km-route-mask") => {
  const d = `M${pts.map((p) => p.join(" ")).join(" L")}`;
  return (
    `<svg class="km-pins__route" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">` +
    `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><path class="km-reveal" d="${d}" stroke="#fff" stroke-width="3"/></mask></defs>` +
    `<path d="${d}" stroke="#c6f986" stroke-width="2" stroke-dasharray="6 5" vector-effect="non-scaling-stroke" mask="url(#${id})"/>` +
    `</svg>`
  );
};

/** Face-scan overlay for the avatar image. */
export const scan = () =>
  `<div class="km-scan" aria-hidden="true">` +
  `<div class="km-scan__box">` +
  ["tl", "tr", "br", "bl"]
    .map((c) => corner(`km-scan__c km-vf__c--${c}`))
    .join("") +
  `</div>` +
  `<div class="km-scan__line"></div>` +
  `<div class="km-scan__voice"><span>VOICE SYNC</span><b></b><b></b><b></b><b></b><b></b><b></b><b></b></div>` +
  `</div>`;

/** Paper plane + dashed flight trail for the brief section (masked reveal keeps the dashes). */
const FLIGHT =
  "M-20 560 C 180 520 260 380 420 400 S 640 520 720 360 S 860 90 1020 60";
export const flight = () =>
  `<svg class="km-flight" viewBox="0 0 1000 600" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">` +
  `<defs><mask id="km-flight-mask" maskUnits="userSpaceOnUse" x="-40" y="0" width="1080" height="600"><path class="km-reveal" d="${FLIGHT}" stroke="#fff" stroke-width="14"/></mask></defs>` +
  `<path class="km-flight__trail" d="${FLIGHT}" stroke="currentColor" stroke-width="2" stroke-dasharray="7 9" vector-effect="non-scaling-stroke" mask="url(#km-flight-mask)"/>` +
  `<path class="km-flight__guide" d="${FLIGHT}" stroke="none"/>` +
  `</svg>` +
  `<svg class="km-plane" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false"><path d="M4 22 L44 6 L30 42 L23 27 Z M23 27 L44 6" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" fill="rgba(198,249,134,.25)"/></svg>`;

/** Section seam: a line + travelling node drawn across the top of each section heading. */
export const seam = () =>
  `<div class="km-seam" aria-hidden="true"><i class="km-seam__line"></i><b class="km-seam__dot"></b></div>`;

/** 13 service icons, keyed by the data-service ids used in services.js. Stroke-only so they draw on hover. */
const I = (paths) =>
  `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

export const serviceIcons = {
  avatar: I(
    '<circle cx="32" cy="25" r="9"/><path d="M16 52c0-9 7-15 16-15s16 6 16 15"/><path d="M10 18v-8h8M46 10h8v8M54 46v8h-8M18 54h-8v-8"/>',
  ),
  ugc: I(
    '<rect x="20" y="8" width="24" height="48" rx="5"/><path d="M29 25l10 7-10 7z"/><path d="M28 50h8"/>',
  ),
  film: I(
    '<rect x="10" y="27" width="44" height="27" rx="3"/><path d="M10 27l39-11 2.5 8.5"/><path d="M19 24.5l3-7M29 21.6l3-7M39 18.8l3-7"/><path d="M28 36l9 5-9 5z"/>',
  ),
  reels: I(
    '<rect x="14" y="16" width="36" height="40" rx="5"/><path d="M19 11h26M24 6h16"/><path d="M28 29l10 7-10 7z"/>',
  ),
  images: I(
    '<rect x="8" y="12" width="48" height="40" rx="5"/><circle cx="22" cy="26" r="5"/><path d="M8 44l14-12 10 8 8-6 16 12"/>',
  ),
  automation: I(
    '<circle cx="32" cy="32" r="9"/><path d="M32 10v7M32 47v7M10 32h7M47 32h7M16.5 16.5l5 5M42.5 42.5l5 5M47.5 16.5l-5 5M21.5 42.5l-5 5"/><path d="M33 27l-4 6h6l-4 6"/>',
  ),
  whatsapp: I(
    '<path d="M12 31c0-10 9-18 20-18s20 8 20 18-9 18-20 18c-3.2 0-6.2-.6-8.8-1.8L12 51l2.8-8.2C13 39.4 12 35.4 12 31z"/><path d="M24 31.5l6 6 11-12"/>',
  ),
  websites: I(
    '<rect x="8" y="12" width="48" height="40" rx="5"/><path d="M8 22h48"/><path d="M14 17h.01M19 17h.01M24 17h.01"/><path d="M16 32h20M16 40h13"/><rect x="40" y="33" width="10" height="9" rx="2"/>',
  ),
  apps: I(
    '<rect x="18" y="6" width="28" height="52" rx="6"/><rect x="24" y="16" width="6" height="6" rx="1.5"/><rect x="34" y="16" width="6" height="6" rx="1.5"/><rect x="24" y="27" width="6" height="6" rx="1.5"/><rect x="34" y="27" width="6" height="6" rx="1.5"/><path d="M29 50h6"/>',
  ),
  crm: I(
    '<circle cx="20" cy="22" r="6"/><circle cx="44" cy="22" r="6"/><path d="M8 47c0-7 5-12 12-12s12 5 12 12M32 47c0-7 5-12 12-12s12 5 12 12"/><path d="M26 22h12"/>',
  ),
  pinyoursite: I(
    '<path d="M32 54s15-14 15-27a15 15 0 1 0-30 0c0 13 15 27 15 27z"/><circle cx="32" cy="27" r="6"/><path d="M14 58h36"/>',
  ),
  music: I(
    '<path d="M24 46V16l24-6v30"/><circle cx="18" cy="46" r="6"/><circle cx="42" cy="40" r="6"/><path d="M24 24l24-6"/>',
  ),
  "short-film": I(
    '<circle cx="28" cy="30" r="20"/><circle cx="28" cy="30" r="4"/><circle cx="28" cy="18" r="4"/><circle cx="28" cy="42" r="4"/><circle cx="16" cy="30" r="4"/><circle cx="40" cy="30" r="4"/><path d="M48 30c0 14 4 22 12 24"/>',
  ),
};
export const serviceIconFallback = I(
  '<path d="M32 8v48M8 32h48M15 15l34 34M15 49l34-34"/><circle cx="32" cy="32" r="12"/>',
);

/** Export all vectors as standalone .svg files (used by the build script). */
export const standaloneFiles = () => ({
  "flower-outline.svg": flowerOutline(),
  "flower-filled.svg": flowerFilled(),
  "swash-underline.svg": swash(),
  "map-pin.svg": pin(),
  ...Object.fromEntries(
    Object.entries(serviceIcons).map(([k, v]) => [`service-${k}.svg`, v]),
  ),
});
