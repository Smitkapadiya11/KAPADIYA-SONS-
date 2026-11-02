import {satellite} from './satellite.js';
export function projectTools(name, data, show, dialog) {
  const coords=data.latitude+','+data.longitude;
  const directions='https://www.google.com/maps/dir/?api=1&destination='+coords;
  if(name==='GPS'){
    show('GPS','<div id="satellite"></div><div class="map-actions"><span id="tile-status"></span><a href="'+directions+'" target="_blank" rel="noopener">Directions ↗</a><button id="return-plan">Interactive Plan</button></div>');
    satellite(dialog,data);document.querySelector('#return-plan').onclick=()=>dialog.close();return;
  }
  if(name==='Nearby'){
    const icons={School:'♧',Hospital:'♡',Highway:'⇄',Airport:'✈'};
    show('Nearby Locations',data.nearby.map(n=>'<section class="place"><i>'+ (icons[n.category]||'⌖')+'</i><div><b>'+n.name+'</b><p><strong>'+n.distance+'</strong>　·　'+n.category+'</p></div></section>').join(''));return;
  }
  if(name==='Gallery'){
    let index=0;
    show('Project Gallery','<div class="photo-stage"><img id="photo" alt="Project architectural view"></div><div class="photo-controls"><button id="prev-photo">← Previous</button><output></output><button id="next-photo">Next →</button></div><div id="thumbs"></div>');
    const update=()=>{document.querySelector('#photo').src=data.gallery[index]+'.webp';document.querySelector('.photo-controls output').textContent=(index+1)+' / '+data.gallery.length;};
    const step=n=>{index=(index+n+data.gallery.length)%data.gallery.length;update()};
    document.querySelector('#prev-photo').onclick=()=>step(-1);document.querySelector('#next-photo').onclick=()=>step(1);
    data.gallery.forEach((g,i)=>{const b=document.createElement('button');b.innerHTML='<img src="'+g+'.webp" loading="lazy" alt="Show view '+(i+1)+'">';b.onclick=()=>{index=i;update()};document.querySelector('#thumbs').append(b)});update();return;
  }
  if(name==='Details'){
    show('Project Overview','<small>ABOUT PROJECT</small><p>A residential community in Olpad, Surat. Explore three high-rise wings around landscaped gardens, a clubhouse and swimming pool.</p><small>SITE LOCATION</small><p>Olpad, Surat, Gujarat</p><small>TOTAL AREA</small><p>237,473 sq ft</p><small>TOTAL UNITS</small><p>264 apartments</p><small>PREMIUM AMENITIES</small><div class="amenities">'+['Swimming Pool','Central Clubhouse','Tennis Court','Grand Entrance Gate','Wide RCC Roads','Facade & Landscape Lighting','Lush Green Gardens','Jogging Track','Rooftop Spaces','Drop-off Zones'].map(s=>'<span>'+s+'</span>').join('')+'</div><small>OFFICIAL LINKS</small><p><a href="/">Kapadiya &amp; Sons</a> · <a href="'+directions+'" target="_blank" rel="noopener">Google Maps</a></p><small>INTERESTED? CONNECT NOW</small><p>Smit Kapadiya<br><a href="tel:+917575807403">+91 75758 07403</a><br><a href="mailto:smitkapadiya.work@gmail.com">smitkapadiya.work@gmail.com</a></p><a class="cta" href="https://wa.me/917575807403?text=Hi%20Smit%2C%20I%20would%20like%20to%20discuss%20PinYourSite%20Apartments.">WhatsApp ↗</a>');
  }
}
