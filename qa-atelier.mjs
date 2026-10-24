import {chromium} from '@playwright/test';import AxeBuilder from '@axe-core/playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.SITE_URL||'http://127.0.0.1:4175/');await page.waitForTimeout(1600);
for(const width of [390,1440]){
 await page.setViewportSize({width,height:950});
 for(const [key,service] of [['notice','ugc'],['enquiries','websites'],['time','automation']]){
  await page.locator('[data-direction="'+key+'"]').click();await page.locator('#direction-image').evaluate(el=>el.decode());await page.waitForTimeout(850);
  assert.equal(await page.locator('#direction-cta').getAttribute('href'),'#service/'+service);assert.equal(await page.locator('[role="tab"][aria-selected="true"]').count(),1);
  assert.ok(await page.locator('#direction-image').getAttribute('src').then(s=>s.includes(service)));
 }
 await page.locator('[data-direction="notice"]').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#direction-enquiries').getAttribute('aria-selected'),'true');
 await page.locator('#direction-cta').click();await page.locator('#service-dialog').waitFor({state:'visible'});assert.match(await page.locator('#detail-title').textContent(),/Websites/);await page.keyboard.press('Escape');
 await page.locator('#run-workflow').click();await page.waitForFunction(()=>!document.querySelector('#run-workflow').disabled);assert.equal(await page.locator('.demo-complete').count(),3);assert.match(await page.locator('#demo-status-label').textContent(),/FOLLOW-UP PREPARED/);
 await page.locator('.workflow-demo').screenshot({path:'atelier-workflow-'+width+'-preview.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#run-workflow').click();await page.waitForFunction(()=>!document.querySelector('#run-workflow').disabled);
 await page.locator('[data-direction="notice"]').click();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'atelier-hero-'+width+'-preview.png'});
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
 await page.emulateMedia({reducedMotion:'no-preference'});
}
assert.deepEqual(errors,[]);await browser.close();console.log('PASS goal selector, keyboard controls, contextual enquiry links, three-stage workflow demo, reduced motion and mobile/desktop accessibility.');
