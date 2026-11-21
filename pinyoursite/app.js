import "./style.css";
import "./villa.css";
import plots from "./plots.json";
import { dimensions } from "./geometry.js";
import { plotLayout } from "./layout.js";
import { t, lang, mountSwitch, onLang, translate } from "./i18n.js";

const q = (s) => document.querySelector(s),
  qa = (s) => [...document.querySelectorAll(s)],
  fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
const wa = (s) => "https://wa.me/917575807403?text=" + encodeURIComponent(s);
const paths = {
  house: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z",
  share: "M8 10 16 6M8 14l8 4M8 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0M22 5a3 3 0 1 0-6 0 3 3 0 0 0 6 0M22 19a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
  search: "M21 21l-5-5M18 10a8 8 0 1 0-16 0 8 8 0 0 0 16 0",
  info: "M12 11v6M12 7h.01M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0",
  image: "M3 3h18v18H3ZM3 17l6-6 4 4 3-3 5 5M9 7h.01",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
  navigation: "m22 2-7 20-4-9L2 9Z",
  file: "M14 2H5v20h14V7ZM14 2v6h5M8 12h8M8 16h8",
  x: "m6 6 12 12M18 6 6 18",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  expand: "M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5",
  layers: "m12 3 10 6-10 6L2 9Zm-10 12 10 6 10-6M2 12l10 6 10-6",
  tree: "M12 2 5 10h3l-5 7h7v5h4v-5h7l-5-7h3Z",
  orbit: "M21 12a9 4 0 1 1-18 0 9 4 0 0 1 18 0M12 3v18",
  left: "m15 5-7 7 7 7",
  right: "m9 5 7 7-7 7",
  cube: "m12 2 9 5v10l-9 5-9-5V7Zm0 10 9-5M12 12v10M12 12 3 7",
};
const icon = (n) => '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (paths[n] || paths.pin) + '"/></svg>';
const icons = (root = document) => root.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
icons();
mountSwitch(q("#lang"));

const card = q("#plot-card"), panel = q("#panel"), body = q("#panel-body");
const layouts = new Map(plots.map((p) => [p.id, plotLayout(p)]));
const ordered = [...plots].sort((a, b) => a.id - b.id);
let world = null, selected = null, expanded = false, orbiting = false, panelType = null, returnFocus, toastTimer;

function toast(s) {
  clearTimeout(toastTimer);
  q("#toast").textContent = s;
  q("#toast").classList.add("visible");
  toastTimer = setTimeout(() => q("#toast").classList.remove("visible"), 3200);
}
const statusLabel = (s) => t("status." + s);
function counts() {
  for (const s of ["available", "hold", "sold"]) q(`.filter.${s} b`).textContent = plots.filter((p) => p.status === s).length;
}
counts();

