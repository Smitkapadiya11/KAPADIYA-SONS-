import {projectTools} from './tools.js';
const $=s=>document.querySelector(s), scene=$('#scene'), modal=$('dialog');
const data=await fetch('inventory.json').then(r=>r.json());
const wings=Object.keys(data.wings).sort();
let wing='',floor=1,unit='',zoom=1,x=0,y=0,drag=null;
function reset(){zoom=1;x=y=0;move()}
function move(){scene.style.transform='translate('+x+'px,'+y+'px) scale('+zoom+')'}
function setZoom(n){zoom=Math.max(1,Math.min(6,n));if(zoom===1)x=y=0;move()}
function button(text,fn,parent){const b=document.createElement('button');b.textContent=text;b.onclick=fn;parent.append(b);return b}
function render(){
 const tower=data.wings[wing],units=tower?.units.filter(u=>u.floor==floor)||[],selected=units.find(u=>u.id===unit);
 const stock=tower?units:Object.values(data.wings).flatMap(w=>w.units);
 const counts={available:0,hold:0,sold:0};
 stock.forEach(u=>counts[u.status.includes('hold')?'hold':u.status]++);
 $('#status-key').setAttribute('aria-label',tower?'Current floor status':'Project status');
 [...$('#status-key').children].forEach((el,i)=>{const key=['available','hold','sold'][i];el.textContent='● '+key[0].toUpperCase()+key.slice(1)+' '+counts[key]});
 const portrait=!wing&&matchMedia('(max-width:650px) and (orientation:portrait)').matches;
 const width=portrait?1080:1920,height=portrait?1920:1080;
 scene.setAttribute('viewBox',[0,0,width,height].join(' '));
 scene.innerHTML='<image href="'+(wing||(portrait?'elevation-mobile':'elevation'))+'.webp" width="'+width+'" height="'+height+'"/>';
 const choices=$('#choices');choices.replaceChildren();$('#info').replaceChildren();$('h1').textContent=wing?'Wing '+wing+' · Floor '+floor:'Choose a wing';
 function hotspot(d,label,fn,status){if(!d)return;const path=document.createElementNS(scene.namespaceURI,'path');path.setAttribute('d',d);path.setAttribute('aria-label',label);path.setAttribute('role','button');path.setAttribute('tabindex','0');path.dataset.status=status||'wing';path.onclick=fn;path.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();fn()}};scene.append(path);
 const box=path.getBBox(), labelWidth=portrait?155:110;
 const holder=document.createElementNS(scene.namespaceURI,'foreignObject');
 holder.setAttribute('x',box.x+box.width/2-labelWidth/2);
 holder.setAttribute('y',tower&&box.y>500?box.y+box.height:Math.max(0,box.y-40));
 holder.setAttribute('width',labelWidth);holder.setAttribute('height',42);
 const marker=button(label,fn,holder);marker.className='marker';marker.dataset.status=status||'available';scene.append(holder)}
 if(!tower){wings.forEach(w=>{const fn=()=>{wing=w;floor=1;unit='';reset();render()};button('Wing '+w,fn,choices);hotspot(portrait?data.wings[w].mobileOutline:data.wings[w].outline,'Wing '+w,fn)})}
 else{button('← Wings',()=>{wing=unit='';reset();render()},choices);const sel=document.createElement('select');sel.ariaLabel='Floor';for(const f of [...new Set(tower.units.map(u=>u.floor))].sort((a,b)=>a-b))sel.add(new Option('Floor '+f,f,false,f==floor));sel.onchange=()=>{floor=+sel.value;unit='';render()};choices.append(sel);
 units.forEach(u=>{const fn=()=>{unit=u.id;render()};const b=button(u.id,fn,choices);b.classList.toggle('active',unit===u.id);hotspot(u.path,u.id,fn,u.status)})}
 if(selected){const p=document.createElement('p');p.textContent=[selected.id,selected.type,selected.area+' sq ft carpet',selected.facing,selected.baths+' baths',selected.parking+' parking',selected.status.replaceAll('_',' ')].join(' · ');const a=document.createElement('a');a.className='cta';a.textContent='Enquire on WhatsApp ↗';a.href='https://wa.me/917575807403?text='+encodeURIComponent('Hi Smit, I explored PinYourSite Apartments, Wing '+wing+', Floor '+floor+', '+unit+'. Please share details for my project.');$('#info').append(p,a)}
 document.body.classList.toggle('inside',Boolean(tower));
 document.querySelector('aside').hidden=!selected;
 const bar=$('#wingbar'),rail=$('#floors');bar.replaceChildren();rail.replaceChildren();
 $('#search').hidden=!tower;
 if(tower){
 button('← Elevation',()=>$('#home').click(),bar);
 wings.forEach(w=>button(w,()=>{wing=w;unit='';reset();render()},bar).classList.toggle('active',w===wing));
 const title=document.createElement('small');title.textContent='FLOORS';rail.append(title);
 for(let f=22;f>=1;f--){const b=button(f,()=>{floor=f;unit='';render()},rail);b.classList.toggle('active',f==floor)}
 if(selected)button('Close ×',()=>{unit='';render()},$('#info'));
 }
 if (!modal.classList.contains('gps-view')) history.replaceState(null,'',location.pathname+(wing?'?wing='+wing+'&floor='+floor+(unit?'&unit='+encodeURIComponent(unit):''):''))
}
const params=new URLSearchParams(location.search);if(wings.includes(params.get('wing'))){wing=params.get('wing');const list=data.wings[wing].units;floor=list.some(u=>u.floor==params.get('floor'))?Number(params.get('floor')):1;unit=list.find(u=>u.floor==floor&&u.id===params.get('unit'))?.id||''}render();
$('#plus').onclick=()=>setZoom(zoom+.5);$('#minus').onclick=()=>setZoom(zoom-.5);$('#compass').onclick=reset;$('#home').onclick=()=>{wing=unit='';reset();render()};
const viewport=$('#viewport');viewport.onwheel=e=>{e.preventDefault();setZoom(zoom-Math.sign(e.deltaY)*.2)};viewport.onpointerdown=e=>{if(e.target.closest('path,button'))return;drag=[e.clientX-x,e.clientY-y];viewport.setPointerCapture(e.pointerId)};viewport.onpointermove=e=>{if(drag){x=e.clientX-drag[0];y=e.clientY-drag[1];move()}};viewport.onpointerup=viewport.onpointercancel=()=>drag=null;
function show(title,html){$('article').innerHTML='<h2>'+title+'</h2>'+html;modal.showModal()}$('#close').onclick=()=>modal.close();
$('#share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);show('Link copied','Share this view with your client.')}catch{show('Share this view','<input readonly aria-label="Share link">');$('article input').value=location.href}};
$('nav').onclick=e=>{
 const name=e.target.closest('button')?.textContent;
 if(name==='Brochure') location.href='brochure.pdf';
 else if(name) projectTools(name,data,show,modal);
};
$('#legend').onclick=()=>{
 const active=document.body.classList.toggle('legend-on');
 $('#legend').setAttribute('aria-pressed',String(active));
 $('#status-key').hidden=!active;
};
$('#search').onclick=()=>{
 show('Find an apartment','<input type="search" placeholder="Wing or unit number" aria-label="Search units"><div id="results"></div>');
 const input=$('article input'),results=$('#results');
 function find(){results.replaceChildren();for(const w of wings)for(const u of data.wings[w].units){if(!u.id.toLowerCase().includes(input.value.trim().toLowerCase()))continue;button(u.id+' · '+u.status,()=>{wing=w;floor=u.floor;unit=u.id;modal.close();reset();render()},results)}if(!results.children.length)results.textContent='No matching apartments.'}input.oninput=find;find();input.focus();
};

matchMedia('(max-width:650px) and (orientation:portrait)').addEventListener('change',()=>{reset();render()});

document.querySelectorAll('nav button').forEach(button=>button.setAttribute('aria-label',button.textContent));

let pinchDistance=0;
const separation=touches=>Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY);
viewport.addEventListener('touchstart',e=>{if(e.touches.length===2){drag=null;pinchDistance=separation(e.touches)}},{passive:true});
viewport.addEventListener('touchmove',e=>{if(e.touches.length!==2||!pinchDistance)return;e.preventDefault();drag=null;const distance=separation(e.touches);setZoom(zoom*distance/pinchDistance);pinchDistance=distance},{passive:false});
viewport.addEventListener('touchend',()=>{pinchDistance=0});

