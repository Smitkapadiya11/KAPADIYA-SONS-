import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {Flip} from 'gsap/Flip';
import './offers.css';
gsap.registerPlugin(ScrollTrigger,Flip);
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');
const tabs=[...document.querySelectorAll('[data-category]')],panels=[...document.querySelectorAll('.offer-category')];
let context,active=0,disabled=false,observer,scrollFrame=false;
function select(index,moveFocus=false){
 if(index!==active){const marker=document.querySelector('.offer-indicator'),state=Flip.getState(marker);active=index;tabs[index].append(marker);if(!disabled)Flip.from(state,{duration:.5,ease:'expo.out',absolute:true});}
 tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1});if(moveFocus)tabs[index].focus({preventScroll:true});
}
function go(index){select(index,true);const pin=ScrollTrigger.getById('offer-'+index);window.scrollTo({top:pin?pin.start:panels[index].getBoundingClientRect().top+scrollY-178,behavior:'instant'});}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>go(i));tab.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();go(e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowRight'?1:3))%4)})});
document.querySelectorAll('[data-offer-plan]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go(tabs.findIndex(t=>t.dataset.category===a.dataset.offerPlan));history.replaceState(null,'','#category-'+a.dataset.offerPlan)}));
function update(){scrollFrame=false;let index=0;panels.forEach((panel,i)=>{if(panel.getBoundingClientRect().top<innerHeight*.45)index=i});select(index)}
addEventListener('scroll',()=>{if(!scrollFrame){scrollFrame=true;requestAnimationFrame(update)}},{passive:true});
function setup(){
 context?.revert();observer?.disconnect();disabled=reduced.matches||document.body.classList.contains('static-motion');if(disabled)return;
 context=gsap.context(()=>{
  panels.forEach((panel,i)=>{
   const cards=panel.querySelectorAll('.offer-card');
   const deck=gsap.timeline({scrollTrigger:{trigger:panel,start:'top 88%',end:'top 28%',scrub:.6}});
   if(innerWidth>=1200)deck.fromTo(cards,{x:index=>((cards.length-1)/2-index)*200,y:85,rotation:index=>(index-(cards.length-1)/2)*8,scale:.88,opacity:1},{x:index=>((cards.length-1)/2-index)*70,y:25,rotation:index=>(index-(cards.length-1)/2)*5,scale:.96,opacity:1,duration:.45,ease:'none'}).to(cards,{x:0,y:0,rotation:0,scale:1,duration:.55,ease:'power2.out'});
   else deck.from(cards,{y:22,opacity:15,duration:1,ease:'none'});
   if(innerWidth>=1200&&innerHeight>=820)ScrollTrigger.create({id:'offer-'+i,trigger:panel,start:'top 180px',end:'+=220',pin:true,pinSpacing:true,invalidateOnRefresh:true});
   gsap.from(panel.querySelector('.rangoli path'),{strokeDashoffset:1,duration:1.5,ease:'power2.out',scrollTrigger:{trigger:panel,start:'top 70%',once:true}});
  });
  observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(!isIntersecting)return;const tl=gsap.timeline();tl.fromTo(target.querySelector('.was-price i'),{scaleX:0},{scaleX:1,duration:.5}).fromTo(target.querySelector('.offer-price'),{y:14,opacity:1},{y:0,opacity:1,duration:.65,ease:'expo.out'},.35).fromTo(target.querySelector('.savings-chip'),{y:6,opacity:1},{y:0,opacity:1,duration:.4},.75);observer.unobserve(target)}),{threshold:.3});
  document.querySelectorAll('.offer-card').forEach(card=>observer.observe(card));
 });ScrollTrigger.refresh();
}
requestAnimationFrame(setup);addEventListener('motion-preference',setup);reduced.addEventListener('change',setup);let width=innerWidth,timer;addEventListener('resize',()=>{if(width!==innerWidth){width=innerWidth;clearTimeout(timer);timer=setTimeout(setup,200)}});
document.querySelectorAll('.offer-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(disabled||!fine.matches)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;gsap.to(card,{rotateX:-y*12,rotateY:x*12,duration:.6,overwrite:'auto'});card.style.setProperty('--sheen-x',x*160+'px');card.style.setProperty('--sheen-y',y*160+'px')});card.addEventListener('pointerleave',()=>gsap.to(card,{rotateX:0,rotateY:0,duration:.7}))});
const magnet=document.querySelector('.footer-invitation-action .button');magnet.addEventListener('pointermove',e=>{if(disabled||!fine.matches)return;const r=magnet.getBoundingClientRect();gsap.to(magnet,{x:(e.clientX-r.left-r.width/2)*.14,y:(e.clientY-r.top-r.height/2)*.2,duration:.5})});magnet.addEventListener('pointerleave',()=>gsap.to(magnet,{x:0,y:0,duration:.7,ease:'elastic.out(1,.5)'}));
const pool=document.createElement('div');pool.className='spark-pool';pool.setAttribute('aria-hidden','true');pool.innerHTML='<i></i>'.repeat(8);document.body.append(pool);let cursor=0,last=0;
for(const region of [document.querySelector('#plans'),document.querySelector('.footer-invitation')])region.addEventListener('pointermove',e=>{if(disabled||!fine.matches||performance.now()-last<65)return;last=performance.now();const particle=pool.children[cursor++%8];gsap.fromTo(particle,{x:e.clientX,y:e.clientY,opacity:.5,scale:1},{x:e.clientX+8,y:e.clientY-20,opacity:0,scale:.1,duration:.7,overwrite:true})});
