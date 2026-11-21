import "./style.css";
import { t, lang, mountSwitch, onLang, translate } from "./i18n.js";

const q = (s, r = document) => r.querySelector(s),
  qa = (s, r = document) => [...r.querySelectorAll(s)],
  fmt = (n) => new Intl.NumberFormat("en-IN").format(n);
const wa = (s) => "https://wa.me/917575807403?text=" + encodeURIComponent(s);
const paths = {
  share: "M8 10 16 6M8 14l8 4M8 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0M22 5a3 3 0 1 0-6 0 3 3 0 0 0 6 0M22 19a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
  search: "M21 21l-5-5M18 10a8 8 0 1 0-16 0 8 8 0 0 0 16 0",
  info: "M12 11v6M12 7h.01M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0",
  image: "M3 3h18v18H3ZM3 17l6-6 4 4 3-3 5 5M9 7h.01",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
  navigation: "m22 2-7 20-4-9L2 9Z",
  file: "M14 2H5v20h14V7ZM14 2v6h5M8 12h8M8 16h8",
  x: "m6 6 12 12M18 6 6 18",
  left: "m15 5-7 7 7 7",
  right: "m9 5 7 7-7 7",
  cube: "m12 2 9 5v10l-9 5-9-5V7Zm0 10 9-5M12 12v10M12 12 3 7",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
  school: "M2 9l10-5 10 5-10 5ZM6 11v5c3 2 9 2 12 0v-5",
  hospital: "M3 21V5h18v16M9 9h6M12 6v6M9 21v-5h6v5",
  plane: "M2 16l8-2 4-10h2l-1 9 6 1v2l-6 1 1 3h-2l-3-3-8 1Z",
};
const icon = (n) => '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (paths[n] || paths.pin) + '"/></svg>';
qa("[data-icon]").forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
mountSwitch(q("#lang"));

const data = await fetch("/apartments/inventory.json").then((r) => r.json());
const wings = Object.keys(data.wings).sort();
const all = wings.flatMap((w) => data.wings[w].units.map((u) => ({ ...u, wing: w })));
const byId = new Map(all.map((u) => [u.id, u]));
const group = (s) => (s === "available" || s === "sold" ? s : "hold");
const FLOORS = Math.max(...all.map((u) => u.floor));
let world = null, wing = null, floor = null, unit = null, balcony = false, legendOn = false, toastTimer, returnFocus, panelType = null;

function toast(s) {
  clearTimeout(toastTimer);
  q("#toast").textContent = s;
  q("#toast").classList.add("visible");
  toastTimer = setTimeout(() => q("#toast").classList.remove("visible"), 3400);
}
const available = (list) => list.filter((u) => u.status === "available").length;
const typeOf = (w) => data.wings[w].units[0].type;

// Navigation state.
function setState(next, { fly = true, url = true } = {}) {
  ({ wing = null, floor = null, unit = null } = next);
  balcony = false;
  q("#hover-tip").hidden = true;
  if (fly && world) {
    if (unit) world.floor(wing, floor, unit);
    else if (floor) world.floor(wing, floor);
    else if (wing) world.wing(wing);
    else world.overview();
  }
  if (url) {
    const u = new URL(location.href);
    for (const k of ["wing", "floor", "unit"]) u.searchParams.delete(k);
    if (wing) u.searchParams.set("wing", wing);
    if (floor) u.searchParams.set("floor", floor);
    if (unit) u.searchParams.set("unit", unit);
    history.replaceState(null, "", u);
  }
  render();
}
const goWing = (w) => setState({ wing: w });
const goFloor = (f) => setState({ wing, floor: f });
const goUnit = (id) => {
  const u = byId.get(id);
  if (u) setState({ wing: u.wing, floor: u.floor, unit: id });
};

