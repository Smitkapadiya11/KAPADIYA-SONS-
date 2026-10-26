import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(ScrollTrigger,SplitText);

const preference=matchMedia('(prefers-reduced-motion: reduce)');
let media, manualPause=false;
const header=document.querySelector('.site-header');
const contact=document.querySelector('.floating-contact');
const progress=document.querySelector('.reading-progress');
const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('.mobile-menu');
let scrollPending=false;
function updateChrome(){
  header.classList.toggle('is-scrolled',scrollY>90);
  const brief=document.querySelector('#brief').getBoundingClientRect();
  const footer=document.querySelector('footer').getBoundingClientRect();
  const cinema=document.querySelector('.cinema-rail')?.getBoundingClientRect();
  const offersRect=document.querySelector('#plans').getBoundingClientRect();
  const inOffers=offersRect.top<innerHeight&&offersRect.bottom>0;
  const inCinema=cinema&&cinema.top<innerHeight&&cinema.bottom>100;
  const showContact=!inOffers&&!inCinema&&scrollY>650&&!(brief.top<innerHeight&&brief.bottom>0)&&footer.top>=innerHeight;
  contact.classList.toggle('visible',showContact);
  contact.inert=!showContact;
  const length=document.documentElement.scrollHeight-innerHeight;
  progress.style.transform=`scaleX(${length>0?scrollY/length:0})`;
  scrollPending=false;
}
addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateChrome);}},{passive:true});
addEventListener('resize',updateChrome);updateChrome();
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');menu.classList.remove('open');menu.inert=true;document.body.classList.remove('menu-open');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');menu.classList.toggle('open',open);menu.inert=!open;document.body.classList.toggle('menu-open',open);});
menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){closeMenu();menuButton.focus();}if(e.key==='Tab'&&menu.classList.contains('open')){const last=menu.querySelector('a:last-child');if(!e.shiftKey&&document.activeElement===last){e.preventDefault();menuButton.focus();}else if(e.shiftKey&&document.activeElement===menuButton){e.preventDefault();last.focus();}}});
matchMedia('(min-width: 801px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

let SceneContext,founderLines;

function setupMotion(){
 founderLines?.revert();SceneContext?.revert();media?.revert();
 const disabled=manualPause||preference.matches;
 document.body.classList.toggle('motion-paused',disabled);
 document.body.classList.toggle('static-motion',disabled);
 window.dispatchEvent(new CustomEvent('motion-preference',{detail:{disabled}}));
 if(disabled)return;
 SceneContext=gsap.context(()=>{
  document.querySelectorAll('.process-grid article').forEach(el=>gsap.from(el,{y:35,opacity:1,duration:.9,scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
  const portrait=document.querySelector('.founder-art');
  if(!portrait.querySelector('.founder-sweep'))portrait.insertAdjacentHTML('beforeend','<div class="founder-sweep" aria-hidden="true"></div>');
  gsap.fromTo('.founder-sweep',{xPercent:-30,opacity:0},{xPercent:30,opacity:.9,duration:1.8,scrollTrigger:{trigger:portrait,start:'top 80%',once:true}});
  founderLines=SplitText.create('.founder-section h2',{type:'lines',mask:'lines',autoSplit:true,onSplit:self=>gsap.from(self.lines,{yPercent:100,stagger:.14,duration:1.1,ease:'expo.out',scrollTrigger:{trigger:portrait,start:'top 70%',once:true}})});
  gsap.from('.approach-lights i',{opacity:.12,scale:.5,stagger:.12,duration:.7,scrollTrigger:{trigger:'.footer-invitation',start:'top 85%',once:true}});
 });
 media=gsap.matchMedia();
 media.add('(min-width: 801px)',()=>{
  const track=document.querySelector('.studio-track');
  const tween=gsap.to(track,{xPercent:-66.66667,ease:'none',scrollTrigger:{id:'creative-worlds',trigger:'.studio-viewport',start:'top 100px',end:()=>'+='+innerWidth*1.8,pin:true,scrub:.6,invalidateOnRefresh:true,onUpdate:self=>{document.querySelector('.studio-count').textContent='0'+Math.min(3,Math.round(self.progress*2)+1)+' / 03';document.querySelector('.studio-meter>span').style.transform='scaleX('+((1+self.progress*2)/3)+')'}}});
  document.querySelectorAll('.world').forEach(world=>gsap.fromTo(world.querySelector('.world-aperture'),{scale:1,opacity:1},{scale:6,opacity:0,ease:'none',scrollTrigger:{trigger:world,containerAnimation:tween,start:'left 85%',end:'left 20%',scrub:true}}));
  return()=>tween.revert();
 });
 media.add('(max-width: 800px)',()=>{document.querySelectorAll('.world-image').forEach(el=>gsap.fromTo(el.querySelector('.world-aperture'),{scale:1,opacity:1},{scale:6,opacity:0,ease:'none',scrollTrigger:{trigger:el,start:'top 90%',end:'top 25%',scrub:true}}))});
 ScrollTrigger.refresh();
}
document.querySelectorAll('.world-image').forEach(el=>el.insertAdjacentHTML('beforeend','<svg class="world-aperture" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path fill-rule="evenodd" d="M0 0H100V100H0ZM50 30 56 44 70 50 56 56 50 70 44 56 30 50 44 44Z"/></svg>'));
requestAnimationFrame(()=>{
 const button=document.querySelector('.motion-toggle');
 button.addEventListener('click',()=>{manualPause=!manualPause;button.textContent=manualPause?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(manualPause));setupMotion()});
 setupMotion();document.fonts.ready.then(()=>ScrollTrigger.refresh());
 new MutationObserver(()=>ScrollTrigger.refresh()).observe(document.querySelector('#service-grid'),{childList:true});
});
preference.addEventListener('change',setupMotion);
addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
document.querySelectorAll('[data-world-dir]').forEach(button=>button.addEventListener('click',()=>{const trigger=ScrollTrigger.getById('creative-worlds');if(!trigger)return;const next=Math.max(0,Math.min(2,Math.round(trigger.progress*2)+Number(button.dataset.worldDir)));window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*next/2,behavior:'instant'})}));
document.querySelector('.studio-track').addEventListener('focusin',e=>{const trigger=ScrollTrigger.getById('creative-worlds'),world=e.target.closest('.world');if(!trigger||!world)return;const index=[...document.querySelectorAll('.world')].indexOf(world);window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*index/2,behavior:'instant'})});
