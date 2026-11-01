/*!
 * KAPADIYA & SONS — Motion Edition (Next) · core
 * Scroll-driven vector animation layer for kapadiya.tech
 *
 * Engine: GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG, MotionPath, ScrambleText) + Lenis smooth scroll.
 * The core receives its libraries as `deps`, so the same file runs from npm (kapadiya-motion.js)
 * or from CDN globals (preview / drop-in bundle).
 *
 * Rules this file follows so it never fights the site's own JS (green.js):
 *  - It never animates .vector-flower, .manifesto-vector (element transform) or .scroll-progress — green.js owns those.
 *  - It neutralises the old `.reveal` IntersectionObserver fade via CSS (html.km-on) and replaces it.
 *  - It re-animates #service-grid rows whenever green.js re-renders them (filter tabs).
 *  - It respects prefers-reduced-motion and the site's own "Pause motion" button (body.motion-paused):
 *    everything is reverted to the plain static page and rebuilt on resume.
 */
import {
  flowerOutline,
  flowerFilled,
  swash,
  viewfinder,
  pin,
  pinRoute,
  scan,
  flight,
  seam,
  serviceIcons,
  serviceIconFallback,
} from "./vectors.js";

export function createKapadiyaMotion(deps, userOptions = {}) {
  const {
    gsap,
    ScrollTrigger,
    SplitText,
    DrawSVGPlugin,
    MotionPathPlugin,
    ScrambleTextPlugin,
    Lenis,
  } = deps;
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    DrawSVGPlugin,
    MotionPathPlugin,
    ScrambleTextPlugin,
  );

  const opts = {
    preloader: false, // first visit per browser session
    smoothScroll: true, // Lenis
    cursor: false, // custom cursor on fine pointers
    rail: true, // vector section rail (desktop)
    headerOffset: 90, // px kept clear under the sticky header when jumping to anchors
    debug: false,
    ...userOptions,
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const body = document.body;
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const mqFine = matchMedia("(hover: hover) and (pointer: fine)");
  const isDesktop = () => innerWidth > 1024;
  const log = (...a) => opts.debug && console.log("[km]", ...a);

  let ctx = null; // gsap.context holding every tween / ScrollTrigger / SplitText
  let mm = null; // gsap.matchMedia for breakpoint-specific motion
  let lenis = null;
  let running = false;
  let cleanups = []; // DOM listeners, observers, injected nodes, text restores

  const onCleanup = (fn) => cleanups.push(fn);
  const listen = (el, type, fn, o) => {
    if (!el) return;
    el.addEventListener(type, fn, o);
    onCleanup(() => el.removeEventListener(type, fn, o));
  };
  const inject = (parent, markup, where = "beforeend") => {
    if (!parent) return null;
    const tpl = document.createElement("template");
    tpl.innerHTML = markup.trim();
    const nodes = [...tpl.content.childNodes];
    if (where === "afterbegin") parent.prepend(...nodes);
    else parent.append(...nodes);
    onCleanup(() => nodes.forEach((n) => n.remove()));
    return nodes.length === 1 ? nodes[0] : nodes;
  };
  const once = (trigger, start = "top 85%") => ({ trigger, start, once: true });

  /* ------------------------------------------------------------------ */
  /*  SMOOTH SCROLL                                                      */
  /* ------------------------------------------------------------------ */
  function setupLenis() {
    if (!opts.smoothScroll || !Lenis) return;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      prevent: (node) =>
        !!(
          node &&
          node.closest &&
          node.closest("dialog, [data-lenis-prevent]")
        ),
    });
    const raf = (t) => lenis && lenis.raf(t * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    onCleanup(() => {
      gsap.ticker.remove(raf);
      lenis && lenis.destroy();
      lenis = null;
      gsap.ticker.lagSmoothing(500, 33);
    });

    // Smooth in-page anchors (keeps #service/... routes for green.js untouched)
    listen(document, "click", (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (
        !a ||
        a.classList.contains("skip") ||
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey
      )
        return;
      const hash = a.getAttribute("href");
      if (hash.startsWith("#service/")) return;
      if (hash === "#" || hash === "#top") {
        e.preventDefault();
        lenis.scrollTo(0, { duration: 1.6 });
        return;
      }
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -opts.headerOffset, duration: 1.4 });
      history.pushState(null, "", hash);
    });

    // Freeze page scroll while the service dialog is open (green.js toggles body.modal-open)
    const mo = new MutationObserver(() => {
      if (!lenis) return;
      body.classList.contains("modal-open") ? lenis.stop() : lenis.start();
    });
    mo.observe(body, { attributes: true, attributeFilter: ["class"] });
    onCleanup(() => mo.disconnect());
  }

  /* ------------------------------------------------------------------ */
  /*  PRELOADER (landing)                                                */
  /* ------------------------------------------------------------------ */
  function preloader() {
    let seen = false;
    try {
      seen = sessionStorage.getItem("km-seen") === "1";
    } catch (e) {
      /* private mode */
    }
    if (!opts.preloader || seen || scrollY > 200 || !$(".hero")) {
      html.classList.remove("km-preload");
      return Promise.resolve();
    }
    try {
      sessionStorage.setItem("km-seen", "1");
    } catch (e) {
      /* ignore */
    }
    const el = inject(
      body,
      `
      <div class="km-pre" aria-hidden="true">
        <div class="km-pre__wipe"></div>
        <div class="km-pre__inner">
          ${flowerFilled()}
          <div class="km-pre__word"><span>KAPADIYA</span> <b>&amp; SONS</b></div>
        </div>
        <div class="km-pre__count"><span>000</span>%</div>
        <div class="km-pre__meta">SURAT, INDIA ↗ EVERYWHERE</div>
      </div>`,
    );
    html.classList.remove("km-preload");
    lenis && lenis.stop();
    const petals = $$(".km-pre__petal", el);
    const word = new SplitText($(".km-pre__word", el), { type: "chars" });
    const counter = $(".km-pre__count span", el);
    const n = { v: 0 };
    return new Promise((resolve) => {
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          word.revert();
          el.remove();
          lenis && lenis.start();
          resolve();
        },
      });
      tl.from(petals, {
        drawSVG: "0%",
        duration: 1.1,
        stagger: 0.05,
        ease: "power2.inOut",
      })
        .to(
          n,
          {
            v: 100,
            duration: 1.9,
            ease: "power2.inOut",
            onUpdate: () => {
              counter.textContent = String(Math.round(n.v)).padStart(3, "0");
            },
          },
          0,
        )
        .to(
          petals,
          {
            attr: { "fill-opacity": 1 },
            duration: 0.7,
            stagger: 0.03,
            ease: "power1.out",
          },
          0.75,
        )
        .from(
          ".km-pre__core, .km-pre__dot",
          {
            scale: 0,
            svgOrigin: "300 300",
            duration: 0.8,
            ease: "back.out(2.2)",
          },
          0.9,
        )
        .from(
          word.chars,
          { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.035 },
          0.6,
        )
        .to(
          ".km-pre__flower",
          {
            rotation: 120,
            scale: 1.08,
            svgOrigin: "300 300",
            duration: 1.6,
            ease: "power3.inOut",
          },
          0.4,
        )
        .to(
          ".km-pre__inner",
          {
            scale: 0.6,
            opacity: 0,
            filter: "blur(10px)",
            duration: 0.6,
            ease: "power3.in",
          },
          2.05,
        )
        .to(
          ".km-pre__count, .km-pre__meta",
          { opacity: 0, y: -10, duration: 0.3 },
          2.05,
        )
        .to(
          el,
          {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 0.9,
            ease: "expo.inOut",
          },
          2.3,
        )
        .fromTo(
          ".km-pre__wipe",
          { yPercent: 0 },
          { yPercent: -100, duration: 0.9, ease: "expo.inOut" },
          2.38,
        );
    });
  }

  /* ------------------------------------------------------------------ */
  /*  HEADER · RAIL · CURSOR · MAGNETIC                                  */
  /* ------------------------------------------------------------------ */
  function header() {
    const h = $(".header");
    if (!h) return;
    h.classList.add("km-header");
    onCleanup(() => h.classList.remove("km-header", "km-scrolled"));
    let hidden = false;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        h.classList.toggle("km-scrolled", y > 40);
        const menuOpen = !!$("#navigation.open");
        const shouldHide =
          y > innerHeight * 0.7 && self.direction === 1 && !menuOpen;
        if (shouldHide !== hidden) {
          hidden = shouldHide;
          gsap.to(h, {
            yPercent: hidden ? -105 : 0,
            duration: 0.5,
            ease: hidden ? "power3.in" : "expo.out",
            overwrite: "auto",
          });
        }
      },
    });
    gsap.from(h.children, {
      y: -30,
      opacity: 0,
      duration: 1,
      stagger: 0.07,
      ease: "expo.out",
      delay: 0.1,
    });
  }

  // Is a section's background light? (rail + cursor contrast)
  function isLight(el) {
    let n = el,
      bg = "rgba(0, 0, 0, 0)";
    while (n && n !== document.documentElement) {
      bg = getComputedStyle(n).backgroundColor;
      if (!/rgba\(.*,\s*0\)$/.test(bg) && bg !== "transparent") break;
      n = n.parentElement;
    }
    const m = bg.match(/\d+(\.\d+)?/g);
    if (!m) return false;
    const [r, g, b] = m.map(Number);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6;
  }

  function rail() {
    if (!opts.rail) return;
    const defs = [
      [".hero", "Intro"],
      ["#studio", "Films"],
      ["#pinyoursite", "PinYourSite"],
      ["#avatar", "Avatar"],
      ["#services", "Services"],
      ["#plans", "The cuts"],
      ["#about", "Founder"],
      ["#brief", "Brief"],
    ];
    let secs = defs.map(([s, l]) => [$(s), l]).filter(([el]) => el);
    // Other pages: use any section with data-km-label or an id
    if (secs.length < 3)
      secs = $$("main section[id], main section[data-km-label]").map((el) => [
        el,
        el.dataset.kmLabel || el.id.replace(/-/g, " "),
      ]);
    if (secs.length < 2) return;
    const r = inject(
      body,
      `
      <div class="km-rail" aria-hidden="true">
        <div class="km-rail__track"><div class="km-rail__fill"></div></div>
        <div class="km-rail__label">01 · ${secs[0][1]}</div>
        <ol>${secs.map(([, l], i) => `<li data-i="${i}"><i></i><span>${String(i + 1).padStart(2, "0")} · ${l}</span></li>`).join("")}</ol>
      </div>`,
    );
    const items = $$("li", r);
    const railLabel = $(".km-rail__label", r);
    let activeIdx = 0;
    gsap.fromTo(
      $(".km-rail__fill", r),
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      },
    );
    gsap.from(r, {
      opacity: 0,
      x: 30,
      duration: 1,
      delay: 0.6,
      ease: "expo.out",
    });
    secs.forEach(([el], i) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (!self.isActive || activeIdx === i) return;
          activeIdx = i;
          items.forEach((li, j) => li.classList.toggle("is-active", j === i));
          r.classList.toggle("is-light", isLight(secs[i][0]));
          gsap.to(railLabel, {
            duration: 0.8,
            scrambleText: {
              text: `${String(i + 1).padStart(2, "0")} · ${secs[i][1]}`,
              chars: "upperCase",
              speed: 0.6,
            },
            overwrite: true,
          });
        },
      });
    });
    items.forEach((li, i) =>
      listen(li, "click", () => {
        const el = secs[i][0];
        lenis
          ? lenis.scrollTo(el, {
              offset: i === 0 ? 0 : -opts.headerOffset,
              duration: 1.5,
            })
          : el.scrollIntoView({ behavior: "smooth" });
      }),
    );
  }

  function cursor() {
    if (!opts.cursor || !mqFine.matches) return;
    const c = inject(
      body,
      '<div class="km-cursor" aria-hidden="true"><div class="km-cursor__ring"></div><div class="km-cursor__dot"></div><div class="km-cursor__label"></div></div>',
    );
    html.classList.add("km-has-cursor");
    onCleanup(() => html.classList.remove("km-has-cursor"));
    const ring = $(".km-cursor__ring", c),
      dot = $(".km-cursor__dot", c),
      label = $(".km-cursor__label", c);
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" }),
      ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    const dx = gsap.quickTo(dot, "x", { duration: 0.08 }),
      dy = gsap.quickTo(dot, "y", { duration: 0.08 });
    const lx = gsap.quickTo(label, "x", { duration: 0.3, ease: "power3" }),
      ly = gsap.quickTo(label, "y", { duration: 0.3, ease: "power3" });
    const labels = [
      ["[data-cursor]", null],
      [".film-choice", "Play"],
      ["video", "Watch"],
      [".map-preview", "Explore"],
      [".service-row", "Open"],
      [".plan", "Choose"],
      [".latest-peek", "Watch"],
      [".founder-photo", "Hello"],
    ];
    listen(
      window,
      "pointermove",
      (e) => {
        rx(e.clientX);
        ry(e.clientY);
        dx(e.clientX);
        dy(e.clientY);
        lx(e.clientX);
        ly(e.clientY);
        c.classList.add("is-visible");
      },
      { passive: true },
    );
    listen(document, "pointerleave", () => c.classList.remove("is-visible"));
    listen(document, "pointerover", (e) => {
      const t = e.target;
      if (!t.closest) return;
      const interactive = t.closest(
        "a, button, summary, input, textarea, select, label, [data-cursor]",
      );
      let text = "";
      for (const [sel, l] of labels) {
        const m = t.closest(sel);
        if (m) {
          text = l || m.dataset.cursor;
          break;
        }
      }
      c.classList.toggle("is-hover", !!interactive || !!text);
      c.classList.toggle("has-label", !!text);
      if (text) label.textContent = text;
      c.classList.toggle("is-text", !!t.closest("input, textarea"));
      c.classList.toggle(
        "is-hidden",
        !!t.closest("#service-grid .service-row"),
      ); // the vector preview takes over
    });
    listen(document, "pointerdown", () => c.classList.add("is-down"));
    listen(document, "pointerup", () => c.classList.remove("is-down"));
  }

  function magnetic() {
    if (!mqFine.matches) return;
    $$(
      ".button, .header-cta, .play-dot, .dialog-close, .filter-tabs button, .scroll-cue",
    ).forEach((el) => {
      const strength = el.matches(".play-dot, .dialog-close") ? 0.45 : 0.28;
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      listen(el, "pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      listen(el, "pointerleave", () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.9,
          ease: "elastic.out(1, 0.35)",
          overwrite: true,
        });
      });
      const arrow = $(":scope > span", el);
      if (arrow) {
        listen(el, "pointerenter", () =>
          gsap.fromTo(
            arrow,
            { x: 0, y: 0 },
            {
              keyframes: [
                {
                  x: 14,
                  y: -14,
                  opacity: 0,
                  duration: 0.18,
                  ease: "power2.in",
                },
                { x: -14, y: 14, duration: 0 },
                { x: 0, y: 0, opacity: 1, duration: 0.35, ease: "expo.out" },
              ],
              overwrite: true,
            },
          ),
        );
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  SHARED HELPERS                                                     */
  /* ------------------------------------------------------------------ */
  // Lines rise out of masks. Returns nothing — SplitText autoSplit keeps it correct on resize/fonts.
  function splitRise(
    el,
    {
      type = "lines",
      start = "top 86%",
      stagger = 0.09,
      duration = 1.15,
      delay = 0,
      rotate = 2,
    } = {},
  ) {
    if (!el || el.dataset.kmSplit) return;
    el.dataset.kmSplit = "1";
    onCleanup(() => delete el.dataset.kmSplit);
    SplitText.create(el, {
      type: type === "words" ? "lines,words" : "lines",
      mask: "lines",
      linesClass: "km-line",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(type === "words" ? self.words : self.lines, {
          yPercent: 112,
          rotate,
          transformOrigin: "0% 100%",
          duration,
          stagger,
          delay,
          ease: "expo.out",
          scrollTrigger: once(el, start),
        }),
    });
  }

  // Draws a hand-made swash under the last line of an <em> inside a headline.
  // The swash lives in the headline's parent (SplitText re-splits would wipe children of the headline itself).
  function swashUnder(heading, delay = 0.5) {
    if (!heading || !$("em", heading) || heading.closest("dialog")) return null;
    const host = heading.parentElement;
    if (getComputedStyle(host).position === "static") {
      host.style.position = "relative";
      onCleanup(() => (host.style.position = ""));
    }
    const sw = inject(host, swash());
    // Layout offsets ignore transforms, so the swash lands in the right place even while lines are mid-animation.
    const offsetTo = (el) => {
      let x = 0,
        y = 0;
      while (el && el !== host) {
        x += el.offsetLeft;
        y += el.offsetTop;
        const p = el.offsetParent;
        if (!p || (!host.contains(p) && p !== host)) {
          const hr = host.getBoundingClientRect(),
            r = el.getBoundingClientRect();
          return {
            x: x - el.offsetLeft + (r.left - hr.left),
            y: y - el.offsetTop + (r.top - hr.top),
          };
        }
        el = p;
      }
      return { x, y };
    };
    const place = () => {
      const ems = $$("em", heading);
      if (!ems.length) return;
      const em = ems[ems.length - 1];
      const words = ems
        .flatMap((e) => $$("div", e))
        .filter((w) => !w.querySelector("div"));
      let box;
      if (words.length) {
        const pos = words.map((w) => ({ w, ...offsetTo(w) }));
        const last = pos[pos.length - 1];
        const row = pos.filter((p) => Math.abs(p.y - last.y) < 4);
        const left = Math.min(...row.map((p) => p.x)),
          right = Math.max(...row.map((p) => p.x + p.w.offsetWidth));
        box = { x: left, y: last.y, w: right - left, h: last.w.offsetHeight };
      } else {
        const rects = em.getClientRects();
        if (!rects.length) return;
        const r = rects[rects.length - 1],
          hr = host.getBoundingClientRect();
        box = {
          x: r.left - hr.left,
          y: r.top - hr.top,
          w: r.width,
          h: r.height,
        };
      }
      gsap.set(sw, {
        left: box.x,
        top: box.y + box.h * 0.84,
        width: box.w,
        height: Math.max(10, box.h * 0.24),
      });
    };
    place();
    requestAnimationFrame(place);
    ScrollTrigger.addEventListener("refresh", place);
    onCleanup(() => ScrollTrigger.removeEventListener("refresh", place));
    if (delay < 50)
      gsap.from($$("path", sw), {
        drawSVG: "0%",
        duration: 1.1,
        stagger: 0.15,
        ease: "power3.inOut",
        delay,
        scrollTrigger: once(heading, "top 80%"),
      });
    return sw;
  }

  function scramble(el, start = "top 92%", delay = 0) {
    if (!el || el.children.length || !el.textContent.trim()) return false;
    const text = el.textContent;
    gsap.to(el, {
      duration: 1.2,
      delay,
      scrambleText: {
        text,
        chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·",
        speed: 0.5,
        revealDelay: 0.15,
      },
      scrollTrigger: start ? once(el, start) : undefined,
    });
    onCleanup(() => (el.textContent = text));
    return true;
  }

  // Counts the first number in an element's first text node (₹ and en-IN grouping kept).
  function countUp(el, start = "top 90%") {
    if (!el) return;
    const tn = [...el.childNodes].find(
      (n) => n.nodeType === 3 && /\d/.test(n.textContent),
    );
    if (!tn) return;
    const raw = tn.textContent;
    const m = raw.match(/\d[\d,]*/);
    const target = parseInt(m[0].replace(/,/g, ""), 10);
    const grouped = m[0].includes(",");
    const pre = raw.slice(0, m.index),
      post = raw.slice(m.index + m[0].length);
    const fmt = (v) =>
      grouped ? Math.round(v).toLocaleString("en-IN") : String(Math.round(v));
    const o = { v: 0 };
    el.classList.add("km-num");
    gsap.to(o, {
      v: target,
      duration: target > 999 ? 1.8 : 1.2,
      ease: "power3.out",
      onStart: () => (tn.textContent = pre + fmt(0) + post),
      onUpdate: () => (tn.textContent = pre + fmt(o.v) + post),
      scrollTrigger: once(el, start),
    });
    onCleanup(() => {
      tn.textContent = raw;
      el.classList.remove("km-num");
    });
  }

  function clipReveal(
    wrap,
    img,
    { from = "inset(100% 0% 0% 0%)", start = "top 85%", scale = 1.25 } = {},
  ) {
    if (!wrap) return;
    const tl = gsap.timeline({ scrollTrigger: once(wrap, start) });
    tl.fromTo(
      wrap,
      { clipPath: from },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" },
    );
    if (img)
      tl.fromTo(
        img,
        { scale },
        { scale: 1, duration: 1.8, ease: "expo.out" },
        0.1,
      );
    return tl;
  }

  const fadeUp = (targets, trigger, extra = {}) => {
    const t = gsap.utils.toArray(targets);
    if (!t.length) return;
    gsap.from(t, {
      y: 36,
      opacity: 0,
      duration: 1,
      stagger: 0.08,
      ease: "expo.out",
      scrollTrigger: once(trigger || t[0], "top 90%"),
      ...extra,
    });
  };

  /* ------------------------------------------------------------------ */
  /*  HERO (landing)                                                     */
  /* ------------------------------------------------------------------ */
  function heroSetup() {
    const hero = $(".hero");
    if (!hero) return () => {};
    const h1 = $("#hero-title") || $("h1", hero);
    const split = SplitText.create(h1, {
      type: "chars,words",
      charsClass: "km-char",
    });
    const petals = $$(".flower-petals path", hero);
    const cores = $$(".vector-flower > circle", hero);
    const ring = $(".orbit-ring", hero);
    const art = $(".hero-art", hero);
    const copyP = $(".hero-copy > p", hero);
    const pSplit = copyP
      ? SplitText.create(copyP, { type: "lines", mask: "lines" })
      : null;
    const sw = swashUnder(h1, 99); // drawn by the intro timeline instead of ScrollTrigger

    // Initial states (set immediately so nothing flashes before the intro)
    gsap.set(h1, { perspective: 900 });
    gsap.set(split.chars, {
      yPercent: 105,
      rotationX: -80,
      opacity: 0,
      transformOrigin: "50% 100%",
    });
    if (pSplit) gsap.set(pSplit.lines, { yPercent: 110 });
    gsap.set(".hero-top > *, .hero-actions > *, .hero-foot > *", {
      y: 24,
      opacity: 0,
    });
    gsap.set(petals, { scale: 0, opacity: 0, svgOrigin: "300 300" });
    gsap.set(cores, { scale: 0, svgOrigin: "300 300" });
    if (ring)
      gsap.set(ring, { rotationX: 55, rotation: -30, scale: 0.4, opacity: 0 });
    gsap.set(".crosshair", { scale: 0, rotation: -180 });
    gsap.set(".orbital-label", { opacity: 0 });
    if (sw) gsap.set($$("path", sw), { drawSVG: "0%" });

    return function play() {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(".hero-top > *", { y: 0, opacity: 1, duration: 1, stagger: 0.1 }, 0)
        .to(
          split.chars,
          {
            yPercent: 0,
            rotationX: 0,
            opacity: 1,
            duration: 1.3,
            stagger: 0.035,
          },
          0.1,
        )
        .to(
          petals,
          {
            scale: 1,
            opacity: 1,
            duration: 1.5,
            stagger: { each: 0.06, from: "start" },
            ease: "back.out(1.5)",
          },
          0.15,
        )
        .to(
          cores,
          { scale: 1, duration: 1, stagger: 0.12, ease: "back.out(3)" },
          0.75,
        )
        .to(ring || {}, { scale: 1, opacity: 1, duration: 1.6 }, 0.5)
        .to(
          ".crosshair",
          { scale: 1, rotation: 0, duration: 1.2, stagger: 0.15 },
          0.8,
        )
        .add(
          () =>
            $$(".orbital-label", hero).forEach((l, i) => {
              gsap.set(l, { opacity: 1 });
              if (!scramble(l, null, i * 0.15))
                gsap.from(l, { opacity: 0, y: 10, duration: 0.8 });
            }),
          0.9,
        );
      if (pSplit)
        tl.to(pSplit.lines, { yPercent: 0, duration: 1.1, stagger: 0.1 }, 0.6);
      tl.to(
        ".hero-actions > *",
        { y: 0, opacity: 1, duration: 1, stagger: 0.1 },
        0.8,
      ).to(
        ".hero-foot > *",
        { y: 0, opacity: 1, duration: 1, stagger: 0.08 },
        1.0,
      );
      if (sw)
        tl.to(
          $$("path", sw),
          {
            drawSVG: "100%",
            duration: 1.1,
            stagger: 0.15,
            ease: "power3.inOut",
          },
          1.0,
        );

      // Ambient life
      const g = $(".flower-petals", hero);
      if (g)
        gsap.to(g, {
          rotation: 360,
          svgOrigin: "300 300",
          duration: 90,
          ease: "none",
          repeat: -1,
        });
      if (ring)
        gsap.to(ring, {
          rotation: "+=360",
          duration: 40,
          ease: "none",
          repeat: -1,
          delay: 2,
        });
      gsap.to(cores[1] || {}, {
        scale: 1.35,
        svgOrigin: "300 300",
        duration: 1.6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 2,
      });
      gsap.to(".status-dot", {
        scale: 1.8,
        opacity: 0.35,
        duration: 0.9,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to(".scroll-cue span", {
        y: 6,
        duration: 0.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // Scroll exit (scrubbed) — wrapper only; green.js keeps rotating the svg itself
      gsap
        .timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        })
        .to(art, { yPercent: 22, scale: 1.18, opacity: 0.25, ease: "none" }, 0)
        .to(h1, { yPercent: -40, opacity: 0.15, ease: "none" }, 0)
        .to(
          ".hero-copy > p, .hero-actions",
          { y: -80, opacity: 0, ease: "none" },
          0,
        )
        .to(".hero-foot", { y: 40, opacity: 0, ease: "none" }, 0.2);

      // Pointer parallax on the vector art
      if (mqFine.matches && art) {
        const ax = gsap.quickTo(art, "x", { duration: 1.2, ease: "power3" }),
          ay = gsap.quickTo(art, "y", { duration: 1.2, ease: "power3" });
        const crossX = gsap.quickTo(".crosshair", "x", {
            duration: 1.4,
            ease: "power3",
          }),
          crossY = gsap.quickTo(".crosshair", "y", {
            duration: 1.4,
            ease: "power3",
          });
        listen(hero, "pointermove", (e) => {
          const nx = e.clientX / innerWidth - 0.5,
            ny = e.clientY / innerHeight - 0.5;
          ax(nx * 40);
          ay(ny * 30);
          crossX(nx * -50);
          crossY(ny * -40);
        });
      }
      return tl;
    };
  }

  function ticker() {
    const track = $(".ticker > div");
    if (!track) return;
    track.classList.add("km-ticker");
    onCleanup(() => track.classList.remove("km-ticker"));
    const loop = gsap.to(track, {
      xPercent: -50,
      duration: 38,
      ease: "none",
      repeat: -1,
    });
    const skew = gsap.quickTo(track, "skewX", {
      duration: 0.5,
      ease: "power3",
    });
    let dir = 1,
      boost = 0;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        dir = self.direction;
        boost = Math.min(Math.abs(self.getVelocity()) / 220, 7);
        skew(gsap.utils.clamp(-10, 10, self.getVelocity() / -150));
      },
    });
    const tick = () => {
      boost *= 0.93;
      loop.timeScale(dir * (1 + boost));
      if (boost < 0.05) skew(0);
    };
    gsap.ticker.add(tick);
    onCleanup(() => gsap.ticker.remove(tick));
    gsap.to(".ticker span", {
      rotation: 360,
      duration: 6,
      ease: "none",
      repeat: -1,
    });
  }

  /* ------------------------------------------------------------------ */
  /*  GENERIC (every page)                                               */
  /* ------------------------------------------------------------------ */
  function generic() {
    // Section seams — a vector line that draws across the top of each section heading
    $$(".section-heading").forEach((h) => {
      const s = inject(h, seam(), "afterbegin");
      const st = { trigger: h, start: "top 95%", end: "top 40%", scrub: 0.5 };
      gsap.fromTo(
        $(".km-seam__line", s),
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: st },
      );
      gsap.fromTo(
        $(".km-seam__dot", s),
        { left: "0%" },
        { left: "100%", ease: "none", scrollTrigger: { ...st } },
      );
    });

    // Headlines: masked line rise + swash under the italic word
    $$(".brief-section h2 > span").forEach((sp) => {
      sp.classList.add("km-arrow");
      onCleanup(() => sp.classList.remove("km-arrow"));
    });
    $$("main h2").forEach((h) => {
      if (h.closest(".manifesto") || h.closest(".hero")) return;
      splitRise(h, { type: "words", stagger: 0.04, duration: 1.2, rotate: 3 });
      swashUnder(h, 0.55);
    });
    $$(".film-editorial h3, .property-copy h3, .process-grid h3").forEach((h) =>
      splitRise(h, { stagger: 0.08 }),
    );

    // Body copy
    $$(
      ".section-heading p, .film-editorial > p, .property-copy > p:not(.tiny), .avatar-copy > p, .founder-section p, .brief-section > div > p, .manifesto p",
    ).forEach((p) =>
      splitRise(p, { stagger: 0.07, duration: 1, rotate: 0, start: "top 90%" }),
    );

    // Eyebrows scramble in like a studio slate
    $$("main .eyebrow").forEach((e) => {
      if (!e.closest(".hero") && !e.closest(".plan")) scramble(e);
    });

    // Buttons, links, pills
    $$(
      "main .section .button, main .section .text-link, main .section .under-link, main .section .small-pill, main .section .tiny",
    ).forEach((b) => {
      if (!b.closest(".plan") && !b.closest("form")) fadeUp(b, b);
    });

    // Counters
    $$(
      ".featured-price strong, .property-price strong, .avatar-facts strong, .plan-price",
    ).forEach((n) => countUp(n));

    // Public data-attribute API for new pages: data-km="fade-up | split | clip | count | parallax | draw | scale-in"
    $$("[data-km]").forEach((el) => {
      const kind = el.dataset.km;
      if (kind === "fade-up") fadeUp(el, el);
      else if (kind === "split")
        splitRise(el, { type: "words", stagger: 0.04 });
      else if (kind === "clip") clipReveal(el, $("img, video", el));
      else if (kind === "count") countUp(el);
      else if (kind === "scale-in")
        gsap.from(el, {
          scale: 0.85,
          opacity: 0,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: once(el),
        });
      else if (kind === "draw")
        gsap.from($$("path, line, circle, polyline, rect", el), {
          drawSVG: "0%",
          duration: 1.6,
          stagger: 0.08,
          ease: "power2.inOut",
          scrollTrigger: once(el),
        });
      else if (kind === "parallax")
        gsap.fromTo(
          el,
          { yPercent: -(+el.dataset.kmSpeed || 10) },
          {
            yPercent: +el.dataset.kmSpeed || 10,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
    });
  }

  /* ------------------------------------------------------------------ */
  /*  SECTIONS                                                           */
  /* ------------------------------------------------------------------ */
  function films() {
    const s = $("#studio");
    if (!s) return;
    const wrap = $(".film-player-wrap", s),
      frame = $(".video-frame", s);
    mm.add("(min-width: 801px)", () => {
      gsap.fromTo(
        wrap,
        {
          rotationX: 22,
          y: 140,
          scale: 0.86,
          transformPerspective: 1200,
          transformOrigin: "50% 100%",
        },
        {
          rotationX: 0,
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom",
            end: "center 55%",
            scrub: 0.8,
          },
        },
      );
    });
    mm.add("(max-width: 800px)", () => {
      gsap.from(wrap, {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: once(wrap),
      });
    });

    if (frame) {
      const vf = inject(frame, viewfinder());
      const tc = $(".km-vf__tc", vf);
      gsap.from($$(".km-vf__c path", vf), {
        drawSVG: "0%",
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.inOut",
        scrollTrigger: once(frame, "top 75%"),
      });
      gsap.to($(".km-vf__rec i", vf), {
        opacity: 0.15,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "steps(1)",
      });
      const t = { f: 0 };
      gsap.to(t, {
        f: 30 * 60 * 3,
        duration: 180,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          const f = Math.floor(t.f),
            sec = Math.floor(f / 30);
          tc.textContent = `00:${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}:${String(f % 30).padStart(2, "0")}`;
        },
      });
      const video = $("video", frame);
      if (video) {
        const sync = () => vf.classList.toggle("is-playing", !video.paused);
        listen(video, "play", sync);
        listen(video, "pause", sync);
      }
    }
    const choices = $$(".film-choice", s);
    gsap.from(choices, {
      x: 70,
      opacity: 0,
      duration: 1.1,
      stagger: 0.12,
      ease: "expo.out",
      scrollTrigger: once(choices[0], "top 88%"),
    });
    gsap.from($$(".film-choice img", s), {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 1.2,
      stagger: 0.12,
      ease: "expo.inOut",
      scrollTrigger: once(choices[0], "top 88%"),
    });
    gsap.from(".playlist-bottom", {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: once(".playlist-bottom"),
    });
    gsap.to(".film-note > span", {
      rotation: 360,
      ease: "none",
      scrollTrigger: {
        trigger: s,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
    gsap.from(".featured-price", {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: once(".featured-price"),
    });
    gsap.from(".video-topline > *", {
      y: -12,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "expo.out",
      scrollTrigger: once(wrap, "top 80%"),
    });
  }

  function pinYourSite() {
    const s = $("#pinyoursite");
    if (!s) return;
    const win = $(".property-window", s),
      map = $(".map-preview", s);
    mm.add("(min-width: 801px)", () => {
      gsap.fromTo(
        win,
        {
          rotationY: 26,
          rotationX: 10,
          y: 120,
          scale: 0.9,
          transformPerspective: 1400,
          transformOrigin: "0% 50%",
        },
        {
          rotationY: 4,
          rotationX: 0,
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: win,
            start: "top bottom",
            end: "center 55%",
            scrub: 0.8,
          },
        },
      );
      gsap.to(win, {
        rotationY: -4,
        ease: "none",
        scrollTrigger: {
          trigger: win,
          start: "center 55%",
          end: "bottom top",
          scrub: 0.8,
        },
      });
    });
    mm.add("(max-width: 800px)", () => {
      gsap.from(win, {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: once(win),
      });
    });

    gsap.from(".window-bar i", {
      scale: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: "back.out(3)",
      scrollTrigger: once(win, "top 80%"),
    });
    if (map) {
      const pts = [
        [18, 62],
        [34, 38],
        [52, 56],
        [68, 30],
        [83, 50],
      ];
      const overlay = inject(
        map,
        `<div class="km-pins" aria-hidden="true">${pinRoute(pts)}${pts.map(([x, y], i) => `<span class="km-pin" style="left:${x}%;top:${y}%"><em></em>${pin()}<small>${["PLOT 12", "PLOT 25", "CLUBHOUSE", "PLOT 41", "GATE"][i]}</small></span>`).join("")}</div>`,
      );
      const pinsEls = $$(".km-pin", overlay);
      const tl = gsap.timeline({ scrollTrigger: once(map, "top 70%") });
      tl.from($(".km-pins__route .km-reveal", overlay), {
        drawSVG: "0%",
        duration: 1.6,
        ease: "power2.inOut",
      })
        .from(
          $$("svg", overlay).filter(
            (x) => !x.classList.contains("km-pins__route"),
          ),
          {
            y: -70,
            opacity: 0,
            duration: 0.9,
            stagger: 0.18,
            ease: "bounce.out",
          },
          0.1,
        )
        .from(
          $$(".km-pin small", overlay),
          { opacity: 0, x: -8, stagger: 0.18, duration: 0.5 },
          0.6,
        );
      pinsEls.forEach((p, i) =>
        gsap.fromTo(
          $("em", p),
          { scale: 0.3, opacity: 0.9 },
          {
            scale: 3,
            opacity: 0,
            duration: 2,
            repeat: -1,
            delay: 1.8 + i * 0.35,
            ease: "power2.out",
          },
        ),
      );
    }
    $$(".feature-list li", s).forEach((li) =>
      inject(li, '<i class="km-rule" aria-hidden="true"></i>'),
    );
    gsap.from(".feature-list li", {
      x: -30,
      opacity: 0,
      duration: 0.9,
      stagger: 0.1,
      ease: "expo.out",
      scrollTrigger: once(".feature-list", "top 85%"),
    });
    gsap.from(".feature-list .km-rule", {
      scaleX: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: "expo.inOut",
      scrollTrigger: once(".feature-list", "top 85%"),
    });
    $$(".feature-list li > span", s).forEach((n) => scramble(n, "top 90%"));
  }

  function avatar() {
    const s = $("#avatar");
    if (!s) return;
    const wrap = $(".avatar-image", s),
      img = $("img", wrap);
    clipReveal(wrap, null, { start: "top 80%" });
    gsap.fromTo(
      img,
      { scale: 1.3, yPercent: -6 },
      {
        scale: 1.02,
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
    const stamp = $(".avatar-stamp", s);
    gsap.from(stamp, {
      scale: 0,
      rotation: -200,
      duration: 1.4,
      ease: "back.out(1.6)",
      scrollTrigger: once(wrap, "top 55%"),
    });
    gsap.to(stamp, {
      rotation: "+=120",
      ease: "none",
      scrollTrigger: {
        trigger: s,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
    gsap.from(".image-caption", {
      x: -30,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: once(wrap, "top 50%"),
    });

    const sc = inject(wrap, scan());
    const tl = gsap.timeline({ scrollTrigger: once(wrap, "top 55%") });
    tl.from(
      $$(".km-scan__c path", sc),
      { drawSVG: "0%", duration: 1, stagger: 0.1, ease: "power3.inOut" },
      0.6,
    )
      .fromTo(
        $(".km-scan__line", sc),
        { top: "0%", opacity: 1 },
        {
          top: "100%",
          duration: 2.4,
          ease: "power1.inOut",
          repeat: -1,
          repeatDelay: 1.6,
        },
        0.6,
      )
      .from(
        $(".km-scan__voice", sc),
        { y: 20, opacity: 0, duration: 0.8, ease: "expo.out" },
        1.2,
      );
    $$(".km-scan__voice b", sc).forEach((b, i) =>
      gsap.to(b, {
        scaleY: gsap.utils.random(0.25, 1),
        duration: gsap.utils.random(0.25, 0.5),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.06,
      }),
    );
    gsap.from(".avatar-facts > div", {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.12,
      ease: "expo.out",
      scrollTrigger: once(".avatar-facts"),
    });
    gsap.from(".avatar-offer", {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: once(".avatar-offer", "top 92%"),
    });
  }

  function manifesto() {
    const s = $(".manifesto");
    if (!s) return;
    const h = $("h2", s);
    const vec = $(".manifesto-vector", s);
    const split = SplitText.create(h, { type: "words", wordsClass: "km-word" });
    const ghost = inject(s, flowerOutline("km-ghost km-ghost--manifesto"));
    mm.add("(min-width: 1025px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: s,
          start: "top top",
          end: "+=110%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });
      tl.fromTo(
        split.words,
        { opacity: 0.12, yPercent: 20 },
        { opacity: 1, yPercent: 0, stagger: 0.25, ease: "none" },
        0,
      )
        .fromTo(
          $$("path, circle", vec),
          { drawSVG: "0%" },
          { drawSVG: "100%", stagger: 0.2, ease: "none", duration: 2 },
          0,
        )
        .fromTo(
          $$(".km-petal", ghost),
          { drawSVG: "0%" },
          { drawSVG: "100%", stagger: 0.08, ease: "none", duration: 2 },
          0.2,
        )
        .fromTo(
          ghost,
          { rotation: -40, scale: 0.8 },
          { rotation: 30, scale: 1.05, ease: "none", duration: 3 },
          0,
        );
    });
    mm.add("(max-width: 1024px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: s,
          start: "top 80%",
          end: "bottom 50%",
          scrub: 0.6,
        },
      });
      tl.fromTo(
        split.words,
        { opacity: 0.12 },
        { opacity: 1, stagger: 0.25, ease: "none" },
        0,
      )
        .fromTo(
          $$("path, circle", vec),
          { drawSVG: "0%" },
          { drawSVG: "100%", stagger: 0.2, ease: "none", duration: 2 },
          0,
        )
        .fromTo(
          $$(".km-petal", ghost),
          { drawSVG: "0%" },
          { drawSVG: "100%", stagger: 0.08, ease: "none", duration: 2 },
          0,
        );
    });
  }

  function services() {
    const s = $("#services");
    if (!s) return;
    const grid = $("#service-grid", s);
    const animateRows = (rows, scroll) => {
      if (!rows.length) return;
      const vars = {
        y: 46,
        opacity: 0,
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1,
        stagger: 0.06,
        ease: "expo.out",
        clearProps: "clipPath",
      };
      if (scroll) gsap.set(rows, { y: 46, opacity: 0 });
      if (scroll)
        ScrollTrigger.batch(rows, {
          start: "top 92%",
          once: true,
          onEnter: (b) =>
            gsap.fromTo(b, vars, {
              y: 0,
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1,
              stagger: 0.06,
              ease: "expo.out",
            }),
        });
      else
        gsap.fromTo(rows, vars, {
          y: 0,
          opacity: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.9,
          stagger: 0.05,
          ease: "expo.out",
        });
    };
    animateRows($$(".service-row", grid), true);
    let previewReady = false;
    const relayout = gsap
      .delayedCall(0.15, () => ScrollTrigger.refresh())
      .pause();
    const mo = new MutationObserver(() => {
      animateRows($$(".service-row", grid), false);
      if (previewReady) bindRows();
      relayout.restart(true);
    });
    mo.observe(grid, { childList: true });
    onCleanup(() => mo.disconnect());

    // Sliding tab pill
    const tabs = $(".filter-tabs", s);
    if (tabs) {
      tabs.classList.add("km-tabs");
      onCleanup(() => tabs.classList.remove("km-tabs"));
      const pill = inject(
        tabs,
        '<span class="km-tab-pill" aria-hidden="true"></span>',
        "afterbegin",
      );
      const moveTo = (btn, instant) => {
        if (!btn) return;
        gsap.to(pill, {
          x: btn.offsetLeft,
          y: btn.offsetTop,
          width: btn.offsetWidth,
          height: btn.offsetHeight,
          duration: instant ? 0 : 0.6,
          ease: "expo.out",
        });
      };
      moveTo($("button.active", tabs), true);
      listen(tabs, "click", (e) => {
        const b = e.target.closest("button");
        if (b) moveTo(b);
      });
      ScrollTrigger.addEventListener("refresh", () =>
        moveTo($("button.active", tabs), true),
      );
      gsap.from($$("button", tabs), {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: "expo.out",
        scrollTrigger: once(tabs, "top 90%"),
      });
    }

    // Floating vector preview that follows the cursor over rows
    return;
    const pv = inject(
      body,
      '<div class="km-svc" aria-hidden="true"><div class="km-svc__ring"></div><div class="km-svc__icon"></div><div class="km-svc__label"></div></div>',
    );
    const iconBox = $(".km-svc__icon", pv),
      lab = $(".km-svc__label", pv);
    previewReady = true;
    const px = gsap.quickTo(pv, "x", { duration: 0.55, ease: "power3" }),
      py = gsap.quickTo(pv, "y", { duration: 0.55, ease: "power3" });
    gsap.to($(".km-svc__ring", pv), {
      rotation: 360,
      duration: 8,
      repeat: -1,
      ease: "none",
    });
    let current = null;
    function bindRows() {
      $$(".service-row", grid).forEach((row) => {
        if (row.dataset.kmBound) return;
        row.dataset.kmBound = "1";
        row.addEventListener("pointerenter", () => {
          const id = row.dataset.service;
          if (id !== current) {
            current = id;
            iconBox.innerHTML = serviceIcons[id] || serviceIconFallback;
            lab.textContent = ($("strong", row) || {}).textContent || "";
            gsap.from($$("path, circle, rect", iconBox), {
              drawSVG: "0%",
              duration: 0.9,
              stagger: 0.05,
              ease: "power2.out",
            });
          }
          gsap.to(pv, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.8)",
            overwrite: "auto",
          });
          gsap.to($(".service-number", row), {
            color: "#10291e",
            x: 6,
            duration: 0.3,
          });
        });
        row.addEventListener("pointerleave", () => {
          gsap.to(pv, {
            scale: 0.4,
            opacity: 0,
            duration: 0.35,
            ease: "power3.in",
            overwrite: "auto",
          });
          gsap.to($(".service-number", row), {
            clearProps: "color",
            x: 0,
            duration: 0.3,
          });
        });
      });
    }
    bindRows();
    gsap.set(pv, { scale: 0.4, opacity: 0 });
    listen(grid, "pointermove", (e) => {
      px(e.clientX);
      py(e.clientY);
    });
    onCleanup(() =>
      $$(".service-row", grid).forEach((r) => delete r.dataset.kmBound),
    );
  }

  function plans() {
    const s = $("#plans");
    if (!s) return;
    const cards = $$(".plan", s);
    s.classList.add("km-rel");
    onCleanup(() => s.classList.remove("km-rel"));
    const ghost = inject(
      s,
      flowerOutline("km-ghost km-ghost--plans"),
      "afterbegin",
    );
    gsap.fromTo(
      ghost,
      { rotation: -30 },
      {
        rotation: 90,
        ease: "none",
        scrollTrigger: {
          trigger: s,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      },
    );
    gsap.from($$(".km-petal", ghost), {
      drawSVG: "0%",
      stagger: 0.1,
      ease: "none",
      scrollTrigger: { trigger: s, start: "top 80%", end: "top 10%", scrub: 1 },
    });

    gsap.set(cards, {
      transformPerspective: 1100,
      transformOrigin: "50% 0%",
      y: 110,
      rotationX: -28,
      opacity: 0,
    });
    ScrollTrigger.batch(cards, {
      start: "top 90%",
      once: true,
      onEnter: (b) =>
        gsap.fromTo(
          b,
          { y: 110, rotationX: -28, opacity: 0 },
          {
            y: 0,
            rotationX: 0,
            opacity: 1,
            duration: 1.3,
            stagger: 0.1,
            ease: "expo.out",
          },
        ),
    });
    gsap.utils
      .toArray(".plan-top > span:last-child", s)
      .forEach((st) =>
        gsap.to(st, {
          rotation: 360,
          ease: "none",
          scrollTrigger: {
            trigger: st,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }),
      );
    $$(".plan li", s).forEach((li) => li.classList.add("km-li"));
    onCleanup(() =>
      $$(".plan li", s).forEach((li) => li.classList.remove("km-li")),
    );
    fadeUp(".terms-note", ".terms-note");

    // Hover: 3D tilt + spotlight that follows the pointer
    if (!mqFine.matches) return;
    cards.forEach((card) => {
      card.classList.add("km-spot");
      onCleanup(() => card.classList.remove("km-spot"));
      const rx = gsap.quickTo(card, "rotationX", {
          duration: 0.6,
          ease: "power3",
        }),
        ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });
      listen(card, "pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width,
          ny = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${nx * 100}%`);
        card.style.setProperty("--my", `${ny * 100}%`);
        rx((0.5 - ny) * 8);
        ry((nx - 0.5) * 10);
      });
      listen(card, "pointerleave", () => {
        rx(0);
        ry(0);
      });
    });
  }

  function founder() {
    const s = $("#about");
    if (!s) return;
    const photo = $(".founder-photo", s);
    clipReveal(photo, $("img", photo), {
      from: "inset(0% 100% 0% 0%)",
      start: "top 80%",
      scale: 1.3,
    });
    gsap.fromTo(
      $("img", photo),
      { yPercent: -5 },
      {
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: photo,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
    gsap.from($(".founder-photo > span", s), {
      x: -40,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: once(photo, "top 50%"),
    });
  }

  function process() {
    const s = $(".process-section");
    if (!s) return;
    const grid = $(".process-grid", s);
    const arts = $$("article", grid);
    mm.add("(min-width: 801px)", () => {
      grid.classList.add("km-rel");
      const line = document.createElement("div");
      line.className = "km-proc";
      line.setAttribute("aria-hidden", "true");
      line.innerHTML =
        '<i class="km-proc__line"></i><b class="km-proc__dot"></b>';
      grid.append(line);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: "top 80%",
          end: "bottom 55%",
          scrub: 0.7,
        },
      });
      tl.fromTo(
        $(".km-proc__line", line),
        { scaleX: 0 },
        { scaleX: 1, ease: "none", duration: 4 },
        0,
      ).fromTo(
        $(".km-proc__dot", line),
        { left: "0%" },
        { left: "100%", ease: "none", duration: 4 },
        0,
      );
      arts.forEach((a, i) =>
        tl.from(
          a.children,
          {
            y: 40,
            opacity: 0,
            stagger: 0.12,
            duration: 0.8,
            ease: "power3.out",
          },
          i * 0.95,
        ),
      );
      return () => {
        grid.classList.remove("km-rel");
        line.remove();
      };
    });
    mm.add("(max-width: 800px)", () => {
      arts.forEach((a) => fadeUp(a.children, a));
    });
    $$("article > span", grid).forEach((n) => scramble(n, "top 85%"));
  }

  function brief() {
    const s = $("#brief");
    if (!s) return;
    s.classList.add("km-rel");
    onCleanup(() => s.classList.remove("km-rel"));
    const [trail, plane] = inject(s, flight(), "afterbegin");
    const guide = $(".km-flight__guide", trail);
    const fly = {
      trigger: s,
      start: "top 85%",
      end: "bottom 75%",
      scrub: 0.6,
      invalidateOnRefresh: true,
    };
    gsap.fromTo(
      $(".km-reveal", trail),
      { drawSVG: "0%" },
      { drawSVG: "100%", ease: "none", scrollTrigger: { ...fly } },
    );
    // The plane rides the same vector path (MotionPath maps the stretched svg into page space)
    gsap.to(plane, {
      motionPath: {
        path: guide,
        align: guide,
        alignOrigin: [0.5, 0.5],
        autoRotate: 22,
      },
      ease: "none",
      scrollTrigger: { ...fly },
    });

    const arrow = $(".km-arrow", s);
    if (arrow) {
      gsap.from(arrow, {
        x: -80,
        y: 80,
        rotation: -45,
        scale: 0.4,
        opacity: 0,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: once(arrow, "top 85%"),
      });
      gsap.to(arrow, {
        x: 10,
        y: -10,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.6,
      });
    }
    const form = $("#brief-form", s);
    if (form) {
      gsap.from(form, {
        y: 80,
        opacity: 0,
        rotation: 2,
        duration: 1.3,
        ease: "expo.out",
        scrollTrigger: once(form),
      });
      gsap.from($$("label, .button, .tiny", form), {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: once(form, "top 75%"),
      });
    }
    gsap.from($$(":scope > div > a", s), {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.9,
      ease: "expo.out",
      scrollTrigger: once(s, "top 55%"),
    });
  }

  function faq() {
    const s = $(".faq-section");
    if (!s) return;
    const items = $$("details", s);
    gsap.from(items, {
      y: 30,
      opacity: 0,
      stagger: 0.08,
      duration: 0.9,
      ease: "expo.out",
      scrollTrigger: once(items[0], "top 90%"),
    });
    items.forEach((d) => {
      d.classList.add("km-details");
      const sum = $("summary", d),
        content = $$(":scope > :not(summary)", d);
      listen(sum, "click", (e) => {
        e.preventDefault();
        if (!d.open) {
          d.open = true;
          gsap.fromTo(
            content,
            { height: 0, opacity: 0, y: -8 },
            {
              height: "auto",
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: "expo.out",
              clearProps: "height",
            },
          );
        } else {
          gsap.to(content, {
            height: 0,
            opacity: 0,
            duration: 0.35,
            ease: "power3.in",
            onComplete: () => {
              d.open = false;
              gsap.set(content, { clearProps: "all" });
            },
          });
        }
      });
      onCleanup(() => d.classList.remove("km-details"));
    });
  }

  function footer() {
    const f = $("footer");
    if (!f) return;
    const word = $(".footer-word", f);
    if (word) {
      word.classList.add("km-mask");
      onCleanup(() => word.classList.remove("km-mask"));
      const split = SplitText.create(word, { type: "chars" });
      gsap.fromTo(
        split.chars,
        { yPercent: 105, rotation: 8 },
        {
          yPercent: 0,
          rotation: 0,
          stagger: 0.06,
          ease: "expo.out",
          scrollTrigger: {
            trigger: f,
            start: "top 95%",
            end: "top 35%",
            scrub: 0.7,
          },
        },
      );
      const arrow = $("span", word);
      if (arrow)
        gsap.fromTo(
          arrow,
          { rotation: -90 },
          {
            rotation: 0,
            ease: "none",
            scrollTrigger: {
              trigger: f,
              start: "top 90%",
              end: "bottom bottom",
              scrub: 1,
            },
          },
        );
    }
    gsap.from($$(".footer-top > *, .footer-bottom > *", f), {
      y: 24,
      opacity: 0,
      stagger: 0.07,
      duration: 0.9,
      ease: "expo.out",
      scrollTrigger: once(f, "top 90%"),
    });
    const ghost = inject(
      f,
      flowerOutline("km-ghost km-ghost--footer"),
      "afterbegin",
    );
    f.classList.add("km-rel");
    onCleanup(() => f.classList.remove("km-rel"));
    gsap.fromTo(
      ghost,
      { rotation: 0, scale: 0.7 },
      {
        rotation: 140,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: f,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1,
        },
      },
    );
  }

  /* ------------------------------------------------------------------ */
  /*  LIFECYCLE                                                          */
  /* ------------------------------------------------------------------ */
  async function start() {
    if (running) return;
    running = true;
    html.classList.add("km-on");
    log("start");
    setupLenis();
    let playHero = () => {};
    ctx = gsap.context(() => {
      mm = gsap.matchMedia();
      playHero = heroSetup();
    });
    await preloader();
    if (!running) return;
    ctx.add(() => {
      header();
      rail();
      cursor();
      magnetic();
      playHero();
      ticker();
      generic();
      films();
      pinYourSite();
      avatar();
      manifesto();
      services();
      plans();
      founder();
      process();
      brief();
      faq();
      footer();
    });
    // Recalculate after images/fonts settle
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState !== "complete")
      listen(window, "load", refresh, { once: true });
    document.fonts && document.fonts.ready.then(() => running && refresh());
    if (
      location.hash &&
      location.hash.length > 1 &&
      !location.hash.startsWith("#service/")
    ) {
      const t = document.getElementById(location.hash.slice(1));
      if (t && lenis)
        setTimeout(
          () =>
            lenis.scrollTo(t, { offset: -opts.headerOffset, immediate: true }),
          50,
        );
    }
  }

  function stop() {
    if (!running) return;
    running = false;
    log("stop");
    mm && mm.revert();
    ctx && ctx.revert();
    ctx = mm = null;
    cleanups.reverse().forEach((fn) => {
      try {
        fn();
      } catch (e) {
        log(e);
      }
    });
    cleanups = [];
    $$(".km-pre").forEach((n) => n.remove());
    html.classList.remove("km-on", "km-preload");
    ScrollTrigger.refresh();
  }

  const shouldRun = () =>
    !mqReduce.matches && !body.classList.contains("motion-paused");
  const sync = () => {
    if (shouldRun())
      start().catch((error) => {
        console.error("Motion initialization failed", error);
        stop();
      });
    else stop();
  };

  // Respect the site's own Pause/Resume motion button and the OS setting
  const pauseObserver = new MutationObserver(sync);
  pauseObserver.observe(body, { attributes: true, attributeFilter: ["class"] });
  mqReduce.addEventListener("change", sync);

  sync();

  return {
    start,
    stop,
    refresh: () => ScrollTrigger.refresh(),
    get lenis() {
      return lenis;
    },
    destroy() {
      stop();
      pauseObserver.disconnect();
      mqReduce.removeEventListener("change", sync);
    },
  };
}
