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
 scene.innerHTML='<image href="'+(wing||'elevation')+'.webp" width="1920" height="1080"/>';
 const choices=$('#choices');choices.replaceChildren();$('#info').replaceChildren();$('h1').textContent=wing?'Wing '+wing+' · Floor '+floor:'Choose a wing';
 function hotspot(d,label,fn,status){if(!d)return;const path=document.createElementNS(scene.namespaceURI,'path');path.setAttribute('d',d);path.setAttribute('aria-label',label);path.setAttribute('role','button');path.setAttribute('tabindex','0');if(status&&status!=='available')path.style.fill='#e2a65e66';path.onclick=fn;path.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();fn()}};scene.append(path)}
 if(!tower){wings.forEach(w=>{const fn=()=>{wing=w;floor=1;unit='';reset();render()};button('Wing '+w,fn,choices);hotspot(data.wings[w].outline,'Wing '+w,fn)})}
 else{button('← Wings',()=>{wing=unit='';reset();render()},choices);const sel=document.createElement('select');sel.ariaLabel='Floor';for(const f of [...new Set(tower.units.map(u=>u.floor))].sort((a,b)=>a-b))sel.add(new Option('Floor '+f,f,false,f==floor));sel.onchange=()=>{floor=+sel.value;unit='';render()};choices.append(sel);
 units.forEach(u=>{const fn=()=>{unit=u.id;render()};const b=button(u.id,fn,choices);b.classList.toggle('active',unit===u.id);hotspot(u.path,u.id,fn,u.status)})}
 if(selected){const p=document.createElement('p');p.textContent=[selected.type,selected.area+' sq ft',selected.status].join(' · ');const a=document.createElement('a');a.className='cta';a.textContent='Enquire on WhatsApp ↗';a.href='https://wa.me/917575807403?text='+encodeURIComponent('Hi Smit, I explored PinYourSite Apartments, Wing '+wing+', Floor '+floor+', '+unit+'. Please share details for my project.');$('#info').append(p,a)}
 history.replaceState(null,'',location.pathname+(wing?'?wing='+wing+'&floor='+floor+(unit?'&unit='+encodeURIComponent(unit):''):''))
}
const params=new URLSearchParams(location.search);if(wings.includes(params.get('wing'))){wing=params.get('wing');const list=data.wings[wing].units;floor=list.some(u=>u.floor==params.get('floor'))?Number(params.get('floor')):1;unit=list.find(u=>u.floor==floor&&u.id===params.get('unit'))?.id||''}render();
$('#plus').onclick=()=>setZoom(zoom+.5);$('#minus').onclick=()=>setZoom(zoom-.5);$('#compass').onclick=reset;$('#home').onclick=()=>{wing=unit='';reset();render()};
const viewport=$('#viewport');viewport.onwheel=e=>{e.preventDefault();setZoom(zoom-Math.sign(e.deltaY)*.2)};viewport.onpointerdown=e=>{if(e.target.tagName==='path')return;drag=[e.clientX-x,e.clientY-y];viewport.setPointerCapture(e.pointerId)};viewport.onpointermove=e=>{if(drag){x=e.clientX-drag[0];y=e.clientY-drag[1];move()}};viewport.onpointerup=viewport.onpointercancel=()=>drag=null;
function show(title,html){$('article').innerHTML='<h2>'+title+'</h2>'+html;modal.showModal()}$('#close').onclick=()=>modal.close();
$('#share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);show('Link copied','Share this view with your client.')}catch{show('Share this view','<input readonly aria-label="Share link">');$('article input').value=location.href}};
$('nav').onclick=e=>{switch(e.target.textContent){case 'Details':show('PinYourSite Apartments','<p>Explore three residential wings, each with 22 floors. Select a floor and apartment to see its layout, area and demonstration availability.</p><p>Kapadiya &amp; Sons · Smit Kapadiya<br><a href="tel:+917575807403">+91 75758 07403</a><br><a href="mailto:smitkapadiya.work@gmail.com">smitkapadiya.work@gmail.com</a></p>');break;case 'Gallery':show('Project gallery',data.gallery.map((g,i)=>'<img loading="lazy" src="'+g+'.webp" alt="Architectural view '+(i+1)+'">').join(''));break;case 'Nearby':show('Nearby places',data.nearby.map(n=>'<p>'+n.name+' · '+n.distance+'</p>').join(''));break;case 'GPS':show('Project location','<img src="satellite.webp" alt="Site location overlay"><a href="https://maps.google.com/?q='+data.latitude+','+data.longitude+'" target="_blank" rel="noopener">Open GPS location ↗</a>');break;case 'Brochure':location.href='brochure.pdf';}}
