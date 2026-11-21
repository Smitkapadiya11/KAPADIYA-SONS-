import { t } from "./i18n.js";

// Leaflet and leaflet-rotate are vendored as classic scripts; load them only when the map opens.
const MAP = "/apartments/map/";
function load(tag, attrs) {
  return new Promise((resolve, reject) => {
    const el = Object.assign(document.createElement(tag), attrs);
    el.onload = resolve;
    el.onerror = reject;
    document.head.append(el);
  });
}
let ready;
export const leaflet = () =>
  (ready ||= Promise.all([load("link", { rel: "stylesheet", href: MAP + "leaflet.css" }), load("script", { src: MAP + "leaflet.js" })])
    .then(() => load("script", { src: MAP + "leaflet-rotate.js" })));

export async function satellite(dialog, data) {
  await leaflet();
  const L = window.L;
  const center = [data.latitude, data.longitude];
  const projectAngle = 49;
  // Fit the rotated 355 m site plan inside the screen, like a framed overview.
  const initialZoom = () => {
    const el = dialog.querySelector("#satellite"), fit = Math.min(el.clientWidth, el.clientHeight - 140) * 0.78;
    const metresPerPixel = 355 / Math.max(240, fit);
    return Math.min(18.5, Math.max(15, Math.log2((156543.033928 * Math.cos((center[0] * Math.PI) / 180)) / metresPerPixel)));
  };
  const map = L.map(dialog.querySelector("#satellite"), {
    rotate: true, bearing: -projectAngle, rotateControl: false, zoomControl: false,
    zoomSnap: 0.1, minZoom: 12, maxZoom: 21, zoomAnimation: false,
  }).setView(center, initialZoom());
  const tiles = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Imagery © Esri, Maxar, Earthstar Geographics", maxNativeZoom: 19, maxZoom: 21,
  }).addTo(map);
  const icon = L.divIcon({
    className: "project-anchor", iconSize: [0, 0], iconAnchor: [0, 0],
    html: '<img class="project-art" src="/apartments/site-plan.webp" alt=""><div class="project-pin"><b>K<span>&amp;</span>S</b><strong>PinYourSite</strong></div>',
  });
  const anchor = L.marker(center, { icon, interactive: false, keyboard: false }).addTo(map).getElement();
  function positionArt() {
    const metresPerPixel = (156543.033928 * Math.cos((center[0] * Math.PI) / 180)) / 2 ** map.getZoom();
    const width = 355 / metresPerPixel;
    anchor.style.setProperty("--width", width + "px");
    anchor.style.setProperty("--angle", projectAngle + map.getBearing() + "deg");
    anchor.style.setProperty("--pin-y", -width * 0.29 + "px");
  }
  positionArt();
  map.on("zoom rotate", positionArt);
  const actions = {
    reset() { map.setBearing(-projectAngle); map.setView(center, initialZoom()); },
    center() { map.panTo(center); },
    north() { map.setBearing(0); },
    plus() { map.zoomIn(); },
    minus() { map.zoomOut(); },
  };
  for (const button of dialog.querySelectorAll("[data-map-action]")) button.onclick = actions[button.dataset.mapAction];
  const status = dialog.querySelector("#tile-status");
  status.textContent = "";
  tiles.on("tileerror", () => (status.textContent = t("gps.tiles")));
  dialog.querySelector("#directions").href = "https://www.google.com/maps/dir/?api=1&destination=" + center.join(",");
  return () => map.remove();
}
