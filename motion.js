import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const preference=matchMedia('(prefers-reduced-motion: reduce)');
let context, media, manualPause=false;
const header=document.querySelector('.site-header');
const contact=document.querySelector('.floating-contact');
const progress=document.querySelector('.reading-progress');
const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('.mobile-menu');
let scrollPending=false;
function updateChrome(){
  header.classList.toggle('is-scrolled',scrollY>90);
  const brief=document.querySelector('#brief').getBoundingClientRect();
  contact.classList.toggle('visible',scrollY>650&&!(brief.top<innerHeight&&brief.bottom>0));
  const length=document.documentElement.scrollHeight-innerHeight;
  progress.style.transform=`scaleX(${length>0?scrollY/length:0})`;
  scrollPending=false;
}
addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateChrome);}},{passive:true});
addEventListener('resize',updateChrome);updateChrome();
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menu.classList.remove('open');menu.inert=true;document.body.classList.remove('menu-open');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');menu.classList.toggle('open',open);menu.inert=!open;document.body.classList.toggle('menu-open',open);});
menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){closeMenu();menuButton.focus();}if(e.key==='Tab'&&menu.classList.contains('open')){const last=menu.querySelector('a:last-child');if(!e.shiftKey&&document.activeElement===last){e.preventDefault();menuButton.focus();}else if(e.shiftKey&&document.activeElement===menuButton){e.preventDefault();last.focus();}}});
matchMedia('(min-width: 801px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

function setupMotion(){
  media?.revert();context?.revert();
  const disabled=manualPause||preference.matches;
  document.body.classList.toggle('motion-paused',disabled);
  document.querySelector('.studio-count').textContent='01 / 03';
  document.querySelector('.studio-meter>span').style.transform='scaleX(.3333)';
  if(disabled){document.body.classList.add('static-motion');return;}
  document.body.classList.remove('static-motion');
  context=gsap.context(()=>{
    gsap.from('.hero-line>span',{yPercent:115,rotate:3,duration:1.35,stagger:.12,ease:'power4.out',clearProps:'transform'});
    gsap.from('.hero-description,.hero-top,.hero-orbit',{y:20,opacity:0,duration:1,delay:.55,stagger:.1,ease:'power2.out',clearProps:'opacity,transform'});
    gsap.to('.hero-image',{scale:1.15,yPercent:10,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.hero-content',{y:100,opacity:.15,ease:'none',scrollTrigger:{trigger:'.hero',start:'25% top',end:'bottom top',scrub:1}});
    gsap.from('.manifesto-copy',{y:65,opacity:.2,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top 85%',end:'top 25%',scrub:1}});
    gsap.to('.manifesto-star',{rotate:180,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.utils.toArray('.section-heading,.systems-section>div:first-child,.founder-section>div:last-child,.process>h2,.brief-section>div:first-child').forEach(el=>gsap.from(el,{y:45,opacity:0,duration:.85,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
    gsap.from('.workflow-step',{x:35,opacity:.25,stagger:.3,ease:'none',scrollTrigger:{trigger:'.workflow',start:'top 80%',end:'bottom 80%',scrub:.5}});
    gsap.from('.workflow-connector',{scaleY:0,ease:'none',scrollTrigger:{trigger:'.workflow',start:'top 75%',end:'bottom 65%',scrub:.5}});
    gsap.from('.workflow-result',{y:20,opacity:.2,ease:'none',scrollTrigger:{trigger:'.workflow-result',start:'top 90%',end:'top 65%',scrub:.5}});
    gsap.from('.founder-art img',{scale:1.15,ease:'none',scrollTrigger:{trigger:'.founder-art',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.from('.process-grid article',{y:50,opacity:0,stagger:.13,duration:.8,ease:'power3.out',scrollTrigger:{trigger:'.process-grid',start:'top 85%',once:true}});
    gsap.from('.footer-invitation>a',{y:60,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:'.footer-invitation',start:'top 90%',once:true}});
  });
  media=gsap.matchMedia();
  media.add('(min-width: 801px)',()=>{
    const track=document.querySelector('.studio-track');
    const viewport=document.querySelector('.studio-viewport');
    const distance=()=>track.scrollWidth-track.clientWidth;
    gsap.to(track,{x:()=>-distance(),ease:'none',scrollTrigger:{id:'creative-worlds',trigger:viewport,start:'top 90px',end:()=>`+=${distance()}`,pin:true,scrub:.8,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>{
      document.querySelector('.studio-meter>span').style.transform=`scaleX(${(1+self.progress*2)/3})`;
      document.querySelector('.studio-count').textContent=`0${Math.min(3,Math.round(self.progress*2)+1)} / 03`;
    }}});
  });
  media.add('(max-width: 800px)',()=>{
    gsap.utils.toArray('.world-image').forEach(el=>gsap.from(el.querySelector('img'),{scale:1.12,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:.7}}));
  });
  ScrollTrigger.refresh();
}

requestAnimationFrame(()=>{
  const button=document.querySelector('.motion-toggle');
  button.addEventListener('click',()=>{manualPause=!manualPause;button.textContent=manualPause?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(manualPause));setupMotion();});
  setupMotion();
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
  new MutationObserver(()=>ScrollTrigger.refresh()).observe(document.querySelector('#service-grid'),{childList:true});
  new MutationObserver(()=>ScrollTrigger.refresh()).observe(document.querySelector('#plan-grid'),{childList:true});
});
preference.addEventListener('change',setupMotion);
addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
document.querySelectorAll('[data-world-dir]').forEach(button=>button.addEventListener('click',()=>{
  const trigger=ScrollTrigger.getById('creative-worlds');
  if(!trigger)return;
  const next=Math.max(0,Math.min(2,Math.round(trigger.progress*2)+Number(button.dataset.worldDir)));
  window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*next/2,behavior:'smooth'});
}));
document.querySelector('.studio-track').addEventListener('focusin',e=>{
  const trigger=ScrollTrigger.getById('creative-worlds');
  const world=e.target.closest('.world');
  if(!trigger||!world)return;
  const index=[...document.querySelectorAll('.world')].indexOf(world);
  document.querySelector('.studio-viewport').scrollLeft=0;
  window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*index/2,behavior:'instant'});
});
