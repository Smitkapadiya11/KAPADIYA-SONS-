import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
let context;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
function start() {
  if (
    context ||
    reduced.matches ||
    document.body.classList.contains("motion-paused")
  )
    return;
  context = gsap.context(() => {
    const lines = document.querySelectorAll(".contour-lines path");
    gsap.fromTo(
      lines,
      { drawSVG: "0%" },
      { drawSVG: "100%", duration: 2.4, stagger: 0.025, ease: "power2.inOut" },
    );
    gsap.to(".contour-art", {
      rotation: 35,
      scale: 1.16,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.9,
      },
    });
    gsap.to(".contour-lines", {
      rotation: 12,
      svgOrigin: "300 300",
      duration: 9,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.utils.toArray(".work-card").forEach((card, i) => {
      gsap.fromTo(
        card.querySelector(".work-media"),
        { clipPath: "inset(14% 0 90% 0)", y: 45 },
        {
          clipPath: "inset(0% 0% 0% 0)",
          y: 0,
          duration: 1.25,
          ease: "power4.out",
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
        },
      );
      gsap.fromTo(
        card.querySelector("img"),
        { yPercent: -5, scale: 1.1 },
        {
          yPercent: 5,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          },
        },
      );
      gsap.from(card.querySelector(".work-caption"), {
        y: 24,
        opacity: 0,
        duration: 0.9,
        scrollTrigger: { trigger: card, start: "top 60%", once: true },
      });
    });
    const sections = document.querySelectorAll(
      "#studio,#pinyoursite,#services,#plans,#about,#brief",
    );
    sections.forEach((section, i) => {
      const wrap = document.createElement("div");
      wrap.innerHTML =
        '<svg class="section-seam" viewBox="0 0 1440 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 15H480C540 15 545 2 600 2H840C895 2 900 15 960 15H1440"/><path d="M0 21H480C540 21 545 8 600 8H840C895 8 900 21 960 21H1440"/></svg>';
      const svg = wrap.firstChild;
      section.prepend(svg);
      gsap.from(svg.querySelectorAll("path"), {
        drawSVG: "0%",
        ease: "none",
        stagger: 0.15,
        scrollTrigger: {
          trigger: section,
          start: "top 95%",
          end: "top 30%",
          scrub: 0.6,
        },
      });
    });
  });
}
function sync() {
  if (reduced.matches || document.body.classList.contains("motion-paused")) {
    context?.revert();
    context = null;
    document.querySelectorAll(".section-seam").forEach((el) => el.remove());
  } else start();
}
const boot = () => setTimeout(sync, 30);
document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", boot, { once: true })
  : boot();
new MutationObserver(sync).observe(document.body, {
  attributes: true,
  attributeFilter: ["class"],
});
reduced.addEventListener("change", sync);