// Plot card.
function enquiry(topic) {
  return `<section class="enquiry"><h3>${t("enquiry.title")}</h3><form data-enquiry="${topic}">
    <input name="name" placeholder="${t("enquiry.name")}" aria-label="${t("enquiry.name")}" required maxlength="80" autocomplete="name">
    <div class="phone-field"><select name="code" aria-label="${t("enquiry.code")}"><option>IN +91</option><option>US +1</option><option>UK +44</option><option>AE +971</option></select>
    <input name="phone" aria-label="${t("enquiry.phone")}" placeholder="${t("enquiry.phone")}" type="tel" required maxlength="20" autocomplete="tel"></div>
    <button class="primary full" type="submit">${t("enquiry.send")}</button><p class="fine">${t("enquiry.fine")}</p></form></section>`;
}
function wireForms(root) {
  root.querySelectorAll("[data-enquiry]").forEach(
    (f) =>
      (f.onsubmit = (e) => {
        e.preventDefault();
        const d = new FormData(f);
        location.assign(wa(`Hi Kapadiya & Sons, I’m ${d.get("name")} (${d.get("code")} ${d.get("phone")}). I explored ${f.dataset.enquiry} in the PinYourSite 3D demo (language: ${lang}). I’d like to discuss an interactive viewer for my project.`));
      }),
  );
}
function renderCard() {
  if (selected == null) {
    card.hidden = true;
    card.replaceChildren();
    document.body.classList.remove("plot-open");
    return;
  }
  const p = plots.find((x) => x.id === selected), L = layouts.get(selected), dims = dimensions(p);
  const front = dims.reduce((a, b) => (Math.abs(b.length - L.width / 0.3048) < Math.abs(a.length - L.width / 0.3048) ? b : a));
  const turn = (a, b) => { const d = (((a - b) % 180) + 180) % 180; return Math.min(d, 180 - d); };
  const depth = dims.find((d) => d !== front && turn(d.angle, front.angle) > 45) || dims[1];
  card.innerHTML = `
    <div class="grab" aria-hidden="true"></div>
    <header>
      <div><small>${t("plot")}</small><h2>${selected}</h2></div>
      <span class="status ${p.status}">${statusLabel(p.status)}</span>
      <span class="spacer"></span>
      <button class="icon-btn" data-act="prev" aria-label="${t("plot.prev")}">${icon("left")}</button>
      <button class="icon-btn" data-act="next" aria-label="${t("plot.next")}">${icon("right")}</button>
      <button class="icon-btn" data-act="close" aria-label="${t("close")}">${icon("x")}</button>
    </header>
    <div class="stats">
      <div><span>${t("area")}</span><strong>${fmt(p.area)} ft²</strong><small>${fmt(p.area / 9)} ${t("var")}</small></div>
      <div><span>${t("dims")}</span><strong>${front.length.toFixed(1)} × ${depth.length.toFixed(1)} ft</strong><small>${t("frontage")}: ${t(L.road)}</small></div>
    </div>
    <div class="design">
      <i>${icon("cube")}</i>
      <div><small>${t("design")}</small><strong>${t("design." + L.design)}</strong><span>${t("design." + L.design + ".sub")}</span></div>
    </div>
    <div class="actions">
      <button class="primary" data-act="villa">${t("villa.open")}</button>
      <button class="ghost" data-act="orbit" aria-pressed="${orbiting}">${icon("orbit")}<span>${t(orbiting ? "orbit.stop" : "orbit")}</span></button>
      <button class="ghost" data-act="share" aria-label="${t("share")}">${icon("share")}</button>
    </div>
    <button class="more" data-act="expand" aria-expanded="${expanded}">${t("plot.details")}</button>
    <div class="extra">
      <p class="fine">${t("design.note")} ${t("plot.fine")}</p>
      ${enquiry("Plot " + selected)}
    </div>`;
  card.hidden = false;
  card.classList.toggle("expanded", expanded);
  document.body.classList.add("plot-open");
  wireForms(card);
}
card.addEventListener("click", (e) => {
  const act = e.target.closest("[data-act]")?.dataset.act;
  if (!act) return;
  const i = ordered.findIndex((p) => p.id === selected);
  if (act === "close") selectPlot(null);
  if (act === "prev") selectPlot(ordered[(i - 1 + ordered.length) % ordered.length].id);
  if (act === "next") selectPlot(ordered[(i + 1) % ordered.length].id);
  if (act === "villa") openHouse();
  if (act === "share") share(selected);
  if (act === "expand") { expanded = !expanded; renderCard(); }
  if (act === "orbit") setOrbit(!orbiting);
});
let touchStart = null;
card.addEventListener("touchstart", (e) => (touchStart = e.target.closest(".grab, header") ? e.touches[0].clientY : null), { passive: true });
card.addEventListener("touchend", (e) => {
  if (touchStart == null) return;
  const dy = e.changedTouches[0].clientY - touchStart;
  if (dy < -40 && !expanded) { expanded = true; renderCard(); }
  else if (dy > 40) { if (expanded) { expanded = false; renderCard(); } else selectPlot(null); }
  touchStart = null;
});
function setOrbit(on) {
  orbiting = on;
  world?.orbit(on, (state) => { orbiting = state; renderCard(); });
  renderCard();
}

function selectPlot(id, { updateUrl = true } = {}) {
  if (id != null && !plots.some((p) => p.id === id)) return;
  selected = id;
  expanded = false;
  orbiting = false;
  world?.orbit(false);
  if (panel.open) panel.close();
  q("#hover-tip").hidden = true;
  if (id == null) world?.home();
  else world?.select(id);
  renderCard();
  if (updateUrl) {
    const url = new URL(location.href);
    url.hash = "";
    id == null ? url.searchParams.delete("plot") : url.searchParams.set("plot", id);
    history.replaceState(null, "", url);
  }
}

