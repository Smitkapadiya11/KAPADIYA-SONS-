import "./green.css";
import "./next.css";
import "./signal.css";
import { services as originalServices } from "./services.js";
import { offers, terms, servicePricing } from "./offers.js";
const select = (s) => document.querySelector(s),
  all = (s) => [...document.querySelectorAll(s)];
const wa = (message) =>
  "https://wa.me/917575807403?text=" + encodeURIComponent(message);
const services = [
  ...originalServices,
  {
    id: "pinyoursite",
    category: "systems",
    name: "PinYourSite property experiences",
    desc: "An interactive world for every property. Search plots, explore details and start a conversation.",
    fit: "Developers, architects and real estate teams.",
    deliver:
      "A complete 3D informational web view and all required project information.",
    needs:
      "Approved masterplan, plot dimensions, project details, location and gallery assets.",
    process:
      "Map your project, build the interactive view, review details and launch.",
    scope: servicePricing("property"),
  },
  {
    id: "music",
    category: "content",
    name: "AI music videos",
    desc: "Ultra-realistic visual worlds for your sound, from first beat to final frame.",
    fit: "Artists, labels and creators.",
    deliver: "3 full music videos, 2 minutes each.",
    needs:
      "Music you have permission to use, visual references and an approved concept.",
    process: "Align the story, develop visual direction, produce and review.",
    scope: servicePricing("music"),
  },
  {
    id: "short-film",
    category: "content",
    name: "AI short films",
    desc: "Ambitious worlds and human stories, crafted into cinematic short films.",
    fit: "Storytellers, brands and independent filmmakers.",
    deliver: "2 ultra-realistic short films, 5 minutes each.",
    needs: "An approved story, character direction, language and references.",
    process: "Develop the script, plan the scenes, produce and review.",
    scope: servicePricing("film"),
  },
];
services.find((s) => s.id === "film").scope = servicePricing("ugc");
services.find((s) => s.id === "images").deliver =
  "AI image concepts and agreed ad formats. Lion’s Cut includes 20 campaign images. Standalone image work is scoped to your brief.";
services.find((s) => s.id === "reels").scope =
  "Cat’s Cut: ₹25,999 for 30 videos in 30 days, up to 30 seconds each. Other social content, publishing and account management are scoped separately.";
