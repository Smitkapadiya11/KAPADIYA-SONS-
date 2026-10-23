import {chromium} from '@playwright/test';import AxeBuilder from '@axe-core/playwright';import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'msedge',headless:true});const context=await b.newContext();const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const width of [390,1440,360]){
await p.setViewportSize({width,height:844});await p.goto(process.env.SITE_URL||'http://127.0.0.1:4175/');await p.waitForTimeout(700);
await p.locator('.capability-stage').scrollIntoViewIfNeeded();
for(let i=0;i<10;i++){
await p.locator('[data-cap-step="'+i+'"]').click();await p.waitForTimeout(40);assert.equal(await p.locator('.current-capability').count(),1);assert.equal(await p.locator('.current-capability').getAttribute('data-service'),['avatar','ugc','film','reels','images','automation','whatsapp','websites','apps','crm'][i]);
const r=await p.locator('.capability-controller').boundingBox();assert.ok(r.y+r.height<=845,'controller visible');
}
await p.locator('[data-cap-step="0"]').click();await p.evaluate(()=>scrollBy({top:560,behavior:'instant'}));await p.waitForTimeout(150);assert.notEqual(await p.locator('.current-capability').getAttribute('data-service'),'avatar');
await p.locator('.current-capability').click();await p.locator('dialog').waitFor({state:'visible'});await p.keyboard.press('Escape');
await p.locator('[data-cap-step="3"]').click();await p.screenshot({path:'capability-'+width+'-preview.png'});
const axe=await new AxeBuilder({page:p}).include('.capability-stage').withTags(['wcag2a','wcag2aa']).analyze();console.log(axe.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})));assert.equal(axe.violations.length,0);
await p.locator('[data-filter="systems"]').click();assert.equal(await p.locator('[data-cap-step]').count(),5);
await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);assert.equal(await p.locator('.capability-rail.controlled').count(),0);assert.equal(await p.locator('.service-card[inert]').count(),0);await p.emulateMedia({reducedMotion:'no-preference'});
}
assert.equal(errors.length,0,errors.join('\n'));await b.close();console.log('PASS one-by-one scroll controller on phone/desktop, all ten selections, detail opening, filters, readable reduced-motion layout and accessibility.');

