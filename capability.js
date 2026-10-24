import { animate } from 'animejs';
import './capability.css';

requestAnimationFrame(()=>{
 const grid=document.querySelector('#service-grid');
 const section=document.querySelector('#services');
 const rail=document.createElement('div');rail.className='capability-rail';
 const stage=document.createElement('div');stage.className='capability-stage';
 grid.before(rail);rail.append(stage);stage.append(grid);
 const controls=document.createElement('nav');controls.className='capability-controller';controls.setAttribute('aria-label','Capability sequence');
 stage.append(controls);
 let cards=[],animations=[],active=-1,scheduled=false,enabled=false,lastWidth=innerWidth;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function select(index){
  if(active===index)return;active=index;
  cards.forEach((card,i)=>{card.inert=i!==index;card.setAttribute('aria-hidden',String(i!==index));card.classList.toggle('current-capability',i===index)});
  controls.querySelectorAll('[data-cap-step]').forEach((b,i)=>{b.setAttribute('aria-current',i===index?'step':'false');b.classList.toggle('active',i===index)});
  controls.querySelector('.capability-count').textContent=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
 }
 function update(){
  scheduled=false;if(!enabled)return;
  const start=rail.getBoundingClientRect().top+scrollY-100;
  const travel=rail.offsetHeight-stage.offsetHeight;
  const position=clamp((scrollY-start)/Math.max(1,travel),0,1)*(cards.length-1);
  const index=clamp(Math.floor(position+.5),0,cards.length-1);select(index);
  // The current scene is scrubbed directly by scroll position, not a timed entrance.
  animations.forEach((pair,i)=>{
    const distance=position-i;
    cards[i].classList.toggle('capability-neighbour',Math.abs(distance)<1.15&&i!==index);
    cards[i].style.zIndex=String(20-Math.round(Math.abs(distance)*10));
    pair.frame.seek(clamp((distance+1)/2,0,1)*2000);
    pair.image.seek(clamp(distance+.5,0,1)*1000);
  });
  controls.style.setProperty('--cap-progress',String(cards.length===1?1:position/(cards.length-1)));
 }
 function queue(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
 function rebuild(){
  animations.forEach(pair=>{pair.frame.revert();pair.image.revert()});animations=[];cards=[...grid.querySelectorAll('.service-card')];active=-1;
  enabled=!reduced.matches&&!document.body.classList.contains('static-motion');
  rail.classList.toggle('controlled',enabled);controls.hidden=!enabled;
  rail.style.setProperty('--cap-distance',Math.max(0,cards.length-1)*65+'svh');
  controls.innerHTML='<div class="capability-status"><span>SCROLL TO EXPLORE</span><strong class="capability-count">01 / '+String(cards.length).padStart(2,'0')+'</strong></div><div class="capability-steps">'+cards.map((c,i)=>'<button type="button" data-cap-step="'+i+'" aria-label="Show '+c.querySelector('.service-title').textContent+'"><span>'+String(i+1).padStart(2,'0')+'</span></button>').join('')+'</div><a class="capability-skip" href="#plans">Skip to plans ↘</a>';
  cards.forEach(card=>{
   card.inert=false;card.removeAttribute('aria-hidden');card.classList.remove('current-capability','capability-neighbour');card.style.removeProperty('z-index');
   if(enabled)animations.push({
    frame:animate(card,{x:[stage.clientWidth*.65,0,-stage.clientWidth*.65],scale:[.78,1,.78],rotateY:[-32,0,32],opacity:[.25,1,.25],duration:2000,autoplay:false,ease:'inOutSine'}),
    image:animate(card.querySelector('.service-art img'),{scale:[1.07,1],duration:1000,autoplay:false,ease:'linear'})
   });
  });
  if(enabled)update();
 }
 function go(index){
  const start=rail.getBoundingClientRect().top+scrollY-100;
  const travel=rail.offsetHeight-stage.offsetHeight;
  window.scrollTo({top:start+travel*index/Math.max(1,cards.length-1),behavior:'instant'});update();
 }
 controls.addEventListener('click',e=>{const b=e.target.closest('[data-cap-step]');if(b)go(Number(b.dataset.capStep))});
 controls.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?cards.length-1:clamp(active+(e.key==='ArrowRight'?1:-1),0,cards.length-1);go(next);controls.querySelectorAll('[data-cap-step]')[next].focus({preventScroll:true})});
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',()=>{if(Math.abs(lastWidth-innerWidth)>2){lastWidth=innerWidth;rebuild()}else queue()});
 new MutationObserver(rebuild).observe(grid,{childList:true});
 let wasPaused=document.body.classList.contains('static-motion');
 new MutationObserver(()=>{const paused=document.body.classList.contains('static-motion');if(paused!==wasPaused){wasPaused=paused;rebuild()}}).observe(document.body,{attributes:true,attributeFilter:['class']});
 reduced.addEventListener('change',rebuild);rebuild();
});
