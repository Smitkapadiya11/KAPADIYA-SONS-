import {createTimeline} from 'animejs';
import './cinema.css';
requestAnimationFrame(()=>{
 const rail=document.querySelector('.cinema-rail'),stage=rail.querySelector('.cinema-stage');
 const cards=[...rail.querySelectorAll('.cinema-card')],outro=rail.querySelector('.cinema-outro'),buttons=[...rail.querySelectorAll('[data-cinema-step]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const stops=[0,.23,.48,.72,1];
 const copy=[['01 / CREATE ATTENTION','Give your story<br>a bigger stage.','Creator-style content, AI films and campaign visuals.'],['02 / BUILD CONNECTION','Make every<br>interaction count.','Websites and landing pages with a clear next step.'],['03 / CREATE CAPACITY','Let the routine<br>take care of itself.','Scoped automation, customer workflows and useful software.']];
 let timeline,enabled=false,queued=false,last=-1,width=innerWidth,selected=-1;
 const clamp=v=>Math.max(0,Math.min(1,v));
 function build(){
  timeline?.revert();enabled=!reduced.matches&&!document.body.classList.contains('static-motion');rail.classList.toggle('cinema-enabled',enabled);last=-1;
  rail.querySelector('#cinema-pause').textContent=enabled?'Pause motion':'Resume motion';rail.querySelector('#cinema-pause').setAttribute('aria-pressed',String(!enabled));
  outro.inert=false;if(!enabled)return;
  const w=stage.clientWidth,h=stage.clientHeight,mobile=w<=800;
  const side=w*(mobile?.85:.72),fan=w*(mobile?.23:.29),base=h*(mobile?0:.1);
  timeline=createTimeline({autoplay:false,defaults:{ease:'inOutCubic'}});
  timeline.add('.cinema-intro',{y:[0,-h*.22],scale:[1,1.13],opacity:[1,0],duration:700},100);
  cards.forEach((card,i)=>{
   const positions=[-w*.22,0,w*.22],rotations=[-18,8,20];
   timeline.add(card,{x:[positions[i],i===0?0:side*(i===1?1:1.5)],y:[h*.26,base],scale:[mobile?.58:.5,i===0?1.08:.65],rotate:[rotations[i],i===0?0:12],rotateY:[i===0?25:-20,i===0?0:-38],opacity:[.42,i===0?1:.35],duration:1000},0);
  });
  timeline.add(cards[0],{x:-side,scale:.62,rotate:-12,rotateY:35,opacity:.3,duration:950},1250);
  timeline.add(cards[1],{x:0,y:base,scale:1.08,rotate:0,rotateY:0,opacity:1,duration:950},1250);
  timeline.add(cards[2],{x:side,y:base,scale:.65,rotate:12,rotateY:-38,opacity:.35,duration:950},1250);
  timeline.add(cards[0],{x:-side*1.5,opacity:0,duration:950},2450);
  timeline.add(cards[1],{x:-side,scale:.62,rotate:-12,rotateY:35,opacity:.3,duration:950},2450);
  timeline.add(cards[2],{x:0,y:base,scale:1.08,rotate:0,rotateY:0,opacity:1,duration:950},2450);
  cards.forEach((card,i)=>timeline.add(card,{x:(i-1)*fan,y:-h*.12,scale:mobile?.43:.45,rotate:(i-1)*8,rotateY:0,opacity:1,duration:1000},3650));
  timeline.add('.cinema-caption',{opacity:[0,1],y:[40,0],duration:500},600);
  timeline.add('.cinema-caption',{opacity:0,y:30,duration:400},3650);
  timeline.add('.cinema-outro',{y:[70,0],opacity:[0,1],duration:700},3950);
  timeline.add('.cinema-grid',{rotate:[-15,10],scale:[1,1.25],opacity:[.25,.5],duration:4650,ease:'linear'},0);
  update();
 }
 function update(){
  queued=false;if(!enabled)return;
  const r=rail.getBoundingClientRect();const p=clamp(-r.top/Math.max(1,rail.offsetHeight-stage.offsetHeight));if(Math.abs(p-last)<.00001)return;last=p;
  timeline.seek(p*4650);
  const chapter=p<.36?0:p<.62?1:2;
  if(selected!==chapter){selected=chapter;document.querySelector('#cinema-chapter').textContent=copy[chapter][0];document.querySelector('#cinema-caption-title').innerHTML=copy[chapter][1];document.querySelector('#cinema-caption-copy').textContent=copy[chapter][2];}
  const step=p<.12?0:p<.36?1:p<.62?2:p<.85?3:4;
  buttons.forEach((b,i)=>b.setAttribute('aria-current',step===i?'step':'false'));
  rail.querySelector('.cinema-percent').textContent=String(Math.round(p*100)).padStart(3,'0')+'%';
  rail.style.setProperty('--cinema-progress',String(p));outro.inert=p<.85;
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(update)}}
 buttons.forEach((b,i)=>b.addEventListener('click',()=>{const start=rail.getBoundingClientRect().top+scrollY;scrollTo({top:start+(rail.offsetHeight-stage.offsetHeight)*stops[i],behavior:'instant'});update()}));
 rail.querySelector('#cinema-pause').addEventListener('click',()=>document.querySelector('.motion-toggle').click());
 addEventListener('scroll',queue,{passive:true});
 addEventListener('resize',()=>{if(Math.abs(width-innerWidth)>2){width=innerWidth;build()}else queue()});
 let previous=document.body.classList.contains('static-motion');new MutationObserver(()=>{const next=document.body.classList.contains('static-motion');if(next!==previous){previous=next;build()}}).observe(document.body,{attributes:true,attributeFilter:['class']});
 reduced.addEventListener('change',build);build();
});
