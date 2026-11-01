import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const fine = matchMedia("(hover: hover) and (pointer: fine)");
let paused = reduce.matches;
let context, media, lenis, serviceContext, serviceObserver;
let cleanup = [];

// A projected, woven vector field. No downloaded model, video or image sequence.
class SignalField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.state = { progress: 0, pointerX: 0, pointerY: 0 };
    this.phase = 0;
    this.active = true;
    this.running = false;
    this.resize = new ResizeObserver(() => this.measure());
    this.resize.observe(canvas);
    this.observer = new IntersectionObserver(([entry]) => {
      this.active = entry.isIntersecting;
      if (this.active) this.draw();
    });
    this.observer.observe(canvas);
    this.tick = (_, delta) => {
      if (!this.active || document.hidden) return;
      this.phase += Math.min(delta, 40) * .00012;
      this.draw();
    };
    this.measure();
  }
  measure() {
    const r = this.canvas.getBoundingClientRect();
    this.w = r.width; this.h = r.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }
  setRunning(value) {
    if (value === this.running) return;
    this.running = value;
    value ? gsap.ticker.add(this.tick) : gsap.ticker.remove(this.tick);
    this.draw();
  }
  draw() {
    const ctx = this.ctx;
    if (!ctx || !this.w || !this.h) return;
    const { w, h, phase, state } = this;
    ctx.clearRect(0, 0, w, h);
    const size = Math.min(w, h) * .24;
    const p = state.progress;
    const yaw = -.35 + phase * .28 + p * 1.2 + state.pointerX * .12;
    const pitch = .75 + Math.sin(phase * .4) * .13 + p * .45 + state.pointerY * .1;
    const roll = -.45 + p * .7;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
    const cr = Math.cos(roll), sr = Math.sin(roll);
    const project = (u, v) => {
      const wave = Math.sin(u * 3 + phase) * (.22 + p * .16);
      const radius = 1.48 + (.58 + .12 * Math.sin(u * 2 + phase)) * Math.cos(v);
      let x = radius * Math.cos(u), y = radius * Math.sin(u), z = .72 * Math.sin(v) + wave;
      let ax = x * cy + z * sy, az = z * cy - x * sy;
      let ay = y * cx - az * sx; az = y * sx + az * cx;
      x = ax * cr - ay * sr; y = ax * sr + ay * cr;
      const perspective = 4.8 / (4.8 - az * .45);
      return [w * .5 + x * size * perspective, h * .51 + y * size * perspective];
    };
    const glow = ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,size*2.4);
    glow.addColorStop(0,'rgba(125,220,35,.045)'); glow.addColorStop(1,'rgba(125,220,35,0)');
    ctx.fillStyle=glow; ctx.fillRect(0,0,w,h);
    const lines = innerWidth < 801 ? 32 : 50, samples = innerWidth < 801 ? 90 : 120;
    for (let i=0;i<lines;i++) {
      const v=i/lines*Math.PI*2;
      ctx.beginPath();
      for(let j=0;j<=samples;j++) {
        const point=project(j/samples*Math.PI*2,v);
        j ? ctx.lineTo(...point) : ctx.moveTo(...point);
      }
      const bright=.22+.62*(.5+.5*Math.sin(v+phase*.2));
      ctx.strokeStyle=`rgba(189,255,59,${bright})`;
      ctx.lineWidth=i%8===0?1.25:.65; ctx.stroke();
    }
    // Sparse meridians make the surface read as an engineered lattice.
    for(let i=0;i<24;i++) {
      ctx.beginPath();
      for(let j=0;j<=42;j++) {
        const point=project(i/24*Math.PI*2,j/42*Math.PI*2);
        j?ctx.lineTo(...point):ctx.moveTo(...point);
      }
      ctx.strokeStyle='rgba(215,255,155,.14)';ctx.lineWidth=.6;ctx.stroke();
    }
    for(let i=0;i<18;i++) {
      const angle=i*2.399+phase*.09, radius=size*(2.3+.25*Math.sin(i*7));
      const x=w*.5+Math.cos(angle)*radius,y=h*.51+Math.sin(angle)*radius*.78;
      ctx.fillStyle=i%4===0?'#c6ff72':'#4e6d35';ctx.fillRect(x,y,i%4===0?2:1,i%4===0?2:1);
    }
  }
}
const field = new SignalField($("#signal-canvas"));
// Shared portal geometry connects the chapters without loading another canvas.
const chapters = $$("#studio,#pinyoursite,#avatar,#services,#plans,#about,#brief");
chapters.forEach((section,index)=>{
  const portal=document.createElement("div");
  portal.className="chapter-portal";
  portal.setAttribute("aria-hidden","true");
  portal.innerHTML='<svg viewBox="0 0 1000 600" fill="none">'+Array.from({length:16},(_,i)=>`<ellipse cx="500" cy="300" rx="${90+i*23}" ry="${55+i*14}" transform="rotate(${i*4} 500 300)"/>`).join('')+'</svg><span>0'+(index+1)+' / NEXT DIMENSION</span>';
  section.prepend(portal);
});

