/*!
 * KAPADIYA & SONS — Motion Edition (Next)
 * npm / Vite entry. Usage (at the very end of green.js, or in index.html as a module):
 *   import './motion/kapadiya-motion.js';
 * Options can be set before import:  window.KM_OPTIONS = { preloader: true, cursor: true, rail: true };
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import Lenis from "lenis";
import "./kapadiya-motion.css";
import { createKapadiyaMotion } from "./kapadiya-motion-core.js";

const deps = {
  gsap,
  ScrollTrigger,
  SplitText,
  DrawSVGPlugin,
  MotionPathPlugin,
  ScrambleTextPlugin,
  Lenis,
};

export function initKapadiyaMotion(options = {}) {
  if (window.__kapadiyaMotion) return window.__kapadiyaMotion;
  window.__kapadiyaMotion = createKapadiyaMotion(deps, {
    ...(window.KM_OPTIONS || {}),
    ...options,
  });
  return window.__kapadiyaMotion;
}

if (!window.KM_MANUAL) {
  // setTimeout: even when this file is imported at the end of green.js (imports are hoisted),
  // green.js finishes rendering services + flower petals before the motion layer reads the DOM.
  const boot = () => setTimeout(() => initKapadiyaMotion(), 0);
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
}

export default initKapadiyaMotion;