if (params.get('map') === 'true') projectTools('GPS',data,show,modal);

const flatToggle=$('#toggle-flat'),flatCard=$('#flat-card'),flatTour=$('#flat-tour');
flatToggle.onclick=()=>{
 const active=flatToggle.getAttribute('aria-pressed')!=='true';
 flatToggle.setAttribute('aria-pressed',String(active));flatCard.hidden=!active;
};
$('#inspect-flat').onclick=()=>{
 wing='B';floor=1;unit='B-102';reset();render();
 flatToggle.setAttribute('aria-pressed','false');flatCard.hidden=true;
};
let flatTicket=0,releaseFlat;
$('#open-flat').onclick=async()=>{
 const ticket=++flatTicket;const poster=flatTour.querySelector(".flat-stage img");
 if(!poster.hasAttribute("src"))poster.src=poster.dataset.src;
 flatTour.showModal();flatTour.classList.remove('interactive');
 $('#flat-hint').textContent='Loading furnished model…';
 try{
   const {openFlat}=await import('/flat-web.js');
   if(ticket!==flatTicket)return;
   const clean=await openFlat(flatTour,()=>ticket===flatTicket);
   if(ticket!==flatTicket){clean();return}
   releaseFlat=clean;
 }catch{
   if(ticket===flatTicket)$('#flat-hint').textContent='Rendered overhead view · 3D could not load';
 }
};
$('#close-flat').onclick=()=>flatTour.close();
flatTour.addEventListener('close',()=>{++flatTicket;releaseFlat?.();releaseFlat=null;flatTour.classList.remove('interactive');$('#open-flat').focus()});