// Status filters, lighting and homes.
qa(".filter").forEach(
  (b) =>
    (b.onclick = () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      world?.setFilter(b.dataset.status, on);
    }),
);
qa("[data-mode]").forEach(
  (b) =>
    (b.onclick = () => {
      qa("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      document.body.dataset.mode = b.dataset.mode;
      world?.setMode(b.dataset.mode);
    }),
);
q("#homes").onclick = () => {
  const on = q("#homes").getAttribute("aria-pressed") !== "true";
  q("#homes").setAttribute("aria-pressed", on);
  world?.setHomes(on);
};
q("#sample").onclick = () => selectPlot(25);
q("#compass").onclick = () => selectPlot(null);

// Panels.
const nearby = [
  ["place.0", 0, "Highway"],
  ["place.1", 3, "Other"],
  ["place.2", 5, "Other"],
  ["place.3", 8, "Highway"],
  ["place.4", 15, "Mall / Market"],
  ["place.5", 2, "Airport"],
];
const english = ["Vankala Canal Road", "Sonsak Village Center", "Ambheta Branch Post Office", "Kim–Olpad Road", "Olpad City Center / Market", "International Airport Road"];
function landmarks(limit = 6) {
  return (
    '<div class="landmarks">' +
    nearby
      .slice(0, limit)
      .map(
        ([key, mins, cat], i) =>
          `<a class="landmark" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(english[i] + " Surat Gujarat")}" target="_blank" rel="noopener"><i>${icon(cat === "Highway" ? "navigation" : "house")}</i><div><strong>${t(key)}</strong><small><b>${t("mins", { n: mins })}</b> · ${t("cat." + cat)}</small></div></a>`,
      )
      .join("") +
    "</div>"
  );
}
function openPanel(title, content, type) {
  if (!panel.open) returnFocus = document.activeElement;
  panelType = type;
  q("#panel-title").textContent = title;
  body.innerHTML = content;
  panel.className = type === "gallery" ? "gallery-panel" : "";
  if (!panel.open) panel.showModal();
  body.scrollTop = 0;
  qa("[data-panel]").forEach((b) => b.classList.toggle("active", b.dataset.panel === type));
}
function searchPanel() {
  openPanel(
    t("search.title"),
    `<input id="plot-search" type="search" inputmode="numeric" aria-label="${t("search.label")}" placeholder="${t("search.placeholder")}"><div class="size-label">${t("search.size")}</div><div class="size-filters"><button class="active" data-size="all">${t("search.all")}</button><button data-size="small">&lt; 100 yd²</button><button data-size="medium">100–200 yd²</button><button data-size="large">200+ yd²</button></div><div id="search-results"></div>`,
    "search",
  );
  let size = "all";
  const render = () => {
    const term = q("#plot-search").value.trim().replace("#", ""),
      found = plots.filter(
        (p) =>
          String(p.id).includes(term) &&
          (size === "all" ||
            (size === "small" && p.area / 9 < 100) ||
            (size === "medium" && p.area / 9 >= 100 && p.area / 9 < 200) ||
            (size === "large" && p.area / 9 >= 200)),
      );
    q("#search-results").innerHTML = found.length
      ? found
          .map((p) => `<button class="search-result" data-result="${p.id}"><strong># ${p.id}</strong><small>${fmt(p.area)} ft²</small><span class="status ${p.status}">${statusLabel(p.status)}</span></button>`)
          .join("")
      : `<p>${t("search.none")}</p>`;
  };
  q("#plot-search").oninput = render;
  qa("[data-size]").forEach(
    (b) =>
      (b.onclick = () => {
        size = b.dataset.size;
        qa("[data-size]").forEach((x) => x.classList.toggle("active", x === b));
        render();
      }),
  );
  q("#search-results").onclick = (e) => {
    const b = e.target.closest("[data-result]");
    if (b) selectPlot(+b.dataset.result);
  };
  render();
}
function detailsPanel() {
  openPanel(
    t("details.title"),
    `<div class="demo-info">${t("details.tag")}</div><h3>${t("details.about")}</h3><p>${t("details.aboutText")}</p><h3>${t("details.location")}</h3><p>${t("details.place")}<br>${t("details.ref")}</p>
    <div class="stats"><div><span>${t("details.totalArea")}</span><strong>${fmt(plots.reduce((s, p) => s + p.area, 0) / 9)}</strong><small>${t("details.sqyd")}</small></div><div><span>${t("details.totalPlots")}</span><strong>63</strong><small>${t("details.demoPlots")}</small></div></div>
    <h3>${t("details.amenities")}</h3><div class="amenities">${Array.from({ length: 12 }, (_, i) => "<span>" + icon("tree") + t("amenity." + i) + "</span>").join("")}</div>
    <div class="contact-list"><a href="https://www.kapadiya.tech" target="_blank" rel="noopener">Kapadiya & Sons ↗</a><a href="tel:+917575807403">+91 75758 07403 ↗</a><a href="mailto:smitkapadiya.work@gmail.com">smitkapadiya.work@gmail.com ↗</a></div>
    ${enquiry("PinYourSite")}
    <h3>${t("details.by")}</h3><p>${t("details.byText")}</p><div class="contact-list"><a href="${wa("Hi Smit! Could we discuss pricing and features for PinYourSite Plots for my development?")}" target="_blank" rel="noopener">${t("details.pricing")}</a></div>`,
    "details",
  );
  wireForms(body);
}
function nearbyPanel() {
  openPanel(t("nearby.title"), `<p class="demo-info">${t("nearby.intro")}</p>${landmarks()}`, "nearby");
}
function brochurePanel() {
  openPanel(
    t("brochure.title"),
    `<div class="catalogue">${icon("file")}<h3>PinYourSite</h3><p>${t("brochure.tag")}</p><small>${t("brochure.kind")}</small></div><a class="primary full" href="/pinyoursite-demo.pdf" download>${icon("download")}${t("brochure.download")}</a><p>${t("brochure.text")}</p><a class="ghost full" href="${wa("Hi Kapadiya & Sons! I’d like to know more about PinYourSite and Architect’s Cut.")}" target="_blank" rel="noopener">${t("brochure.enquire")}</a>`,
    "brochure",
  );
}
const imagePath = (i) => "/gallery/" + String(i + 1).padStart(2, "0") + ".webp";
const imageName = (i) => t("g." + i);
const IMAGES = 14;
let imageIndex = 0;
function galleryPanel() {
  openPanel(
    t("gallery.title"),
    '<div class="gallery-grid">' +
      Array.from(
        { length: IMAGES },
        (_, i) =>
          `<button data-gallery="${i}" aria-label="${t("gallery.view", { n: imageName(i) })}"><img src="${imagePath(i)}" loading="lazy" alt="${t("gallery.alt", { n: imageName(i) })}"><span>${String(i + 1).padStart(2, "0")} / ${imageName(i)}</span></button>`,
      ).join("") +
      `</div><p class="fine">${t("gallery.fine")}</p>`,
    "gallery",
  );
  qa("[data-gallery]").forEach((b) => (b.onclick = () => openImage(+b.dataset.gallery)));
}
function openImage(index) {
  imageIndex = (index + IMAGES) % IMAGES;
  q("#lightbox-image").src = imagePath(imageIndex);
  q("#lightbox-image").alt = t("gallery.alt", { n: imageName(imageIndex) });
  q("#image-download").href = imagePath(imageIndex);
  q("#image-count").textContent = imageIndex + 1 + " / " + IMAGES + " — " + imageName(imageIndex);
  q(".lightbox-stage").classList.remove("zoomed");
  q("#image-thumbs").innerHTML = Array.from(
    { length: IMAGES },
    (_, i) => `<button data-thumb="${i}" aria-label="${t("gallery.view", { n: imageName(i) })}" aria-pressed="${i === imageIndex}"><img src="${imagePath(i)}" alt=""></button>`,
  ).join("");
  qa("[data-thumb]").forEach((b) => (b.onclick = () => openImage(+b.dataset.thumb)));
  if (!q("#lightbox").open) q("#lightbox").showModal();
}
q("#image-close").onclick = () => q("#lightbox").close();
q("#image-next").onclick = () => openImage(imageIndex + 1);
q("#image-prev").onclick = () => openImage(imageIndex - 1);
q("#image-zoom").onclick = () => q(".lightbox-stage").classList.toggle("zoomed");
q("#image-full").onclick = async () => {
  try {
    document.fullscreenElement ? await document.exitFullscreen() : await q("#lightbox").requestFullscreen();
  } catch {
    toast(t("fullscreen.fail"));
  }
};

let map, overlay, overlayVisible = true;
async function gpsPanel() {
  panel.close();
  q("#gps-view").hidden = false;
  if (map) { map.invalidateSize(); return; }
  try {
    const mod = await import("leaflet"), L = mod.default || mod;
    await import("leaflet/dist/leaflet.css");
    const center = [21.25548, 72.76072];
    map = L.map("satellite-map", { zoomControl: false, minZoom: 12, maxZoom: 22, zoomSnap: 0.1, zoomDelta: 0.5 }).setView(center, innerWidth < 1024 ? 18.2 : 19.2);
    const tiles = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxNativeZoom: 19, maxZoom: 22, attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
    }).addTo(map);
    tiles.on("tileerror", () => (q("#map-error").hidden = false));
    tiles.on("load", () => (q("#map-error").hidden = true));
    overlay = document.createElement("img");
    overlay.src = "/satellite-overlay.webp";
    overlay.className = "satellite-overlay";
    overlay.style.position = "absolute";
    map.getPanes().overlayPane.append(overlay);
    function position() {
      const c = map.latLngToLayerPoint(center), n = map.latLngToLayerPoint([center[0] + 0.001, center[1]]);
      const pixels = Math.abs(c.y - n.y) / 110.54, w = 190 * pixels, h = w * (overlay.naturalHeight / overlay.naturalWidth || 0.5625);
      Object.assign(overlay.style, { width: w + "px", height: h + "px", left: c.x - w / 2 + "px", top: c.y - h / 2 + "px", transform: "rotate(-101deg)" });
    }
    overlay.onload = position;
    map.on("move zoom viewreset", position);
    position();
    L.marker(center, { icon: L.divIcon({ className: "gps-project-label", html: "PinYourSite 3D ↗", iconSize: [120, 38], iconAnchor: [60, 100] }) }).addTo(map).on("click", closeGps);
    q("#gps-home").onclick = () => map.flyTo(center, innerWidth < 1024 ? 18.2 : 19.2, { duration: 1 });
    q("#gps-plus").onclick = () => map.zoomIn();
    q("#gps-minus").onclick = () => map.zoomOut();
    q("#gps-overlay").onclick = () => {
      overlayVisible = !overlayVisible;
      overlay.hidden = !overlayVisible;
      q("#gps-overlay").setAttribute("aria-pressed", overlayVisible);
    };
  } catch {
    q("#map-error").hidden = false;
  }
}
function closeGps() {
  q("#gps-view").hidden = true;
  q("[data-panel=gps]").focus();
}
q("#gps-close").onclick = closeGps;
q("#gps-explore").onclick = closeGps;