function render() {
  document.body.classList.toggle("in-wing", Boolean(wing));
  document.body.classList.toggle("unit-open", Boolean(unit));
  document.body.classList.toggle("on-balcony", balcony);
  renderWings();
  renderFloors();
  renderCard();
  renderKey();
  renderLabels();
  q("#hint").textContent = t(balcony ? "hint.balcony" : wing ? "hint.wing" : "hint.overview");
}
function renderWings() {
  const bar = q("#wings");
  bar.innerHTML =
    `<button data-wing="" aria-pressed="${!wing}">${t("wings.all")}</button>` +
    wings.map((w) => `<button data-wing="${w}" aria-pressed="${w === wing}"><b>${w}</b><small>${typeOf(w).split(" ").slice(0, 2).join(" ")}</small></button>`).join("");
}
q("#wings").onclick = (e) => {
  const b = e.target.closest("[data-wing]");
  if (!b) return;
  b.dataset.wing ? goWing(b.dataset.wing) : setState({});
};
function renderFloors() {
  const rail = q("#floors");
  rail.hidden = !wing;
  if (!wing) return;
  const units = data.wings[wing].units;
  let html = `<small>${t("floors")}</small>`;
  for (let f = FLOORS; f >= 1; f--) {
    const here = units.filter((u) => u.floor === f).sort((a, b) => a.id.localeCompare(b.id));
    html += `<button data-floor="${f}" aria-pressed="${f === floor}" aria-label="${t("floor", { n: f })}, ${t("wing.available", { n: available(here) })}"><b>${f}</b><span>${here.map((u) => `<i class="${group(u.status)}"></i>`).join("")}</span></button>`;
  }
  rail.innerHTML = html;
  rail.querySelector("[aria-pressed=true]")?.scrollIntoView({ block: "nearest", inline: "center" });
}
q("#floors").onclick = (e) => {
  const b = e.target.closest("[data-floor]");
  if (b) goFloor(+b.dataset.floor);
};
function renderKey() {
  const key = q("#status-key");
  key.hidden = !(legendOn || wing);
  const scope = wing ? data.wings[wing].units.filter((u) => !floor || u.floor === floor) : all;
  const c = { available: 0, hold: 0, sold: 0 };
  scope.forEach((u) => c[group(u.status)]++);
  key.innerHTML = ["available", "hold", "sold"].map((s) => `<span class="${s}"><i></i>${t("status." + s)} <b>${c[s]}</b></span>`).join("");
}
function renderLabels() {
  qa(".wing-label").forEach((el) => {
    const w = el.dataset.wing;
    el.innerHTML = `<span><strong>${t("wing", { n: w })}</strong><small>${t("type." + typeOf(w))} · ${t("wing.available", { n: available(data.wings[w].units) })}</small></span>`;
  });
  const label = q(".unit-label");
  if (label) label.textContent = unit || "";
}

// Flat card.
function renderCard() {
  const card = q("#unit-card");
  const u = unit && byId.get(unit);
  if (!u) { card.hidden = true; card.replaceChildren(); return; }
  card.innerHTML = `
    <div class="grab" aria-hidden="true"></div>
    <header>
      <div><small>${t("wing", { n: u.wing })} · ${t("floor", { n: u.floor })}</small><h2>${u.id}</h2></div>
      <span class="status ${group(u.status)}">${t("status." + u.status)}</span>
      <span class="spacer"></span>
      <button class="icon-btn" data-act="prev" aria-label="${t("unit.prev")}">${icon("left")}</button>
      <button class="icon-btn" data-act="next" aria-label="${t("unit.next")}">${icon("right")}</button>
      <button class="icon-btn" data-act="close" aria-label="${t("close")}">${icon("x")}</button>
    </header>
    <div class="stats">
      <div><span>${t("carpet")}</span><strong>${fmt(u.area)} ${t("sqft")}</strong><small>${t("type." + u.type)}</small></div>
      <div><span>${t("facing")}</span><strong>${t("facing." + u.facing)}</strong><small>${t("floor", { n: u.floor })}</small></div>
    </div>
    <div class="trio"><div><b>${u.beds}</b><span>${t("beds")}</span></div><div><b>${u.baths}</b><span>${t("baths")}</span></div><div><b>${u.parking}</b><span>${t("parking")}</span></div></div>
    <div class="actions">
      <button class="primary" data-act="tour">${icon("cube")}${t("unit.tour")}</button>
      <button class="ghost" data-act="balcony" aria-pressed="${balcony}">${icon("eye")}<span>${t(balcony ? "unit.balconyExit" : "unit.balcony")}</span></button>
      <button class="ghost" data-act="share" aria-label="${t("share")}">${icon("share")}</button>
    </div>
    <a class="ghost full enquire" href="${wa(`Hi Smit, I explored PinYourSite Apartments in 3D: Wing ${u.wing}, Floor ${u.floor}, ${u.id} (${u.type}, ${u.area} sq ft). Please share details for my project. (language: ${lang})`)}" target="_blank" rel="noopener">${t("unit.enquire")}</a>
    <p class="fine">${t("unit.sampleNote")} ${t("unit.fine")}</p>`;
  card.hidden = false;
}
function step(dir) {
  const list = data.wings[wing].units.slice().sort((a, b) => a.floor - b.floor || a.id.localeCompare(b.id));
  const i = list.findIndex((u) => u.id === unit);
  goUnit(list[(i + dir + list.length) % list.length].id);
}
q("#unit-card").addEventListener("click", (e) => {
  const act = e.target.closest("[data-act]")?.dataset.act;
  if (act === "close") setState({ wing, floor });
  if (act === "prev") step(-1);
  if (act === "next") step(1);
  if (act === "tour") openFlat();
  if (act === "share") share();
  if (act === "balcony") {
    if (!world) return;
    if (balcony) { world.exitBalcony(unit); balcony = false; }
    else { world.balcony(unit); balcony = true; }
    document.body.classList.toggle("on-balcony", balcony);
    renderCard();
    q("#hint").textContent = t(balcony ? "hint.balcony" : "hint.wing");
    q("#hint").classList.remove("gone");
  }
});
let touchStart = null;
q("#unit-card").addEventListener("touchstart", (e) => (touchStart = e.target.closest(".grab, header") ? e.touches[0].clientY : null), { passive: true });
q("#unit-card").addEventListener("touchend", (e) => {
  if (touchStart != null && e.changedTouches[0].clientY - touchStart > 50) setState({ wing, floor });
  touchStart = null;
});

