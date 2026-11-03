import "./style.css";
import plots from "./plots.json";
import { dimensions, fitView, plotView } from "./geometry.js";
const q = (s) => document.querySelector(s),
  qa = (s) => [...document.querySelectorAll(s)],
  fmt = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
const wa = (s) => "https://wa.me/917575807403?text=" + encodeURIComponent(s);
const paths = {
  house: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z",
  share:
    "M8 10 16 6M8 14l8 4M8 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0M22 5a3 3 0 1 0-6 0 3 3 0 0 0 6 0M22 19a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
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
};
const icon = (n) =>
  '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="' +
  (paths[n] || paths.pin) +
  '"/></svg>';
function icons(root = document) {
  root
    .querySelectorAll("[data-icon]")
    .forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
}
icons();
const view = q("#map-viewport"),
  transform = q("#map-transform"),
  panel = q("#panel"),
  body = q("#panel-body"),
  detail = q("#plot-detail");
let selected = null,
  state = fitView(innerWidth, innerHeight),
  animation = 0,
  panelType = null,
  legend = false,
  toastTimer,
  returnFocus,
  expanded = false;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
function toast(s) {
  clearTimeout(toastTimer);
  q("#toast").textContent = s;
  q("#toast").classList.add("visible");
  toastTimer = setTimeout(() => q("#toast").classList.remove("visible"), 3500);
}
function renderPlots() {
  q("#plots").innerHTML = [
    ...plots.filter((p) => p.id !== selected),
    ...plots.filter((p) => p.id === selected),
  ]
    .map((p) => {
      const active = p.id === selected;
      return (
        '<g class="plot ' +
        p.status +
        (active ? " selected" : "") +
        '" data-plot="' +
        p.id +
        '" role="button" tabindex="0" aria-label="Plot ' +
        p.id +
        ", " +
        p.status +
        ", " +
        fmt(p.area) +
        ' square feet" aria-pressed="' +
        active +
        '"><polygon points="' +
        p.points +
        '"/><text x="' +
        p.x +
        '" y="' +
        (p.y - (active ? 7 : 0)) +
        '" text-anchor="middle" dominant-baseline="middle">' +
        p.id +
        "</text>" +
        (active
          ? '<text class="plot-area" x="' +
            p.x +
            '" y="' +
            (p.y + 5) +
            '" text-anchor="middle">' +
            fmt(p.area) +
            ' ft²</text><text class="plot-var" x="' +
            p.x +
            '" y="' +
            (p.y + 14) +
            '" text-anchor="middle">' +
            fmt(p.area / 9) +
            " Var</text>"
          : "") +
        "</g>"
      );
    })
    .join("");
  applyFilters();
}
function apply() {
  transform.style.transform =
    "translate3d(" + state.x + "px," + state.y + "px,0) scale(" + state.k + ")";
}
function transition(target, animate = true) {
  cancelAnimationFrame(animation);
  if (!animate || reduced.matches) {
    state = target;
    apply();
    return;
  }
  const start = { ...state },
    time = performance.now();
  function tick(t) {
    const p = Math.min(1, (t - time) / 1100),
      e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    state = {
      x: start.x + (target.x - start.x) * e,
      y: start.y + (target.y - start.y) * e,
      k: start.k + (target.k - start.k) * e,
    };
    apply();
    if (p < 1) animation = requestAnimationFrame(tick);
  }
  animation = requestAnimationFrame(tick);
}
function reset(animate = true) {
  selected = null;
  expanded = false;
  detail.hidden = true;
  detail.replaceChildren();
  detail.classList.remove("expanded");
  document.body.classList.remove("plot-open");
  q("#dimensions").innerHTML = "";
  q("#legend").hidden = !legend;
  history.replaceState(null, "", location.pathname);
  renderPlots();
  transition(fitView(innerWidth, innerHeight), animate);
}
function zoom(mult, x = innerWidth / 2, y = innerHeight / 2) {
  cancelAnimationFrame(animation);
  const k = Math.max(0.15, Math.min(12, state.k * mult)),
    ratio = k / state.k;
  state = { k, x: x - (x - state.x) * ratio, y: y - (y - state.y) * ratio };
  apply();
}
view.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    zoom(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY);
  },
  { passive: false },
);
const pointers = new Map();
let drag = null,
  pinch = null,
  moved = false;
