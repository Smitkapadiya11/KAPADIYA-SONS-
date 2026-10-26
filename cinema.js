import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {SplitText} from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
gsap.registerPlugin(ScrollTrigger,SplitText);
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');
const rail=document.querySelector('.light-hero'),art=document.querySelector('.light-art'),intro=document.querySelector('.ignition');
let context,smooth,ticker,split,disabled=false,resizeTimer;
const splitStatement=()=>{const text=document.querySelector('.manifesto-copy');if(text.dataset.split)return;text.dataset.split='true';text.setAttribute('aria-label',text.textContent);text.innerHTML=text.innerHTML.replaceAll('<br>',' ').replace(/<[^>]*>/g,'').split(/\s+/).filter(Boolean).map((w,i)=>`<span aria-hidden="true" class="statement-word ${i>8?'lamp-word':''}" data-word="${w}">${w}</span>`).join(' ')};
function setup(){
 context?.revert();split?.revert();smooth?.destroy();if(ticker)gsap.ticker.remove(ticker);
 disabled=reduced.matches||document.body.classList.contains('static-motion');rail.classList.toggle('is-scrubbed',!disabled);splitStatement();
 if(disabled){gsap.set('.statement-word',{'--lit':1});return;}
 if(fine.matches){smooth=new Lenis({lerp:.1,smoothWheel:true,syncTouch:false,anchors:{offset:-180},prevent:el=>Boolean(el.closest('dialog,.mobile-menu'))});smooth.on('scroll',ScrollTrigger.update);ticker=t=>smooth.raf(t*1000);gsap.ticker.add(ticker);}
 context=gsap.context(()=>{
  split=SplitText.create('.light-hero h1',{type:'words',mask:'words',autoSplit:true,onSplit:self=>gsap.from(self.words,{yPercent:105,rotate:2,duration:1,stagger:.065,ease:'expo.out',delay:.12})});
  const tl=gsap.timeline({scrollTrigger:{trigger:rail,start:'top top',end:'bottom bottom',scrub:.65}});
  tl.to(art,{scale:innerWidth<768?1.8:2.8,xPercent:innerWidth<768?-5:-18,ease:'none'},0).to('.light-hero-copy',{y:-90,opacity:0,ease:'none'},0).to('.light-halo',{opacity:1,scale:1.8,ease:'none'},0).to(art,{opacity:.08,duration:.22},.78);
  gsap.to('.statement-word',{'--lit':1,stagger:.08,ease:'none',scrollTrigger:{trigger:'.manifesto-copy',start:'top 80%',end:'bottom 35%',scrub:true}});
  const ribbon=document.querySelector('.ticker>div');
  ScrollTrigger.create({trigger:'.ticker',start:'top bottom',end:'bottom top',onUpdate:self=>{gsap.to(ribbon,{x:-self.progress*300,skewX:gsap.utils.clamp(-3,3,self.getVelocity()/700),duration:.4,overwrite:true});gsap.to(ribbon,{skewX:0,duration:.8,delay:.15,overwrite:'auto'})}});
 });ScrollTrigger.refresh();
}
requestAnimationFrame(()=>{
 const proxy=document.querySelector('#cinema-pause');proxy.addEventListener('click',()=>{document.querySelector('.motion-toggle').click();proxy.setAttribute('aria-pressed',document.querySelector('.motion-toggle').getAttribute('aria-pressed'));proxy.textContent=document.querySelector('.motion-toggle').textContent});
 setup();let seen=true;try{seen=sessionStorage.getItem('light-intro')==='seen';sessionStorage.setItem('light-intro','seen')}catch{}
 if(!seen&&!disabled&&scrollY<20){gsap.set(intro,{display:'grid'});const flash=gsap.timeline({onComplete:()=>intro.remove()}).from(intro.querySelector('i'),{scale:0,opacity:0,duration:.25}).to(intro,{opacity:0,duration:.65,delay:.1});const skip=()=>{flash.progress(1);removeEventListener('pointerdown',skip);removeEventListener('wheel',skip);removeEventListener('touchstart',skip);removeEventListener('scroll',skip)};addEventListener('pointerdown',skip,{once:true});addEventListener('wheel',skip,{once:true,passive:true});addEventListener('touchstart',skip,{once:true,passive:true});addEventListener('scroll',skip,{once:true,passive:true});}
});
addEventListener('motion-preference',setup);reduced.addEventListener('change',setup);
let previousWidth=innerWidth;addEventListener('resize',()=>{if(Math.abs(previousWidth-innerWidth)>2){previousWidth=innerWidth;clearTimeout(resizeTimer);resizeTimer=setTimeout(setup,180)}});
rail.addEventListener('pointermove',e=>{if(disabled||!fine.matches)return;gsap.to('.light-art img',{x:(e.clientX/innerWidth-.5)*16,y:(e.clientY/innerHeight-.5)*10,duration:1.2,overwrite:true})});rail.addEventListener('pointerleave',()=>gsap.to('.light-art img',{x:0,y:0,duration:1}));
addEventListener('deviceorientation',e=>{if(disabled||fine.matches||!Number.isFinite(e.gamma)||!Number.isFinite(e.beta))return;if(rail.getBoundingClientRect().bottom<0)return;gsap.to('.light-art img',{x:gsap.utils.clamp(-8,8,e.gamma/3),y:gsap.utils.clamp(-6,6,(e.beta-45)/5),duration:.8,overwrite:true})},{passive:true});
new MutationObserver(()=>{if(document.body.classList.contains('modal-open')||document.body.classList.contains('menu-open'))smooth?.stop();else smooth?.start()}).observe(document.body,{attributes:true,attributeFilter:['class']});
