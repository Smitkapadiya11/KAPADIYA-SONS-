import {animate} from 'animejs';
import './atelier.css';
const directions={
 notice:{image:'ugc',alt:'AI-generated Indian creator presenting a festive gift box',label:'01 — ATTENTION',small:'CREATOR-STYLE STORIES',title:'A product.<br>A reason to care.',note:'Hooks, product demonstrations and a clear next step.',cta:'Explore creative production',service:'ugc'},
 enquiries:{image:'websites',alt:'AI concept of an Indian studio reviewing a responsive website',label:'02 — CONNECTION',small:'PURPOSEFUL DIGITAL EXPERIENCES',title:'The right offer.<br>The next conversation.',note:'Responsive pages, clear offers and relevant enquiry paths.',cta:'Explore websites & landing pages',service:'websites'},
 time:{image:'automation',alt:'AI concept of Indian professionals reviewing a business workflow',label:'03 — MOMENTUM',small:'SYSTEMS WITH A PURPOSE',title:'Less repeat work.<br>More room to grow.',note:'Connect routine tasks so your team can focus on the work that matters.',cta:'Explore business automation',service:'automation'}
};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const buttons=[...document.querySelectorAll('[data-direction]')];
let imageAnimation,captionAnimation,current='notice';
function choose(key){
 if(current===key)return;current=key;const d=directions[key];
 imageAnimation?.revert();captionAnimation?.revert();
 const image=document.querySelector('#direction-image');image.src='/images/services/'+d.image+'.webp';image.srcset='/images/services/'+d.image+'-600.webp 600w, /images/services/'+d.image+'.webp 1536w';image.alt=d.alt;
 document.querySelector('#direction-panel').setAttribute('aria-labelledby','direction-'+key);
 document.querySelector('#direction-counter').textContent=d.label;document.querySelector('#direction-small').textContent=d.small;document.querySelector('#direction-title').innerHTML=d.title;document.querySelector('#direction-note').textContent=d.note;
 const cta=document.querySelector('#direction-cta');cta.href='#service/'+d.service;cta.innerHTML=d.cta+' <span>↗</span>';
 buttons.forEach(b=>{const selected=b.dataset.direction===key;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1});
 if(!reduced.matches&&!document.body.classList.contains('static-motion')){
  imageAnimation=animate('.direction-image-window',{opacity:[.35,1],scale:[1.04,1],duration:800,ease:'outExpo'});
  captionAnimation=animate('.direction-caption strong',{y:[20,0],opacity:[0,1],duration:700,ease:'outExpo'});
 }
}
buttons.forEach((button,i)=>{
 button.addEventListener('click',()=>choose(button.dataset.direction));
 button.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;buttons[index].focus();choose(buttons[index].dataset.direction)});
});
const visual=document.querySelector('.direction-visual');const fine=matchMedia('(pointer:fine)');
visual.addEventListener('pointermove',e=>{if(reduced.matches||!fine.matches||document.body.classList.contains('static-motion'))return;const r=visual.getBoundingClientRect();visual.style.setProperty('--look-x',((e.clientX-r.left)/r.width-.5)*6+'deg');visual.style.setProperty('--look-y',-((e.clientY-r.top)/r.height-.5)*5+'deg')});
visual.addEventListener('pointerleave',()=>{visual.style.setProperty('--look-x','0deg');visual.style.setProperty('--look-y','0deg')});
function stop(){if(reduced.matches||document.body.classList.contains('static-motion')){imageAnimation?.revert();captionAnimation?.revert();visual.style.setProperty('--look-x','0deg');visual.style.setProperty('--look-y','0deg')}}
new MutationObserver(stop).observe(document.body,{attributes:true,attributeFilter:['class']});reduced.addEventListener('change',stop);

const run=document.querySelector('#run-workflow');let demoTimer,demoAnimation;
const nodeEls=[...document.querySelectorAll('[data-demo-node]')];
const stages=[['ENQUIRY CAPTURED','A structured enquiry record keeps the original message and source together.'],['NEXT STEP ASSIGNED','An agreed owner and pipeline stage make responsibility clear.'],['FOLLOW-UP PREPARED','A relevant response is ready for review. Your team stays in control.']];
function demoStep(index){nodeEls.forEach((el,i)=>el.classList.toggle('demo-complete',i<=index));document.querySelector('#demo-status-label').textContent=stages[index][0];document.querySelector('#demo-status').textContent=stages[index][1];if(!reduced.matches&&!document.body.classList.contains('static-motion')){demoAnimation?.revert();demoAnimation=animate(nodeEls[index],{y:[12,0],duration:550,ease:'outExpo'})}}
run.addEventListener('click',()=>{
 clearTimeout(demoTimer);run.disabled=true;nodeEls.forEach(el=>el.classList.remove('demo-complete'));let step=0;
 const advance=()=>{demoStep(step++);if(step<stages.length){demoTimer=setTimeout(advance,reduced.matches||document.body.classList.contains('static-motion')?0:1050)}else{run.disabled=false;run.innerHTML='Replay the example <span>↗</span>'}};advance();
});