view.addEventListener("pointerdown", (e) => {
  if (e.button > 0) return;
  cancelAnimationFrame(animation);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  drag = { x: e.clientX, y: e.clientY, px: state.x, py: state.y };
  moved = false;
  q("#hover-tip").hidden = true;
  view.setPointerCapture(e.pointerId);
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = {
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      state: { ...state },
      cx: (a.x + b.x) / 2,
      cy: (a.y + b.y) / 2,
    };
  }
});
view.addEventListener("pointermove", (e) => {
  if (pointers.has(e.pointerId)) {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()],
        k = Math.max(
          0.15,
          Math.min(
            12,
            (pinch.state.k * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.distance,
          ),
        ),
        r = k / pinch.state.k;
      state = {
        k,
        x: (a.x + b.x) / 2 - (pinch.cx - pinch.state.x) * r,
        y: (a.y + b.y) / 2 - (pinch.cy - pinch.state.y) * r,
      };
      moved = true;
      apply();
    } else if (drag) {
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      state.x = drag.px + dx;
      state.y = drag.py + dy;
      apply();
    }
    return;
  }
  const el = e.target.closest("[data-plot]");
  if (el && !selected && e.pointerType === "mouse") {
    const p = plots.find((p) => p.id === +el.dataset.plot),
      tip = q("#hover-tip");
    tip.innerHTML =
      "<strong>Plot " +
      p.id +
      "<span>" +
      p.status +
      "</span></strong><small>" +
      fmt(p.area) +
      " ft²</small>";
    tip.style.left = Math.min(innerWidth - 185, e.clientX + 18) + "px";
    tip.style.top = Math.max(10, e.clientY - 65) + "px";
    tip.hidden = false;
  } else q("#hover-tip").hidden = true;
});
view.addEventListener("pointerup", (e) => {
  pointers.delete(e.pointerId);
  if (view.hasPointerCapture(e.pointerId))
    view.releasePointerCapture(e.pointerId);
  if (!moved) {
    const el = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest("[data-plot]");
    if (el) {
      const id = +el.dataset.plot;
      id === selected ? reset() : openPlot(id);
    } else if (selected) reset();
  }
  drag = null;
  pinch = null;
  if (pointers.size) {
    const a = [...pointers.values()][0];
    drag = { x: a.x, y: a.y, px: state.x, py: state.y };
  }
});
view.addEventListener("pointercancel", (e) => {
  pointers.delete(e.pointerId);
  drag = null;
  pinch = null;
});
view.addEventListener("pointerleave", () => (q("#hover-tip").hidden = true));
view.addEventListener("keydown", (e) => {
  const p = e.target.closest("[data-plot]");
  if (p && ["Enter", " "].includes(e.key)) {
    e.preventDefault();
    openPlot(+p.dataset.plot);
    return;
  }
  if (
    [
      "+",
      "=",
      "-",
      "Home",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
    ].includes(e.key)
  ) {
    e.preventDefault();
    cancelAnimationFrame(animation);
    if (e.key === "+" || e.key === "=") zoom(1.2);
    if (e.key === "-") zoom(0.8);
    if (e.key === "Home") reset();
    if (e.key === "ArrowUp") state.y -= 40;
    if (e.key === "ArrowDown") state.y += 40;
    if (e.key === "ArrowLeft") state.x -= 40;
    if (e.key === "ArrowRight") state.x += 40;
    apply();
  }
});
q("#home").onclick = () => reset();
q("#compass").onclick = () => reset();
function applyFilters() {
  qa("[data-status]").forEach((b) =>
    qa(".plot." + b.dataset.status).forEach((g) =>
      g.classList.toggle(
        "filtered",
        b.getAttribute("aria-pressed") === "false",
      ),
    ),
  );
}
q("#legend-toggle").onclick = () => {
  legend = !legend;
  document.body.classList.toggle("status-on", legend);
  q("#legend").hidden = !legend;
  q("#legend-toggle").setAttribute("aria-pressed", legend);
};
qa("[data-status]").forEach(
  (b) =>
    (b.onclick = () => {
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true");
      applyFilters();
    }),
);
const nearby = [
  ["Vankala Canal Road", "0 Mins", "Highway"],
  ["Sonsak Village Center", "3 Mins", "Other"],
  ["Ambheta Branch Post Office", "5 Mins", "Other"],
  ["Kim–Olpad Road", "8 Mins", "Highway"],
  ["Olpad City Center / Market", "15 Mins", "Mall / Market"],
  ["International Airport Road", "2 Mins", "Airport"],
];
function landmarks(limit = 6) {
  return (
    '<div class="landmarks">' +
    nearby
      .slice(0, limit)
      .map(
        ([name, time, cat]) =>
          '<a class="landmark" href="https://www.google.com/maps/search/?api=1&query=' +
          encodeURIComponent(name + " Surat Gujarat") +
          '" target="_blank" rel="noopener"><i>' +
          icon(cat === "Highway" ? "navigation" : "house") +
          "</i><div><strong>" +
          name +
          "</strong><small><b>" +
          time +
          "</b> · " +
          cat +
          "</small></div></a>",
      )
      .join("") +
    "</div>"
  );
}
function form(topic) {
  return (
    '<section class="enquiry"><h3>Interested? Connect Now</h3><form data-enquiry="' +
    topic +
    '"><label class="sr-only" for="enquiry-name">Your name</label><input id="enquiry-name" name="name" placeholder="Your Name" required maxlength="80" autocomplete="name"><div class="phone-field"><select name="code" aria-label="Country calling code"><option>IN +91</option><option>US +1</option><option>UK +44</option><option>AE +971</option></select><input name="phone" aria-label="Phone number" placeholder="Phone Number" type="tel" required maxlength="20" autocomplete="tel"></div><button class="action green full" type="submit">Continue on WhatsApp ↗</button><p class="fine">Review and send your enquiry in WhatsApp. Demonstration only; no plot reservation or lead storage.</p></form></section>'
  );
}
function wireForms(root) {
  root.querySelectorAll("[data-enquiry]").forEach(
    (f) =>
      (f.onsubmit = (e) => {
        e.preventDefault();
        const d = new FormData(f);
        location.assign(
          wa(
            "Hi Kapadiya & Sons, I’m " +
              d.get("name") +
              " (" +
              d.get("code") +
              " " +
              d.get("phone") +
              "). I explored " +
              f.dataset.enquiry +
              " in the PinYourSite demo. I’d like to discuss an interactive viewer for my project.",
          ),
        );
      }),
  );
}
function drawDimensions(p) {
  q("#dimensions").innerHTML = dimensions(p)
    .map(
      (d) =>
        '<g><path class="dimension-extension" d="M' +
        d.a.x +
        " " +
        d.a.y +
        "L" +
        d.u.x +
        " " +
        d.u.y +
        "M" +
        d.b.x +
        " " +
        d.b.y +
        "L" +
        d.v.x +
        " " +
        d.v.y +
        '"/><path class="dimension-line" d="M' +
        d.u.x +
        " " +
        d.u.y +
        "L" +
        d.v.x +
        " " +
        d.v.y +
        '"/><text class="dimension-label" x="' +
        d.mx +
        '" y="' +
        d.my +
        '" dominant-baseline="middle" text-anchor="middle" transform="rotate(' +
        d.angle +
        " " +
        d.mx +
        " " +
        d.my +
        ')">' +
        d.length.toFixed(2) +
        " ft</text></g>",
    )
    .join("");
}
function openPlot(id, updateUrl = true) {
  const p = plots.find((p) => p.id === id);
  if (!p) return;
  panel.close();
  selected = id;
  expanded = false;
  document.body.classList.add("plot-open");
  q("#legend").hidden = true;
  q("#hover-tip").hidden = true;
  renderPlots();
  drawDimensions(p);
  const dims = dimensions(p),
    badge = '<span class="status ' + p.status + '">' + p.status + "</span>";
  detail.innerHTML =
    '<button class="round plot-close-mobile" data-close-plot aria-label="Close plot">' +
    icon("x") +
    '</button><div class="compact-plot"><div><strong>Plot ' +
    id +
    "</strong>" +
    badge +
    "<small>" +
    fmt(p.area) +
    ' ft²</small></div><button class="action" id="expand-plot">View Details ↗</button></div><header class="plot-header"><h2>Plot ' +
    id +
    "</h2>" +
    badge +
    '<span class="spacer"></span><button class="round" id="share-plot" aria-label="Share plot">' +
    icon("share") +
    '</button><button class="round" data-close-plot aria-label="Close plot">' +
    icon("x") +
    '</button></header><div class="plot-body"><div class="stats"><div class="stat"><span>Total Area</span><strong>' +
    fmt(p.area) +
    " ft²</strong><small>" +
    fmt(p.area / 9) +
    ' Var</small></div><div class="stat dim"><span>Dimensions</span><strong>' +
    dims[0].length.toFixed(2) +
    " ft × " +
    dims[1].length.toFixed(2) +
    " ft</strong></div></div>" +
    landmarks(3) +
    '<p class="fine">Illustrative dimensions calculated from the demo plan. Not a site survey or live availability.</p></div><div class="plot-enquiry">' +
    form("Plot " + id) +
    "</div>";
  detail.hidden = false;
  detail.classList.remove("expanded");
  detail
    .querySelectorAll("[data-close-plot]")
    .forEach((b) => (b.onclick = () => reset()));
  q("#expand-plot").onclick = () => {
    expanded = true;
    detail.classList.add("expanded");
  };
  q("#share-plot").onclick = () => share(id);
  wireForms(detail);
  transition(plotView(p, innerWidth, innerHeight));
  if (updateUrl)
    history.pushState({ plot: id }, "", location.pathname + "?plot=" + id);
}
function openPanel(title, content, type) {
  returnFocus = document.activeElement;
  panelType = type;
  q("#panel-title").textContent = title;
  body.innerHTML = content;
  panel.className = type === "gallery" ? "gallery-panel" : "";
  if (!panel.open) panel.showModal();
  body.scrollTop = 0;
  qa("[data-panel]").forEach((b) =>
    b.classList.toggle("active", b.dataset.panel === type),
  );
}
function searchPanel() {
  openPanel(
    "Plot Search",
    '<input id="plot-search" type="search" inputmode="numeric" aria-label="Search plot number" placeholder="Type plot number (e.g. 102)..."><div class="size-label">FILTER BY SIZE</div><div class="size-filters"><button class="active" data-size="all">All Plots</button><button data-size="small">&lt; 100 yd²</button><button data-size="medium">100–200 yd²</button><button data-size="large">200+ yd²</button></div><div id="search-results"></div>',
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
          .map(
            (p) =>
              '<button class="search-result" data-result="' +
              p.id +
              '"><strong># ' +
              p.id +
              "</strong><small>" +
              fmt(p.area) +
              ' ft²</small><span class="status ' +
              p.status +
              '">' +
              p.status +
              "</span></button>",
          )
          .join("")
      : "<p>No matching plots. Try another number or size.</p>";
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
    if (b) openPlot(+b.dataset.result);
  };
  render();
}
function detailsPanel() {
  openPanel(
    "Project Overview",
    '<div class="demo-info">PINYOURSITE BY KAPADIYA & SONS · DEMONSTRATION</div><h3>About the Project</h3><p>A complete neighbourhood, ready to explore. This demonstration brings plot information, project visuals and location context into one interactive experience.</p><h3>Site Location</h3><p>Vankala / Jahangirpura, Surat, Gujarat<br>Reference location for this demonstration.</p><div class="stats"><div class="stat"><span>Total Plot Area</span><strong>' +
      fmt(plots.reduce((s, p) => s + p.area, 0) / 9) +
      '</strong><small>Square yards</small></div><div class="stat"><span>Total Plots</span><strong>63</strong><small>Demonstration plots</small></div></div><h3>Amenities</h3><div class="amenities">' +
      [
        "Landscaped garden",
        "Children’s play area",
        "Gazebo seating",
        "Box cricket",
        "Jogging track",
        "Entrance gate",
        "Security cabin",
        "Street lighting",
        "Internal roads",
        "Drainage",
        "Underground power",
        "CCTV",
      ]
        .map((x) => "<span>" + icon("tree") + x + "</span>")
        .join("") +
      '</div><div class="contact-list"><a href="https://www.kapadiya.tech" target="_blank" rel="noopener">Kapadiya & Sons ↗</a><a href="tel:+917575807403">+91 75758 07403 ↗</a><a href="mailto:smitkapadiya.work@gmail.com">smitkapadiya.work@gmail.com ↗</a></div>' +
      form("PinYourSite") +
      `<h3>Project Experience By</h3><p>Kapadiya & Sons<br>PinYourSite Plots<br>Complete 3D informational web view and project details.</p><div class="contact-list"><a href="${wa("Hi Smit! Could we discuss pricing and features for PinYourSite Plots for my development?")}" target="_blank" rel="noopener">Contact for pricing and more ↗</a></div>`,
    "details",
  );
  wireForms(body);
}
function nearbyPanel() {
  openPanel(
    "Nearby Landmarks",
    '<p class="demo-info">Reference project landmarks and illustrative travel times. Open a place for current routes.</p>' +
      landmarks(),
    "nearby",
  );
}
function brochurePanel() {
  openPanel(
    "Project Catalogue",
    '<div class="catalogue">' +
      icon("file") +
      '<h3>PinYourSite</h3><p>Your project. Every detail.<br>By Kapadiya & Sons.</p><small>DEMONSTRATION CATALOGUE · PDF</small></div><a class="action full" href="/pinyoursite-demo.pdf" download>' +
      icon("download") +
      'Download Brochure</a><p>Explore the viewer, its features and Architect’s Cut.</p><a class="action green full" href="' +
      wa(
        "Hi Kapadiya & Sons! I’d like to know more about PinYourSite and Architect’s Cut.",
      ) +
      '" target="_blank" rel="noopener">Enquire on WhatsApp ↗</a>',
    "brochure",
  );
}
const names = [
  "The complete neighbourhood",
  "An aerial perspective",
  "The arrival",
  "Poolside living",
  "The streetscape",
  "Garden moments",
  "A place to pause",
  "Inside the neighbourhood",
  "Contemporary living",
  "At your doorstep",
  "Homes with character",
  "The evening view",
  "A welcoming entrance",
  "A connected community",
];
const imagePath = (i) => "/gallery/" + String(i + 1).padStart(2, "0") + ".webp";
let imageIndex = 0;
function galleryPanel() {
  openPanel(
    "Project Gallery",
    '<div class="gallery-grid">' +
      names
        .map(
          (n, i) =>
            '<button data-gallery="' +
            i +
            '" aria-label="View ' +
            n +
            '"><img src="' +
            imagePath(i) +
            '" loading="lazy" alt="' +
            n +
            ' — reference project visual"><span>' +
            String(i + 1).padStart(2, "0") +
            " / " +
            n +
            "</span></button>",
        )
        .join("") +
      '</div><p class="fine">Reference project visualisations. Demonstration imagery, not completed Kapadiya developments.</p>',
    "gallery",
  );
  qa("[data-gallery]").forEach(
    (b) => (b.onclick = () => openImage(+b.dataset.gallery)),
  );
}
function openImage(index) {
  imageIndex = (index + names.length) % names.length;
  q("#lightbox-image").src = imagePath(imageIndex);
  q("#lightbox-image").alt = names[imageIndex] + " — reference project visual";
  q("#image-download").href = imagePath(imageIndex);
  q("#image-count").textContent =
    imageIndex + 1 + " / " + names.length + " — " + names[imageIndex];
  q(".lightbox-stage").classList.remove("zoomed");
  q("#image-thumbs").innerHTML = names
    .map(
      (n, i) =>
        '<button data-thumb="' +
        i +
        '" aria-label="View ' +
        n +
        '" aria-pressed="' +
        (i === imageIndex) +
        '"><img src="' +
        imagePath(i) +
        '" alt=""></button>',
    )
    .join("");
  qa("[data-thumb]").forEach(
    (b) => (b.onclick = () => openImage(+b.dataset.thumb)),
  );
  if (!q("#lightbox").open) q("#lightbox").showModal();
}
q("#image-close").onclick = () => q("#lightbox").close();
q("#image-next").onclick = () => openImage(imageIndex + 1);
q("#image-prev").onclick = () => openImage(imageIndex - 1);
q("#image-zoom").onclick = () =>
  q(".lightbox-stage").classList.toggle("zoomed");