function animateServices() {
  serviceContext?.revert();
  const reel = $('.service-reel'), cards = $$('.service-row');
  reel.classList.remove('scroll-sequence');
  cards.forEach(card => { card.inert = false; });
  if (innerHeight < 620 || paused || reduce.matches) return;
  serviceContext = gsap.context(() => {
    reel.classList.add('scroll-sequence');
    gsap.set(cards, {autoAlpha:0, y:60, scale:.94, rotationX:5});
    gsap.set(cards[0], {autoAlpha:1,y:0,scale:1,rotationX:0});
    const timeline = gsap.timeline({scrollTrigger:{
      trigger:reel, start:()=>`top top+=${innerWidth>800?100:82}`,
      end:()=>`+=${(cards.length-1)*innerHeight*.58}`, pin:true,
      scrub:.18, anticipatePin:1, invalidateOnRefresh:true,
      onUpdate:self=>{
        const active=Math.min(cards.length-1,Math.round(self.progress*(cards.length-1)));
        cards.forEach((card,i)=>{card.inert=i!==active;});
        $('#reel-count').textContent=String(active+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
        reel.style.setProperty('--sequence-progress',self.progress);
      }
    }});
    cards.slice(1).forEach((card,i)=>{
      const at=i+.38;
      timeline.to(cards[i],{autoAlpha:0,y:-55,scale:.95,rotationX:-5,duration:.18,ease:'power1.in'},at)
        .to(card,{autoAlpha:1,y:0,scale:1,rotationX:0,duration:.28,ease:'power2.out'},at+.18);
    });
    timeline.to({}, {duration:.2});
    return ()=>{reel.classList.remove('scroll-sequence');cards.forEach(card=>{card.inert=false;});};
  });
}

function start() {
  if (context || paused || reduce.matches) return;
  document.body.classList.add("signal-motion");
  // Static canvas fallback; the persistent WebGL scene owns animated rendering.
  field.setRunning(false);
  context = gsap.context(() => {
    if (fine.matches) {
      lenis = new Lenis({ duration: .65, smoothWheel: true, prevent: node => !!node.closest("dialog,[data-lenis-prevent]") });
      const raf = time => lenis?.raf(time * 1000);
      gsap.ticker.add(raf);
      lenis.on("scroll", ScrollTrigger.update);
      cleanup.push(() => { gsap.ticker.remove(raf); lenis?.destroy(); lenis=null; });
    }
    const intro=gsap.timeline({defaults:{ease:"power3.out"}});
    intro.from(".hero-kicker",{opacity:0,y:20,duration:.7})
      .from(".hero h1 > span",{yPercent:65,opacity:0,rotationX:-16,transformOrigin:"50% 100%",duration:1.05,stagger:.11},.1)
      .from(".hero-copy > p,.hero-actions",{y:25,opacity:0,duration:.8,stagger:.12},.6)
      .from(".signal-art",{opacity:0,scale:.83,duration:1.6},.15);

    media=gsap.matchMedia();
    media.add({wide:"(min-width:801px)",tall:"(min-height:720px)"}, ({conditions}) => {
      const {wide,tall}=conditions;
      const heroTimeline=gsap.timeline({scrollTrigger:{
        trigger:".signal-hero",start:()=>`top top+=${wide?84:70}`,
        end:()=>`+=${innerHeight*(wide?1.4:1.05)}`,pin:true,scrub:.6,anticipatePin:1,invalidateOnRefresh:true,
      }});
      gsap.set(".hero-next",{autoAlpha:0,y:70});
      heroTimeline.to(".hero-copy",{y:-90,autoAlpha:0,duration:.28,ease:"power2.in"},.08)
        .to(field.state,{progress:1,duration:1,ease:"none"},0)
        .to(".signal-art",{xPercent:wide?-10:-15,yPercent:wide?0:4,scale:wide?1.32:1.22,duration:.9,ease:"power1.inOut"},0)
        .to(".signal-reticle",{rotation:90,scale:1.15,duration:1,ease:"none"},0)
        .to(".hero-next",{autoAlpha:1,y:0,duration:.3,ease:"power2.out"},.38)
        .fromTo(".signal-chips span",{x:40,opacity:.35},{x:0,opacity:1,stagger:.06,duration:.25},.5)
        .to(".hero-scroll-meter span",{scaleX:1,duration:1,ease:"none"},0)
        .to({}, {duration:.15});

      const gallery=$(".work-gallery");
      if(tall) {
        const travel=()=>Math.max(0,gallery.scrollWidth-$(".work-stage").clientWidth+(wide?innerWidth*.1:44));
        const horizontal=gsap.to(gallery,{x:()=>-travel(),ease:"none",scrollTrigger:{
          trigger:".work-stage",start:()=>`top top+=${wide?84:70}`,end:()=>`+=${travel()*(wide?1.15:1.35)}`,
          pin:true,scrub:.7,anticipatePin:1,invalidateOnRefresh:true,
          onUpdate:self=>{$(".work-current").textContent=String(Math.min(3,1+Math.floor(self.progress*3))).padStart(2,"0");},
        }});
        gsap.fromTo(".work-progress span",{scaleX:0},{scaleX:1,ease:"none",scrollTrigger:{
          trigger:".work-stage",start:()=>`top top+=${wide?84:70}`,end:()=>`+=${travel()*(wide?1.15:1.35)}`,scrub:.7,
        }});
        $$(".work-card").forEach(card=>{
          gsap.fromTo(card.querySelector("img"),{xPercent:-3,scale:1.12},{xPercent:3,scale:1,ease:"none",scrollTrigger:{
            trigger:card,containerAnimation:horizontal,start:"left right",end:"right left",scrub:true,
          }});
        });
      } else {
        // Short landscape windows get a normal grid rather than a clipped pinned scene.
        $(".work-stage").classList.add("work-static");
        return ()=>$(".work-stage").classList.remove("work-static");
      }
    });

    $$(".section-heading h2,.avatar-copy h2,#about h2,.brief-section h2").forEach(heading=>{
      const split=SplitText.create(heading,{type:"lines",mask:"lines",autoSplit:true,onSplit:self=>gsap.from(self.lines,{
        yPercent:105,rotation:2,transformOrigin:"left",duration:1,stagger:.11,ease:"power3.out",
        scrollTrigger:{trigger:heading,start:"top 88%",once:true},
      })});
      cleanup.push(()=>split.revert());
    });
    $$(".section-heading > p,.film-editorial,.film-player-wrap,.film-choice,.property-copy,.avatar-facts,.avatar-offer,.founder-photo,.process-grid article,#brief-form,.faq-section details").forEach((el,i)=>{
      gsap.from(el,{y:45,opacity:0,duration:.9,delay:(i%3)*.05,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 92%",once:true}});
    });
    gsap.fromTo(".property-window",{rotationX:12,rotationY:-10,scale:.86,transformPerspective:1200},{rotationX:0,rotationY:0,scale:1,ease:"none",scrollTrigger:{trigger:".property-showcase",start:"top 88%",end:"top 25%",scrub:.7}});
    gsap.fromTo(".avatar-image > img",{scale:1.15,yPercent:-4},{scale:1,yPercent:0,ease:"none",scrollTrigger:{trigger:".avatar-image",start:"top bottom",end:"bottom top",scrub:.7}});
    gsap.fromTo(".manifesto h2 span",{xPercent:-12},{xPercent:0,stagger:.08,ease:"none",scrollTrigger:{trigger:".manifesto",start:"top 95%",end:"top 10%",scrub:.6}});
    gsap.fromTo(".manifesto h2 em",{xPercent:14},{xPercent:0,stagger:.08,ease:"none",scrollTrigger:{trigger:".manifesto",start:"top 80%",end:"top -10%",scrub:.6}});
    gsap.to(".manifesto-vector",{rotation:150,ease:"none",scrollTrigger:{trigger:".manifesto",start:"top bottom",end:"bottom top",scrub:1}});
    $$(".plan").forEach((el,i)=>gsap.from(el,{y:70,rotationX:8,transformPerspective:1000,opacity:0,duration:.9,delay:(i%3)*.07,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 94%",once:true}}));
    gsap.fromTo(".footer-word",{yPercent:40,scale:.9},{yPercent:0,scale:1,ease:"none",scrollTrigger:{trigger:"footer",start:"top 95%",end:"bottom bottom",scrub:.6}});
    gsap.to(".ticker > div",{xPercent:-15,ease:"none",scrollTrigger:{trigger:".ticker",start:"top bottom",end:"bottom top",scrub:1}});
    chapters.forEach((section,index)=>{
      const portal=section.querySelector('.chapter-portal');
      gsap.fromTo(portal,{scale:.55,rotation:-18,opacity:.05},{scale:1.4,rotation:30,opacity:.3,ease:'none',scrollTrigger:{trigger:section,start:'top bottom',end:'top 10%',scrub:.7}});
      gsap.to(portal,{yPercent:40,ease:'none',scrollTrigger:{trigger:section,start:'top top',end:'bottom top',scrub:.8}});
      gsap.fromTo(portal.querySelector('svg'),{rotationY:index%2?-35:35},{rotationY:index%2?25:-25,transformPerspective:900,ease:'none',scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:.8}});
    });
    if(fine.matches) {
      const mx=gsap.quickTo(field.state,"pointerX",{duration:.8}),my=gsap.quickTo(field.state,"pointerY",{duration:.8});
      const move=e=>{mx((e.clientX/innerWidth-.5)*2);my((e.clientY/innerHeight-.5)*2);};
      $(".signal-hero").addEventListener("pointermove",move,{passive:true});
      cleanup.push(()=>$(".signal-hero").removeEventListener("pointermove",move));
    }
  });
  animateServices();
  serviceObserver=new MutationObserver(()=>{animateServices();ScrollTrigger.refresh();});
  serviceObserver.observe($("#service-grid"),{childList:true});
  ScrollTrigger.refresh();
}

function stop() {
  serviceObserver?.disconnect(); serviceContext?.revert(); serviceContext=null;
  media?.revert();media=null;
  context?.revert();context=null;
  cleanup.forEach(fn=>fn());cleanup=[];
  document.body.classList.remove("signal-motion");
  field.state.progress=0;field.setRunning(false);field.draw();
  $(".work-current").textContent="01";
}
function sync() {
  const off=paused||reduce.matches;
  document.body.classList.toggle("motion-paused",off);
  $(".motion-toggle").setAttribute("aria-pressed",String(off));
  $(".motion-toggle").innerHTML=off?'Resume motion <span>▶</span>':'Pause motion <span>Ⅱ</span>';
  off?stop():start();
}
$(".motion-toggle").addEventListener("click",()=>{paused=!paused;sync();});
reduce.addEventListener("change",()=>{paused=reduce.matches;sync();});
new MutationObserver(()=>{if(lenis)document.body.classList.contains("modal-open")?lenis.stop():lenis.start();}).observe(document.body,{attributes:true,attributeFilter:["class"]});

// Recalculate anchor positions after pinning; preserve the service dialog routes.
document.addEventListener("click",event=>{
  const link=event.target.closest('a[href^="#"]');
  if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey)return;
  const hash=link.getAttribute("href");
  if(hash.startsWith("#service/"))return;
  const target=hash==="#"?document.body:document.getElementById(hash.slice(1));
  if(!target)return;
  if(target.matches('details'))target.open=true;
  event.preventDefault();
  const offset=innerWidth>800?84:70;
  const y=hash==="#"?0:target.getBoundingClientRect().top+scrollY-offset;
  lenis?lenis.scrollTo(y,{duration:1.15}):window.scrollTo({top:y,behavior:paused||reduce.matches?"instant":"smooth"});
  history.pushState(null,"",hash);
});
let progressFrame=0;
const updateProgress=()=>{
  progressFrame=0;
  $(".scroll-progress").style.transform=`scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`;
};
window.addEventListener("scroll",()=>{if(!progressFrame)progressFrame=requestAnimationFrame(updateProgress);},{passive:true});
document.fonts.ready.then(()=>{
  sync();updateProgress();
  if(location.hash.length>1&&!location.hash.startsWith("#service/")) {
    const target=document.getElementById(location.hash.slice(1));
    if(target)requestAnimationFrame(()=>{const y=target.getBoundingClientRect().top+scrollY-(innerWidth>800?84:70);lenis?lenis.scrollTo(y,{immediate:true}):window.scrollTo(0,y);});
  }
});