const serviceArt = {
  avatar: "avatar-studio",
  ugc: "ugc-creator",
  film: "cinematic-product",
  reels: "services/reels-600",
  images: "services/images-600",
  automation: "services/automation-600",
  whatsapp: "services/whatsapp-600",
  websites: "services/websites-600",
  apps: "services/apps-600",
  crm: "services/crm-600",
  pinyoursite: "property-aerial",
  music: "cinematic-product",
  "short-film": "light/film-600",
};
function renderServices(filter = "all") {
  select("#service-grid").innerHTML = services
    .filter((s) => filter === "all" || s.category === filter)
    .map(
      (s) =>
        '<button class="service-row" data-service="' +
        s.id +
        '"><div class="service-visual"><img src="/images/' +
        (serviceArt[s.id] || "ugc-creator") +
        '.webp" alt="' +
        s.name +
        ' — illustrative creative concept" loading="lazy"><span class="service-number">' +
        String(services.indexOf(s) + 1).padStart(2, "0") +
        '</span><span class="service-arrow" aria-hidden="true">↗</span></div><div class="service-info"><small>' +
        (s.category === "content"
          ? "CONTENT & CREATIVE"
          : "TECHNOLOGY & SYSTEMS") +
        "</small><strong>" +
        s.name +
        '</strong><span class="service-description">' +
        s.desc +
        '</span><span class="service-explore">EXPLORE CAPABILITY <b>↗</b></span></div></button>',
    )
    .join("");
}
renderServices();
const reel = select('#service-grid');
let reelFrame = 0;
function reelPosition() {
  const cards = [...reel.children];
  const index = cards.reduce((best, card, i) => Math.abs(card.offsetLeft - reel.scrollLeft) < Math.abs(cards[best].offsetLeft - reel.scrollLeft) ? i : best, 0);
  select('#reel-count').textContent = String(index + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
  select('#reel-prev').disabled = index === 0;
  select('#reel-next').disabled = index === cards.length - 1;
  return index;
}
function moveReel(step) {
  const cards = [...reel.children];
  const index = Math.max(0, Math.min(cards.length - 1, reelPosition() + step));
  reel.scrollTo({left: cards[index].offsetLeft, behavior: document.body.classList.contains('motion-paused') ? 'instant' : 'smooth'});
}
select('#reel-prev').addEventListener('click', () => moveReel(-1));
select('#reel-next').addEventListener('click', () => moveReel(1));
reel.addEventListener('scroll', () => { cancelAnimationFrame(reelFrame); reelFrame = requestAnimationFrame(reelPosition); }, {passive:true});
reel.addEventListener('keydown', e => { if(e.key === 'ArrowRight' || e.key === 'ArrowLeft') {e.preventDefault();moveReel(e.key === 'ArrowRight' ? 1 : -1);} });
new MutationObserver(() => {reel.scrollTo({left:0,behavior:'instant'});reelPosition();}).observe(reel,{childList:true});
reelPosition();
const dialog = select("#service-dialog");
let returnFocus;
function showDialog(content) {
  returnFocus = document.activeElement;
  select("#dialog-content").innerHTML = content;
  dialog.setAttribute("aria-labelledby", "detail-title");
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add("modal-open");
}
function openService(id) {
  const s = services.find((s) => s.id === id);
  if (!s) return;
  const fields = [
    ["Who it’s for", s.fit],
    ["What we can deliver", s.deliver],
    ["What we need from you", s.needs],
    ["How the work happens", s.process],
    ["Scope & pricing", s.scope],
  ];
  showDialog(
    '<img class="dialog-service-image" src="/images/' +
      (serviceArt[id] || "ugc-creator") +
      '.webp" alt="' +
      s.name +
      ' creative concept"><span class="eyebrow">KAPADIYA & SONS / SERVICE EXPLORER</span><h2 id="detail-title">' +
      s.name +
      "</h2><p>" +
      s.desc +
      "</p>" +
      fields
        .map(([title, text]) => "<h3>" + title + "</h3><p>" + text + "</p>")
        .join("") +
      '<a class="button dark" href="' +
      wa(
        "Hi Smit! I’d like to discuss " +
          s.name +
          ". My business: ___. My goal: ___.",
      ) +
      '" target="_blank" rel="noopener noreferrer">Discuss this project ↗</a>' +
      (id === "pinyoursite"
        ? '<a class="button lime" href="https://pinyoursite-kapadiya.vercel.app" target="_blank" rel="noopener noreferrer">Explore plots ↗</a> <a class="button lime" href="/apartments/index.html">Explore apartments ↗</a>'
        : "") +
      '<p class="dialog-foot">Scope, timeline and review terms are agreed before production. AI realism depends on the concept and references.</p>',
  );
}
function route() {
  const m = location.hash.match(/^#service\/(.+)$/);
  if (m) openService(m[1]);
}
document.addEventListener("click", (e) => {
  const service = e.target.closest("[data-service]");
  if (service) {
    if (location.hash === "#service/" + service.dataset.service)
      openService(service.dataset.service);
    else location.hash = "service/" + service.dataset.service;
  }
  const f = e.target.closest("[data-filter]");
  if (f) {
    all("[data-filter]").forEach((b) => {
      b.classList.toggle("active", b === f);
      b.setAttribute("aria-pressed", String(b === f));
    });
    renderServices(f.dataset.filter);
  }
});
window.addEventListener("hashchange", route);
route();
select(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  if (location.hash.startsWith("#service/"))
    history.replaceState(null, "", "#services");
  returnFocus?.focus();
});
select("#privacy-open").addEventListener("click", () =>
  showDialog(
    '<span class="eyebrow">CLEAR FROM THE START</span><h2 id="detail-title">Privacy & project terms</h2><h3>Your information</h3><p>This website does not store form submissions, collect payments or use analytics cookies. The brief builder prepares a WhatsApp message for you to review and send. WhatsApp and our hosting provider process information under their own policies; hosting may retain technical access logs.</p><h3>When you contact us</h3><p>Information you send by WhatsApp or email is used to discuss your enquiry and deliver agreed work. Contact smitkapadiya.work@gmail.com for privacy questions.</p><h3>Project scope</h3><p>' +
      terms +
      "</p><h3>Creative permissions</h3><p>Human clones require the depicted person’s permission. Supply only assets you have rights to use. AI presenters are not real customer endorsements. Product claims need approval. Results, reach and sales are not guaranteed.</p>",
  ),
);
const menu = select(".menu-button"),
  nav = select("#navigation");
function closeMenu() {
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Open menu");
  menu.textContent = "☰";
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  nav.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu.textContent = open ? "✕" : "☰";
});
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
offers.forEach((o) =>
  select("#brief-service").add(new Option(o.name + " — " + o.label, o.name)),
);
services.forEach((s) =>
  select("#brief-service").add(new Option(s.name, s.name)),
);
select("#brief-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(e.currentTarget);
  location.assign(
    wa(
      "Hi Smit! I’m " +
        d.get("name") +
        ", from " +
        d.get("business") +
        ".\n\nI’m interested in: " +
        d.get("service") +
        ".\n\nMy brief: " +
        d.get("context") +
        "\n\nPlease share the next steps with Kapadiya & Sons.",
    ),
  );
});
select("#year").textContent = new Date().getFullYear();
const video = select("#ugc-player");
const videos = {
  latest: { title: "The latest cut", label: "01 / LATEST RELEASE" },
  captioned: { title: "Words that move", label: "02 / CREATOR STORIES" },
  story: { title: "A little more story", label: "03 / LONGER STORIES" },
};
all("[data-video]").forEach((button) =>
  button.addEventListener("click", () => {
    const id = button.dataset.video;
    video.pause();
    video.src = "/media/ugc-" + id + ".mp4";
    video.poster = "/media/ugc-" + id + ".webp";
    video.setAttribute("aria-label", videos[id].title + " — UGC AI ad film");
    select("#video-title").textContent = videos[id].title;
    select("#video-label").textContent = videos[id].label;
    all("[data-video]").forEach((b) => {
      b.classList.toggle("active", b === button);
      b.setAttribute("aria-pressed", String(b === button));
    });
    select(".media-note").textContent =
      "Tap play for sound · AI-generated creative showcase";
    video.load();
    video.play().catch(() => {});
  }),
);
video.addEventListener("error", () => {
  select(".media-note").textContent =
    "Could not load this film. Please try another film or refresh.";
});
all("[data-video]").forEach((button) =>
  button.addEventListener("click", () => {
    if (innerWidth < 801)
      video.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      });
  }),
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) video.pause();
});
new IntersectionObserver(
  (entries) => {
    if (!entries[0].isIntersecting) video.pause();
  },
  { threshold: 0 },
).observe(video);

// Keep the two flagship offers open; the remaining cuts disclose their full scope.
document.querySelectorAll('.plan:not(.featured)').forEach(plan=>{
  const details=document.createElement('details');
  details.className='plan compact-cut';details.id=plan.id;
  const summary=document.createElement('summary');
  const title=plan.querySelector('h3'),price=plan.querySelector('.plan-price');
  summary.append(title,price);
  const body=document.createElement('div');body.className='cut-details';
  while(plan.firstChild)body.append(plan.firstChild);
  details.append(summary,body);plan.replaceWith(details);
});
import "./signal-motion.js";
import './journey.js';

