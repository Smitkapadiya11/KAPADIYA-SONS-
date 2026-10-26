import './style.css';
import './experience.css';
import './glass.css';
import './identity.css';
import './diwali.css';
import './motion.js';
import { offers, money, terms, servicePricing } from './offers.js';
import './offers-motion.js';
const wa = message => `https://wa.me/917575807403?text=${encodeURIComponent(message)}`;
const services = [
['avatar','content','◉','AI avatar videos','Your approved ideas, ready to post with your own digital avatar.','Consultants, educators, founders and professionals.','Avatar videos with your permission. The exact deliverables follow the plan you choose.','Your permission, suitable reference footage, topics and preferred language.','Agree the avatar direction and topics, approve scripts, produce and review.',servicePricing('avatar')],
['ugc','content','↗','UGC & product ads','Creator-style storytelling that shows what your product does and why it matters.','Apparel brands, product sellers and ecommerce businesses.','AI UGC reels: clothing showcases, product demonstrations, feature explainers and review-style presentations based on verified facts.','Product images, approved claims, audience, offer and brand assets.','Align the hook, demonstration, benefits and call to action, then produce the agreed variations. AI presenters are not real customers.',servicePricing('ugc')],
['film','content','✳','Cinematic AI film ads','Concept-led campaigns with ambitious scenes and a cinematic, lifelike direction.','Fashion campaigns, product launches and brand stories.',offers.find(p=>p.category==='film').items.join('. '),'Brand assets, product references, campaign objective and approved claims.','Develop the story and visual direction, align concepts, produce and review. AI realism depends on the concept and references.',servicePricing('film')],
['reels','content','▶','Reels & social content','A connected content routine, built around stories your audience cares about.','Professionals, creators and businesses seeking consistent content.','Scoped reels, hooks, captions and platform-ready formats. Avatar and content-routine plans offer defined starting points.','Topics, audience, platform, preferred language and existing references.','Choose content pillars, agree formats, produce approved content and use audience response to guide the next cycle.',servicePricing('routine')+' Publishing and account management are confirmed separately.'],
['images','content','▧','AI images & ad creatives','Product-led images and campaign creative that work together across your feed.','Brands needing matching posts, product concepts and ad creatives.','AI image concepts and agreed ad formats. '+offers.find(p=>p.id==='monster').items[1]+'.','Product photographs, brand guidelines, approved copy and required dimensions.','Agree a visual direction, create variations, review product accuracy and prepare approved formats.','Included image counts follow the package. Standalone image work is quoted after reviewing your brief.'],
['automation','systems','⚙','AI & business automation','Reduce repeat admin and make everyday work easier to manage.','Businesses and teams performing repetitive digital work.','Workflow review, scoped automation, agreed integrations and operating guidance.','Current tools, repetitive steps, exceptions and access requirements.','Map the process, prioritise opportunities, define human approval points, build and test.','Custom quote. Hosting, subscriptions, data handling, support and integration constraints agreed before building.'],
['whatsapp','systems','↳','WhatsApp, leads & bookings','Connect enquiries to relevant follow-ups and appointment workflows.','Clinics, local services and professionals managing incoming enquiries.','Scoped lead capture, routing, follow-up logic and appropriate appointment integrations.','Lead sources, response process, booking rules and communication permissions.','Map the journey, confirm messaging consent, implement and test common and exception paths.','Custom quote. WhatsApp Business Platform eligibility, templates, provider costs and messaging charges confirmed separately.'],
['websites','systems','↗','Websites & landing pages','Focused digital experiences that explain your offer and help visitors take action.','Service businesses, professionals, brands and startups.','Responsive pages, clear service content, enquiry paths and agreed integrations.','Your offer, audience, brand assets, content, domain access and conversion goals.','Align structure, design the experience, build responsive layouts, verify interactions and launch.','Custom quote by pages and functionality. Domain, hosting, maintenance and support scoped separately.'],
['apps','systems','⌘','Apps & custom software','Purposeful software for workflows that off-the-shelf tools don’t quite fit.','Startups and established companies with specific operational needs.','A scoped application or internal tool with agreed features, roles and integrations.','Users, use cases, existing systems, data requirements and priorities.','Define the smallest useful release, map flows, build in reviewable stages and test before handover.','Custom proposal. Platforms, infrastructure, security, testing, maintenance and ownership agreed before development.'],
['crm','systems','⊞','CRM & custom workflows','Bring customer records, next steps and business processes into a clearer system.','Sales teams and professionals working across disconnected tools.','Agreed CRM setup or custom workflow, lead stages, responsibilities and integrations.','Customer process, tools, data sources, team roles and reporting needs.','Map the pipeline, agree fields and access, configure the workflow and test migration where scoped.','Custom quote. Migration, licences, access controls, reporting and administration confirmed in your proposal.']
].map(([id,category,icon,name,desc,fit,deliver,needs,process,scope])=>({id,category,icon,name,desc,fit,deliver,needs,process,scope}));
function renderServices(filter='all') {
  document.querySelector('#service-grid').innerHTML=services.filter(s=>filter==='all'||s.category===filter).map(s=>`
    <button class="service-card" data-service="${s.id}">
      <span class="service-art"><img src="/images/services/${s.id}-600.webp" srcset="/images/services/${s.id}-600.webp 600w, /images/services/${s.id}.webp 1536w" sizes="(max-width: 600px) 90vw, (max-width: 1200px) 42vw, 28vw" alt="" width="1536" height="1024" loading="lazy" decoding="async"><span class="service-art-label">AI CONCEPT / ${String(services.indexOf(s)+1).padStart(2,'0')}</span></span>
      <span class="service-card-copy"><span class="service-category">${s.category==='content'?'CONTENT & CREATIVE':'TECHNOLOGY & SYSTEMS'}</span><span class="service-title">${s.name}</span><span class="service-description">${s.desc}</span><span class="service-action">Explore the service <span aria-hidden="true">↗</span></span></span>
    </button>`).join('');
}
const dialog=document.querySelector('#service-dialog');let returnFocus;
function showDialog(content, footer='', pagination='') {
  if(!dialog.open)returnFocus=document.activeElement;
  const body=document.querySelector('#dialog-content');
  body.innerHTML=content;
  document.querySelector('#dialog-footer').innerHTML=footer;
  document.querySelector('#dialog-pagination').innerHTML=pagination;
  dialog.classList.toggle('has-service',Boolean(footer));
  const heading=body.querySelector('h2');
  if(heading){heading.id='detail-title';dialog.setAttribute('aria-labelledby','detail-title');}
  if(!dialog.open)dialog.showModal();
  body.scrollTop=0;
  document.body.classList.add('modal-open');
}
function openService(id) {
  const s=services.find(x=>x.id===id);if(!s)return;
  const index=services.indexOf(s);
  const message=wa(`Hi Smit! I’d like to discuss ${s.name} for my business with KAPADIYA & SONS. Business: ___. Main goal: ___. Current challenge: ___. Preferred timeline: ___. Please suggest the right scope, reference requirements and next steps.`);
  const info=[['01','WHO IT’S FOR',s.fit],['02','WHAT WE CAN DELIVER',s.deliver],['03','WHAT WE NEED FROM YOU',s.needs],['04','HOW THE WORK HAPPENS',s.process],['05','SCOPE & PRICING',s.scope]];
  showDialog(`
    <figure class="dialog-art"><img class="dialog-visual" src="/images/services/${s.id}.webp" alt="AI-generated visual concept illustrating ${s.name}" width="1536" height="1024" decoding="async"><figcaption>AI-GENERATED CONCEPT · NOT CLIENT WORK</figcaption></figure>
    <div class="dialog-editorial"><div class="dialog-heading"><span class="eyebrow">${s.category==='content'?'CONTENT & CREATIVE':'TECHNOLOGY & SYSTEMS'}</span><h2>${s.name}</h2><p class="dialog-lead">${s.desc}</p></div>
    <div class="detail-grid">${info.map(([n,h,p])=>`<article><div class="detail-label"><span>${n}</span><h3>${h}</h3></div><p>${p}</p></article>`).join('')}</div><p class="dialog-foot">Every project starts with a conversation. We agree the scope, timeline, fees and review terms before work begins.</p></div>`,
    `<div class="dialog-footer-copy"><span>YOUR NEXT MOVE</span><strong>Let’s make it happen.</strong></div><a class="button lime" href="${message}" target="_blank" rel="noopener noreferrer">Discuss on WhatsApp <span aria-hidden="true">↗</span></a>`,
    `<button data-service="${services[(index+9)%10].id}" aria-label="Previous service">←</button><span>${String(index+1).padStart(2,'0')} / 10</span><button data-service="${services[(index+1)%10].id}" aria-label="Next service">→</button>`);
}
function syncRoute(){const match=location.hash.match(/^#service\/(.+)$/);if(match)openService(match[1]);}
document.addEventListener('click',e=>{const card=e.target.closest('[data-service]');if(card){location.hash=`service/${card.dataset.service}`;}const f=e.target.closest('[data-filter]');if(f){document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===f);b.setAttribute('aria-pressed',String(b===f));});renderServices(f.dataset.filter);}});
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(location.hash.startsWith('#service/'))history.replaceState(null,'',location.pathname+location.search+'#services');returnFocus?.focus();});window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#service/')&&dialog.open)dialog.close();syncRoute();});
services.forEach(s=>document.querySelector('#brief-service').add(new Option(s.name,s.name)));
document.querySelector('#brief-form').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);location.assign(wa(`Hi Smit! I’m ${data.get('name')}, from ${data.get('business')}.\n\nI’m interested in: ${data.get('service')}.\n\nMy brief: ${data.get('context')}\n\nPlease help me identify the right next steps with KAPADIYA & SONS. If suitable, I’d love your free review with 2–3 practical opportunities.`));});
document.querySelector('#privacy-open').addEventListener('click',()=>showDialog('<span class="eyebrow">CLEAR FROM THE START</span><h2>Privacy & project terms</h2><div class="legal-copy"><h3>Your information</h3><p>This site does not store form submissions, use analytics cookies or collect payment. The brief builder prepares a message for WhatsApp. WhatsApp processes information under its own policies. Hosting providers may retain technical access logs.</p><h3>When you contact us</h3><p>Information you voluntarily send by WhatsApp or email is used to discuss your enquiry and deliver agreed work. Do not include passwords, payment details or sensitive customer information in an initial brief. Contact smitkapadiya.work@gmail.com with privacy questions or requests.</p><h3>Scope and payment</h3><p>'+terms+' No project is booked or paid for through this site.</p><h3>AI content and permissions</h3><p>Avatar production requires permission and suitable reference material. You must have rights to supplied assets. AI presenters are not customer endorsements. Realism varies with concepts and references. Reach, leads and sales are not guaranteed.</p></div>'));
document.querySelector('#year').textContent=new Date().getFullYear();renderServices();syncRoute();
const motionButton=document.createElement('button');
motionButton.className='motion-toggle';motionButton.textContent='Pause motion';motionButton.setAttribute('aria-pressed','false');
document.querySelector('.hero-bottom').append(motionButton);





import './capability.js';

import './atelier.js';

import './cinema.js';

import './chrome.css';
