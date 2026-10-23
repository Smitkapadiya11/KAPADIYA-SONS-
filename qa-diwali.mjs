import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage(), errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.SITE_URL||'http://127.0.0.1:4175/',{waitUntil:'domcontentloaded'});
await page.locator('.hero-image').evaluate(el=>el.decode());await page.waitForTimeout(1600);
await page.screenshot({path:'diwali-desktop-preview.png'});
const expected={avatar:['₹2,099.40','₹9,599.40'],ugc:['₹14,999','₹19,800'],gemini:['₹5,999','₹9,599.40'],film:['₹31,199.40']};
for(const [group,prices] of Object.entries(expected)){
await page.locator('[data-plan="'+group+'"]').click();
const actual=await page.locator('.plan h3').allTextContents();
assert.deepEqual(actual,prices);
for(const a of await page.locator('.plan a').evaluateAll(xs=>xs.map(x=>x.href)))assert.ok(decodeURIComponent(a).includes('Diwali'));
}
await page.locator('[data-offer-plan="gemini"]').click();
assert.equal(await page.locator('[data-plan="gemini"]').getAttribute('aria-pressed'),'true');
await page.emulateMedia({reducedMotion:'reduce'});
await page.locator('#diwali').screenshot({path:'diwali-offers-preview.png'});
const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
console.log(JSON.stringify(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))));
assert.equal(audit.violations.length,0);
for(const width of [360,390,768,950,1440]){
await page.setViewportSize({width,height:844});await page.waitForTimeout(250);
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+width);
}
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);await page.screenshot({path:'diwali-mobile-preview.png'});
assert.deepEqual(errors,[]);console.log('PASS Diwali 7 exact prices, offer routes, accessibility, responsive widths, no JS errors');
await browser.close();