// Rail switches.
q("#legend").onclick = () => {
  legendOn = !legendOn;
  q("#legend").setAttribute("aria-pressed", legendOn);
  world?.setStatusAll(legendOn);
  renderKey();
};
qa("[data-mode]").forEach(
  (b) =>
    (b.onclick = () => {
      qa("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      document.body.dataset.mode = b.dataset.mode;
      world?.setMode(b.dataset.mode);
    }),
);
q("#sample").onclick = () => goUnit("B-102");
q("#compass").onclick = () => setState({});

// Sample flat tour (Blender glTF, loaded on demand).
const tour = q("#flat-tour");
let tourTicket = 0, releaseTour;
async function openFlat() {
  const ticket = ++tourTicket, poster = q(".flat-stage img", tour);
  if (!poster.hasAttribute("src")) poster.src = poster.dataset.src;
  translate(tour);
  tour.showModal();
  tour.classList.remove("interactive");
  q("#flat-hint").textContent = t("flat.loading");
  try {
    const { openFlat: start } = await import("../flat-web.js");
    if (ticket !== tourTicket) return;
    const clean = await start(tour, () => ticket === tourTicket, t("flat.hint"));
    if (ticket !== tourTicket) { clean(); return; }
    releaseTour = clean;
  } catch {
    if (ticket === tourTicket) q("#flat-hint").textContent = t("flat.fallback");
  }
}
q("#close-flat").onclick = () => tour.close();
tour.addEventListener("close", () => {
  ++tourTicket;
  releaseTour?.();
  releaseTour = null;
  tour.classList.remove("interactive");
  q("[data-act=tour]")?.focus();
});

// Panels.
const panel = q("#panel"), body = q("#panel-body");
function openPanel(title, html, type) {
  if (!panel.open) returnFocus = document.activeElement;
  panelType = type;
  q("#panel-title").textContent = title;
  body.innerHTML = html;
  panel.className = type;
  if (!panel.open) panel.showModal();
  qa("[data-panel]").forEach((b) => b.classList.toggle("active", b.dataset.panel === type));
}
q("#close-panel").onclick = () => panel.close();
panel.addEventListener("click", (e) => {
  if (e.target !== panel) return;
  const r = panel.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) panel.close();
});
panel.addEventListener("close", () => {
  panelType = null;
  qa("[data-panel]").forEach((b) => b.classList.remove("active"));
  returnFocus?.focus?.();
});
function searchPanel() {
  openPanel(t("search.title"), `<input id="unit-search" type="search" placeholder="${t("search.placeholder")}" aria-label="${t("search.title")}"><label class="check"><input type="checkbox" id="only-available"> ${t("search.onlyAvailable")}</label><div id="results"></div>`, "search");
  const input = q("#unit-search"), only = q("#only-available"), results = q("#results");
  const find = () => {
    const term = input.value.trim().toLowerCase();
    const found = all.filter((u) => u.id.toLowerCase().includes(term) && (!only.checked || u.status === "available")).slice(0, 80);
    results.innerHTML = found.length
      ? found.map((u) => `<button class="search-result" data-unit="${u.id}"><strong>${u.id}</strong><small>${t("type." + u.type)} · ${t("floor", { n: u.floor })}</small><span class="status ${group(u.status)}">${t("status." + u.status)}</span></button>`).join("")
      : `<p>${t("search.none")}</p>`;
  };
  input.oninput = only.onchange = find;
  results.onclick = (e) => {
    const b = e.target.closest("[data-unit]");
    if (b) { panel.close(); goUnit(b.dataset.unit); }
  };
  find();
  input.focus();
}
function detailsPanel() {
  const directions = "https://www.google.com/maps/dir/?api=1&destination=" + data.latitude + "," + data.longitude;
  openPanel(
    t("details.title"),
    `<h3>${t("details.about")}</h3><p>${t("details.aboutText")}</p>
    <div class="stats"><div><span>${t("details.area")}</span><strong>${t("details.areaValue")}</strong></div><div><span>${t("details.units")}</span><strong>${t("details.unitsValue")}</strong></div></div>
    <h3>${t("details.location")}</h3><p>${t("details.place")}</p>
    <h3>${t("details.amenities")}</h3><div class="amenities">${Array.from({ length: 10 }, (_, i) => `<span>${t("amenity." + i)}</span>`).join("")}</div>
    <h3>${t("details.links")}</h3><div class="contact-list"><a href="/">Kapadiya &amp; Sons ↗</a><a href="${directions}" target="_blank" rel="noopener">Google Maps ↗</a></div>
    <h3>${t("details.connect")}</h3><div class="contact-list"><a href="tel:+917575807403">Smit Kapadiya · +91 75758 07403</a><a href="mailto:smitkapadiya.work@gmail.com">smitkapadiya.work@gmail.com</a></div>
    <a class="primary full" href="${wa("Hi Smit, I would like to discuss PinYourSite Apartments.")}" target="_blank" rel="noopener">WhatsApp ↗</a>`,
    "details",
  );
}
function distance(d) {
  const [n, unitWord] = d.split(" ");
  return t(/km/i.test(unitWord) ? "km" : "mins", { n });
}
function nearbyPanel() {
  const icons = { School: "school", Hospital: "hospital", Highway: "navigation", Airport: "plane" };
  openPanel(
    t("nearby.title"),
    `<div class="landmarks">${data.nearby
      .map((n) => `<a class="landmark" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(n.name + " Olpad Surat")}" target="_blank" rel="noopener"><i>${icon(icons[n.category] || "pin")}</i><div><strong>${t("place." + n.name)}</strong><small><b>${distance(n.distance)}</b> · ${t("cat." + n.category)}</small></div></a>`)
      .join("")}</div>`,
    "nearby",
  );
}
let photo = 0;
function galleryPanel() {
  openPanel(t("gallery.title"), `<div class="photo-stage"><img id="photo" alt="${t("gallery.alt")}"></div><div class="photo-controls"><button class="ghost" id="prev-photo">${t("gallery.prev")}</button><output></output><button class="ghost" id="next-photo">${t("gallery.next")}</button></div><div id="thumbs"></div>`, "gallery");
  const update = () => {
    q("#photo").src = "/apartments/" + data.gallery[photo] + ".webp";
    q(".photo-controls output").textContent = photo + 1 + " / " + data.gallery.length;
    qa("#thumbs button").forEach((b, i) => b.setAttribute("aria-pressed", i === photo));
  };
  const move = (n) => { photo = (photo + n + data.gallery.length) % data.gallery.length; update(); };
  q("#prev-photo").onclick = () => move(-1);
  q("#next-photo").onclick = () => move(1);
  q("#thumbs").innerHTML = data.gallery.map((g, i) => `<button data-photo="${i}"><img src="/apartments/${g}.webp" loading="lazy" alt="${t("gallery.show", { n: i + 1 })}"></button>`).join("");
  q("#thumbs").onclick = (e) => { const b = e.target.closest("[data-photo]"); if (b) { photo = +b.dataset.photo; update(); } };
  update();
}
const gps = q("#gps");
let closeMap;
async function gpsPanel() {
  if (panel.open) panel.close();
  translate(gps);
  gps.showModal();
  const u = new URL(location.href);
  u.searchParams.set("map", "true");
  history.replaceState(null, "", u);
  try {
    const { satellite } = await import("./satellite.js");
    closeMap = await satellite(gps, data);
  } catch {
    q("#tile-status").textContent = t("gps.tiles");
  }
}
q("#gps-back").onclick = () => gps.close();
gps.addEventListener("close", () => {
  closeMap?.();
  closeMap = null;
  const u = new URL(location.href);
  u.searchParams.delete("map");
  history.replaceState(null, "", u);
});
const panels = { search: searchPanel, details: detailsPanel, gallery: galleryPanel, nearby: nearbyPanel, gps: gpsPanel };
qa("[data-panel]").forEach((b) => (b.onclick = () => panels[b.dataset.panel]()));

async function share() {
  const u = new URL(location.href);
  u.searchParams.delete("map");
  if (lang !== "en") u.searchParams.set("lang", lang);
  if (navigator.share) {
    try { await navigator.share({ title: "PinYourSite Apartments", url: u.href }); return; } catch (e) { if (e.name === "AbortError") return; }
  }
  try {
    await navigator.clipboard.writeText(u.href);
    toast(t("copied"));
  } catch {
    openPanel(t("share.project"), `<label for="share-url">${t("share.copy")}</label><input id="share-url" readonly value="${u.href}">`, "share");
  }
}
q("#share").onclick = share;

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || panel.open || gps.open || tour.open) return;
  if (balcony) { world?.exitBalcony(unit); balcony = false; render(); }
  else if (unit) setState({ wing, floor });
  else if (floor) setState({ wing });
  else if (wing) setState({});
});

onLang(() => {
  render();
  if (panel.open && panels[panelType]) panels[panelType]();
});

// Hover tooltip (mouse only).
function hover(p, x, y) {
  const tip = q("#hover-tip");
  if (!p) { tip.hidden = true; return; }
  if (p.unit) {
    const u = byId.get(p.unit);
    tip.innerHTML = `<strong>${u.id}<span class="status ${group(u.status)}">${t("status." + u.status)}</span></strong><small>${t("type." + u.type)} · ${fmt(u.area)} ${t("sqft")} · ${t("facing." + u.facing)}</small>`;
  } else {
    tip.innerHTML = `<strong>${t("wing", { n: p.wing })}</strong><small>${t("type." + typeOf(p.wing))} · ${t("wing.available", { n: available(data.wings[p.wing].units) })}</small>`;
  }
  tip.style.left = Math.min(innerWidth - 240, x + 18) + "px";
  tip.style.top = Math.max(70, y - 70) + "px";
  tip.hidden = false;
}

// Restore a shared view: ?wing=B&floor=1&unit=B-102 (same as the previous viewer).
function fromUrl() {
  const p = new URLSearchParams(location.search), w = p.get("wing");
  if (!wings.includes(w)) return {};
  const f = Number(p.get("floor")) || null, id = p.get("unit");
  const u = byId.get(id);
  if (u && u.wing === w) return { wing: w, floor: u.floor, unit: id };
  return { wing: w, floor: f && f >= 1 && f <= FLOORS ? f : null };
}

async function boot() {
  const loader = q("#loader");
  render();
  try {
    const { createWorld } = await import("./world.js");
    world = await createWorld({
      host: q("#stage"),
      labels: q("#labels"),
      data,
      onPickWing: (w) => { if (w !== wing) goWing(w); },
      onPickUnit: goUnit,
      onHover: hover,
      onProgress: (f) => (q("#progress").style.width = Math.round(f * 100) + "%"),
    });
    document.body.classList.add("ready");
    loader.classList.add("done");
    setTimeout(() => loader.remove(), 900);
    const initial = fromUrl();
    if (initial.wing) setState(initial, { url: false });
    else world.intro();
    render();
    setTimeout(() => q("#hint").classList.add("gone"), 7000);
  } catch (error) {
    console.error(error);
    q("p", loader).textContent = t("loading.fail");
    q(".bar", loader)?.remove();
    const img = Object.assign(document.createElement("img"), { src: "/apartments/elevation.webp", alt: "", className: "fallback-plan" });
    q("#stage").prepend(img);
    document.body.classList.add("ready", "flat");
    setTimeout(() => loader.classList.add("done"), 1600);
    setState(fromUrl(), { url: false, fly: false });
  }
  if (new URLSearchParams(location.search).get("map") === "true") gpsPanel();
}
boot();