async function share(id) {
  const url = new URL(location.origin + location.pathname);
  if (id) url.searchParams.set("plot", id);
  if (lang !== "en") url.searchParams.set("lang", lang);
  if (navigator.share) {
    try {
      await navigator.share({ title: "PinYourSite by Kapadiya & Sons", text: id ? t("share.text") + " · " + t("plot.n", { n: id }) : t("share.text"), url: url.href });
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url.href);
    toast(t("copied"));
  } catch {
    openPanel(t("share.project"), `<label for="share-url">${t("share.copy")}</label><input id="share-url" readonly value="${url.href}">`, "share");
    q("#share-url").select();
  }
}
q("#share").onclick = () => share(selected);

const panels = { search: searchPanel, details: detailsPanel, gallery: galleryPanel, nearby: nearbyPanel, gps: gpsPanel, brochure: brochurePanel };
qa("[data-panel]").forEach((b) => (b.onclick = () => panels[b.dataset.panel]()));
q("#close-panel").onclick = () => panel.close();
panel.addEventListener("click", (e) => {
  if (e.target === panel) {
    const r = panel.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) panel.close();
  }
});
panel.addEventListener("close", () => {
  panelType = null;
  qa("[data-panel]").forEach((b) => b.classList.remove("active"));
  returnFocus?.focus?.();
});
document.addEventListener("keydown", (e) => {
  if (q("#house-view").open) return;
  if (q("#lightbox").open && ["ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
    openImage(imageIndex + (e.key === "ArrowRight" ? 1 : -1));
  }
  if (e.key === "Escape" && !q("#gps-view").hidden) closeGps();
  else if (e.key === "Escape" && selected != null && !panel.open && !q("#lightbox").open) selectPlot(null);
});

// Re-render dynamic text when the language changes.
onLang(() => {
  renderCard();
  if (panel.open && panelType && panels[panelType] && panelType !== "gps" && panelType !== "share") panels[panelType]();
  if (q("#lightbox").open) openImage(imageIndex);
});

// Sample villa tour.
const house = q("#house-view");
let houseSession = 0, disposeHouse;
async function openHouse() {
  const session = ++houseSession;
  house.showModal();
  house.classList.remove("house-ready", "house-fallback", "inside-villa");
  translate(house);
  const status = q("#house-status");
  status.textContent = t("villa.opening");
  try {
    const { startHouse } = await import("./house-view.js");
    if (session !== houseSession) return;
    const dispose = await startHouse(house);
    if (session !== houseSession) { dispose(); return; }
    disposeHouse = dispose;
    house.classList.add("house-ready");
    status.textContent = "";
  } catch {
    if (session !== houseSession) return;
    house.classList.add("house-fallback");
    status.textContent = t("villa.fallback");
  }
}
q("#house-close").onclick = () => house.close();
house.addEventListener("close", () => {
  ++houseSession;
  disposeHouse?.();
  disposeHouse = undefined;
  card.querySelector("[data-act=villa]")?.focus();
});

// Hover tooltip (mouse only).
function hover(id, x, y) {
  const tip = q("#hover-tip");
  if (id == null || id === selected) { tip.hidden = true; return; }
  const p = plots.find((p) => p.id === id);
  tip.innerHTML = `<strong>${t("plot.n", { n: id })}<span class="status ${p.status}">${statusLabel(p.status)}</span></strong><small>${fmt(p.area)} ft² · ${t("design." + layouts.get(id).design)}</small>`;
  tip.style.left = Math.min(innerWidth - 210, x + 18) + "px";
  tip.style.top = Math.max(70, y - 70) + "px";
  tip.hidden = false;
}

// Boot the 3D world, falling back to the flat plan when WebGL is unavailable.
const initial = () => +(new URLSearchParams(location.search).get("plot") || location.hash.replace("#plot-", "")) || null;
async function boot() {
  const loader = q("#loader");
  try {
    const { createWorld } = await import("./world.js");
    world = await createWorld({
      host: q("#stage"),
      labels: q("#labels"),
      plots,
      onPick: (id) => (id == null ? selected != null && selectPlot(null) : selectPlot(id === selected ? null : id)),
      onHover: hover,
      onProgress: (f) => (q("#progress").style.width = Math.round(f * 100) + "%"),
    });
    q("#progress").style.width = "100%";
    document.body.classList.add("ready");
    loader.classList.add("done");
    setTimeout(() => loader.remove(), 900);
    const id = initial();
    if (id) setTimeout(() => selectPlot(id, { updateUrl: false }), 200);
    else world.intro();
    setTimeout(() => q("#hint").classList.add("gone"), 6500);
  } catch (error) {
    console.error(error);
    loader.querySelector("p").textContent = t("loading.fail");
    loader.querySelector(".bar").remove();
    const img = document.createElement("img");
    img.src = "/masterplan.webp";
    img.alt = "";
    img.className = "fallback-plan";
    q("#stage").prepend(img);
    setTimeout(() => loader.classList.add("done"), 1600);
    document.body.classList.add("ready", "flat");
    const id = initial();
    if (id) selectPlot(id, { updateUrl: false });
  }
}
boot();
