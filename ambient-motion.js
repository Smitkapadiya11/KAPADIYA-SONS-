// One continuous field follows the visitor through every chapter.
const canvas=document.createElement('canvas');
canvas.id='ambient-field';canvas.setAttribute('aria-hidden','true');
document.body.prepend(canvas);
const ctx=canvas.getContext('2d');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let width=0,height=0,frame=0,time=0,last=0,scroll=window.scrollY,velocity=0;
const pointer={x:.65,y:.5,tx:.65,ty:.5};
const pulses=[];
function resize(){width=innerWidth;height=innerHeight;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);draw();}
function draw(){
 ctx.clearRect(0,0,width,height);
 const chapter=scroll/Math.max(height,1),phase=chapter*.8;
 const centerX=width*(.5+.23*Math.sin(phase)),centerY=height*.5;
 const radius=Math.min(width,height)*(.3+.06*Math.sin(phase*.7));
 const mx=pointer.x*width,my=pointer.y*height;
 // A lattice opens into a tunnel, then folds into flowing ribbons as you scroll.
 for(let row=0;row<30;row++){
  ctx.beginPath();
  for(let col=0;col<=90;col++){
   const angle=col/90*Math.PI*2;
   const ring=radius*(.35+row*.045);
   const wave=Math.sin(angle*3+phase+time*.3)*ring*.13;
   let x=centerX+Math.cos(angle+phase*.15)*(ring+wave);
   let y=centerY+Math.sin(angle)*(ring+wave)*(.5+.3*Math.sin(phase*.3))+Math.sin(angle*2+phase)*row*2;
   const dx=x-mx,dy=y-my,dist=Math.hypot(dx,dy),influence=Math.exp(-dist*dist/40000);
   x+=dx*influence*.42;y+=dy*influence*.42;
   x+=Math.sin(row*.2+time)*velocity*.08;
   col?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.closePath();ctx.strokeStyle=`rgba(174,255,63,${.12+row/120})`;ctx.lineWidth=row%6===0?1.2:.65;ctx.stroke();
 }
 // The dot grid bends around mouse and finger positions.
 const spacing=width<600?48:64;
 for(let x=spacing/2;x<width;x+=spacing)for(let y=spacing/2;y<height;y+=spacing){
  const dx=x-mx,dy=y-my,dist=Math.hypot(dx,dy),force=Math.max(0,1-dist/190);
  ctx.fillStyle=`rgba(196,255,131,${.12+force*.6})`;
  ctx.beginPath();ctx.arc(x+dx*force*.18,y+dy*force*.18,1+force*2,0,Math.PI*2);ctx.fill();
 }
 for(let i=pulses.length-1;i>=0;i--){const p=pulses[i];p.age+=.018;if(p.age>1){pulses.splice(i,1);continue;}ctx.beginPath();ctx.arc(p.x,p.y,p.age*280,0,Math.PI*2);ctx.strokeStyle=`rgba(189,255,59,${(1-p.age)*.5})`;ctx.lineWidth=1;ctx.stroke();}
}
function tick(now){frame=0;if(document.hidden||reduce.matches||document.body.classList.contains('motion-paused'))return;const dt=Math.min(40,now-last||16);last=now;time+=dt*.001;pointer.x+=(pointer.tx-pointer.x)*.075;pointer.y+=(pointer.ty-pointer.y)*.075;velocity*=.91;draw();frame=requestAnimationFrame(tick);}
function sync(){cancelAnimationFrame(frame);frame=0;if(!document.hidden&&!reduce.matches&&!document.body.classList.contains('motion-paused'))frame=requestAnimationFrame(tick);else draw();}
window.addEventListener('pointermove',e=>{pointer.tx=e.clientX/width;pointer.ty=e.clientY/height;},{passive:true});
window.addEventListener('pointerdown',e=>{pointer.tx=e.clientX/width;pointer.ty=e.clientY/height;if(!reduce.matches&&!document.body.classList.contains('motion-paused')){pulses.push({x:e.clientX,y:e.clientY,age:0});if(pulses.length>4)pulses.shift();}},{passive:true});
window.addEventListener('scroll',()=>{const next=window.scrollY;velocity=Math.max(-80,Math.min(80,next-scroll));scroll=next;if(!matchMedia('(pointer:fine)').matches){pointer.tx=.5+.3*Math.sin(scroll/700);pointer.ty=.5+.2*Math.cos(scroll/900);}},{passive:true});
window.addEventListener('resize',resize,{passive:true});
document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
resize();sync();
