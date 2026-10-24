import { animate, stagger } from 'animejs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

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
  const inCinema=cinema&&cinema.top<innerHeight&&cinema.bottom>100;
  const showContact=!inCinema&&scrollY>650&&!(brief.top<innerHeight&&brief.bottom>0)&&footer.top>=innerHeight;
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

let animations=[], reveals, scrollScenes=[];
function track(target,params){const a=animate(target,params);animations.push(a);return a;}
function setupMotion(){
  media?.revert();reveals?.disconnect();
  animations.forEach(a=>a.revert());animations=[];scrollScenes=[];
  const disabled=manualPause||preference.matches;
  document.body.classList.toggle('motion-paused',disabled);
  document.body.classList.toggle('static-motion',disabled);
  document.querySelector('.studio-count').textContent='01 / 03';
  if(disabled)return;
  track('.hero-line>span',{y:['110%',0],rotate:[4,0],opacity:[0,1],duration:1300,delay:stagger(140),ease:'outExpo'});
  track('.hero-description,.hero-top',{y:[24,0],opacity:[0,1],duration:1000,delay:500,ease:'outExpo'});
  const hero=track('.hero-image',{scale:[1,1.16],y:[0,60],duration:1000,autoplay:false,ease:'linear'});
  scrollScenes.push({element:document.querySelector('.hero'),animation:hero,hero:true});
  reveals=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
    if(!isIntersecting)return;
    track(target,{y:[32,0],opacity:[.25,1],scale:[.97,1],duration:1000,ease:'outExpo'});
    reveals.unobserve(target);
  }),{threshold:.12});
  document.querySelectorAll('.section-heading,.diwali-heading,.diwali-picks>a,.process-grid article,.workflow-step,.founder-section>div:last-child,.footer-invitation').forEach(el=>reveals.observe(el));
  document.querySelectorAll('.world-image img,.founder-art img').forEach(el=>{
    const a=track(el,{scale:[1.07,1],y:[-18,18],duration:1000,autoplay:false,ease:'linear'});
    scrollScenes.push({element:el.parentElement,animation:a});
  });
  document.querySelectorAll('.world-info h3,.manifesto-copy').forEach(el=>{
    const a=track(el,{y:[38,-15],opacity:[.35,1],duration:1000,autoplay:false,ease:'linear'});
    scrollScenes.push({element:el,animation:a});
  });
  media=gsap.matchMedia();
  media.add('(min-width: 801px)',()=>{
    const worlds=[...document.querySelectorAll('.world')];
    const incoming=worlds.slice(1).map(el=>track(el,{clipPath:['inset(100% 0% 0% 0% round 36px)','inset(0% 0% 0% 0% round 36px)'],duration:1000,autoplay:false,ease:'linear'}));
    const outgoing=worlds.slice(0,2).map(el=>track(el,{scale:[1,.88],rotate:[0,-3],opacity:[1,.2],duration:1000,autoplay:false,ease:'linear'}));
    ScrollTrigger.create({id:'creative-worlds',trigger:'.studio-viewport',start:'top 90px',end:()=>'+='+Math.max(1800,innerHeight*2.5),pin:true,invalidateOnRefresh:true,onUpdate:self=>{
      incoming.forEach((a,i)=>{const phase=Math.max(0,Math.min(1,self.progress*2-i));a.seek(phase*1000);outgoing[i].seek(phase*1000);});
      document.querySelector('.studio-meter>span').style.transform='scaleX('+((1+self.progress*2)/3)+')';
      document.querySelector('.studio-count').textContent='0'+Math.min(3,Math.round(self.progress*2)+1)+' / 03';
    }});
    // Anime instances are not owned by GSAP's responsive context.
    // Revert them explicitly when the desktop breakpoint is left.
    return ()=>{
      const scoped=[...incoming,...outgoing];
      scoped.forEach(a=>a.revert());
      animations=animations.filter(a=>!scoped.includes(a));
    };
  });
  ScrollTrigger.refresh();updateScenes();
}
let sceneFrame=false;
function updateScenes(){
  sceneFrame=false;
  if(manualPause||preference.matches)return;
  scrollScenes.forEach(({element,animation,hero})=>{
    const r=element.getBoundingClientRect();
    const progress=hero?Math.max(0,Math.min(1,-r.top/r.height)):Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));
    animation.seek(progress*1000);
  });
}
addEventListener('scroll',()=>{if(!sceneFrame){sceneFrame=true;requestAnimationFrame(updateScenes);}},{passive:true});
addEventListener('resize',()=>{if(!sceneFrame){sceneFrame=true;requestAnimationFrame(updateScenes);}});

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