q("#image-full").onclick = async () => {
  try {
    document.fullscreenElement
      ? await document.exitFullscreen()
      : await q("#lightbox").requestFullscreen();
  } catch {
    toast("Fullscreen is unavailable in this browser.");
  }
};
let map,
  overlay,
  overlayVisible = true;
async function gpsPanel() {
  panel.close();
  q("#gps-view").hidden = false;
  if (map) {
    map.invalidateSize();
    return;
  }
  try {
    const L = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
    const center = [21.25548, 72.76072];
    map = L.map("satellite-map", {
      zoomControl: false,
      minZoom: 12,
      maxZoom: 22,
      zoomSnap: 0.1,
      zoomDelta: 0.5,
    }).setView(center, innerWidth < 1024 ? 18.2 : 19.2);
    const tiles = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxNativeZoom: 19,
        maxZoom: 22,
        attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
      },
    ).addTo(map);
    tiles.on("tileerror", () => (q("#map-error").hidden = false));
    tiles.on("load", () => (q("#map-error").hidden = true));
    overlay = document.createElement("img");
    overlay.src = "/satellite-overlay.webp";
    overlay.className = "satellite-overlay";
    overlay.style.position = "absolute";
    map.getPanes().overlayPane.append(overlay);
    function position() {
      const c = map.latLngToLayerPoint(center),
        n = map.latLngToLayerPoint([center[0] + 0.001, center[1]]),
        pixels = Math.abs(c.y - n.y) / 110.54,
        w = 190 * pixels,
        h = w * (overlay.naturalHeight / overlay.naturalWidth || 0.5625);
      overlay.style.width = w + "px";
      overlay.style.height = h + "px";
      overlay.style.left = c.x - w / 2 + "px";
      overlay.style.top = c.y - h / 2 + "px";
      overlay.style.transform = "rotate(-101deg)";
    }
    overlay.onload = position;
    map.on("move zoom viewreset", position);
    position();
    L.marker(center, {
      icon: L.divIcon({
        className: "gps-project-label",
        html: "PinYourSite ↗",
        iconSize: [105, 38],
        iconAnchor: [52, 100],
      }),
    })
      .addTo(map)
      .on("click", closeGps);
    q("#gps-home").onclick = () =>
      map.flyTo(center, innerWidth < 1024 ? 18.2 : 19.2, { duration: 1 });
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
  const url = location.origin + location.pathname + (id ? "?plot=" + id : "");
  if (navigator.share) {
    try {
      await navigator.share({
        title: "PinYourSite by Kapadiya & Sons",
        text: id
          ? "Explore demonstration Plot " + id
          : "Explore our property demonstration",
        url,
      });
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast("Link copied.");
  } catch {
    openPanel(
      "Share Project",
      '<label for="share-url">Copy this link</label><input id="share-url" readonly value="' +
        url +
        '">',
      "share",
    );
    q("#share-url").select();
  }
}
q("#share").onclick = () => share();
const panels = {
  search: searchPanel,
  details: detailsPanel,
  gallery: galleryPanel,
  nearby: nearbyPanel,
  gps: gpsPanel,
  brochure: brochurePanel,
};
qa("[data-panel]").forEach(
  (b) => (b.onclick = () => panels[b.dataset.panel]()),
);
q("#close-panel").onclick = () => panel.close();
panel.addEventListener("click", (e) => {
  if (e.target === panel) {
    const r = panel.getBoundingClientRect();
    if (e.clientX < r.left || e.clientY < r.top) panel.close();
  }
});
panel.addEventListener("close", () => {
  panelType = null;
  qa("[data-panel]").forEach((b) => b.classList.remove("active"));
  returnFocus?.focus();
});
document.addEventListener("keydown", (e) => {
  if (q("#lightbox").open && ["ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
    openImage(imageIndex + (e.key === "ArrowRight" ? 1 : -1));
  }
  if (e.key === "Escape" && !q("#gps-view").hidden) closeGps();
  else if (
    e.key === "Escape" &&
    selected &&
    !panel.open &&
    !q("#lightbox").open
  )
    reset();
});
window.addEventListener("resize", () =>
  transition(
    selected
      ? plotView(
          plots.find((p) => p.id === selected),
          innerWidth,
          innerHeight,
        )
      : fitView(innerWidth, innerHeight),
    false,
  ),
);
window.addEventListener("popstate", () => {
  const id = +(
    new URLSearchParams(location.search).get("plot") ||
    location.hash.replace("#plot-", "")
  );
  id ? openPlot(id, false) : reset();
});
renderPlots();
apply();
const initial = +(
  new URLSearchParams(location.search).get("plot") ||
  location.hash.replace("#plot-", "")
);
if (initial) openPlot(initial, false);
