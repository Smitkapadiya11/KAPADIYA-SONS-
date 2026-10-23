import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const base=process.env.SITE_URL||'http://127.0.0.1:4174/';
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(1500);
await page.screenshot({path:'v2-hero-preview.png'});
const pin=page.locator('.studio-viewport');
const start=await pin.evaluate(el=>el.getBoundingClientRect().top+scrollY-90);
await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),start+50);await page.waitForTimeout(1100);
const first=await page.locator('.world').first().evaluate(el=>getComputedStyle(el).transform);
await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),start+1300);await page.waitForTimeout(1100);
const second=await page.locator('.world').first().evaluate(el=>getComputedStyle(el).transform);assert.notEqual(first,second);
await page.locator('[data-world-dir="1"]').click();await page.waitForTimeout(1500);assert.equal(await page.locator('.studio-count').textContent(),'03 / 03');
await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(800);
await page.locator('.motion-toggle').click();assert.ok(await page.locator('body').evaluate(el=>el.classList.contains('static-motion')));
assert.equal(await page.locator('.service-card').count(),10);
for(const id of ['avatar','ugc','film','reels','images','automation','whatsapp','websites','apps','crm']){
  await page.locator(`.service-card[data-service="${id}"]`).click();await page.locator('dialog').waitFor({state:'visible'});
  assert.match(await page.locator('dialog .button').getAttribute('href'),/^https:\/\/wa.me\/917575807403\?text=/);
  assert.equal(await page.locator('.detail-grid article').count(),5);
  await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'hidden'});
}
await page.locator('[data-filter="systems"]').click();assert.equal(await page.locator('.service-card').count(),5);
await page.locator('[data-filter="content"]').click();assert.equal(await page.locator('.service-card').count(),5);
await page.locator('[data-filter="all"]').click();
const messages=[];for(const group of ['avatar','ugc','gemini','film']){await page.locator(`[data-plan="${group}"]`).click();for(const href of await page.locator('.plan a').evaluateAll(els=>els.map(x=>x.href))){assert.match(href,/wa.me\/917575807403/);messages.push(href);}}
assert.equal(new Set(messages).size,7);
await page.locator('#about').scrollIntoViewIfNeeded();await page.locator('.founder-art img').evaluate(img=>img.decode());
await page.locator('#about').screenshot({path:'v2-founder-preview.png'});
assert.match(await page.locator('.founder-art img').getAttribute('src'),/smit-kapadiya.webp/);
await page.locator('#privacy-open').click();await page.locator('dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');
await page.locator('input[name="name"]').fill('Test Visitor');await page.locator('input[name="business"]').fill('Test Brand');await page.locator('textarea').fill('Need UGC for a product launch');await page.locator('select').selectOption('UGC & product ads');
let target;await page.route('https://wa.me/**',route=>{target=route.request().url();route.fulfill({status:200,body:'WhatsApp handoff captured by automated test'});});await page.locator('form button').click();await page.waitForTimeout(300);assert.ok(decodeURIComponent(target).includes('Test Brand'));assert.ok(decodeURIComponent(target).includes('UGC & product ads'));
await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
for(const width of [360,390,768,950,1440]){
  await page.setViewportSize({width,height:900});await page.waitForTimeout(600);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
  if(width===390){await page.locator('.menu-toggle').click();assert.equal(await page.locator('#mobile-menu').getAttribute('inert'),null);await page.locator('#mobile-menu a[href="#services"]').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(400);await page.screenshot({path:'v2-mobile-preview.png'});}
}
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(300);
assert.equal(await page.locator('.hero-orbit svg').evaluate(el=>getComputedStyle(el).animationName),'none');
assert.equal(await page.locator('.studio-track').evaluate(el=>getComputedStyle(el).display),'grid');
await page.goto(base+'#service/ugc',{waitUntil:'domcontentloaded',timeout:60000});await page.locator('dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');
const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
console.log('ACCESSIBILITY',JSON.stringify(audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),null,2));
assert.deepEqual(errors,[]);assert.equal(audit.violations.length,0);
console.log('PASS: scroll-driven chapter reveal, gallery navigation, pause motion, 10 detail views, filters, 7 unique package messages, brief handoff, founder image, 5 viewport widths, mobile menu, deep links, reduced motion, accessibility scan and no JS errors.');
await browser.close();



