import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [width,height] of [[390,950],[360,640],[1440,950],[1440,650]]){
await page.setViewportSize({width,height});await page.goto(process.env.SITE_URL||'http://127.0.0.1:4175/');await page.waitForTimeout(1000);
assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.cinema-enabled').count(),1);
for(const step of [0,1,2,3,4]){await page.locator('[data-cinema-step="'+step+'"]').click();await page.waitForTimeout(100);await page.screenshot({path:'cinema-'+width+'-'+step+'-preview.png'});assert.equal(await page.locator('[data-cinema-step="'+step+'"]').getAttribute('aria-current'),'step');if(step<4)assert.ok(await page.locator('.cinema-outro').evaluate(el=>Number(getComputedStyle(el).opacity)<.01),'Outro must stay hidden until its chapter');if(step===0)assert.ok(await page.locator('.cinema-caption').evaluate(el=>Number(getComputedStyle(el).opacity)<.01),'Caption must not overlap opening title');}
await page.locator('[data-cinema-step="0"]').click();const first=await page.locator('.cinema-card-a').evaluate(el=>getComputedStyle(el).transform);await page.locator('[data-cinema-step="1"]').click();assert.notEqual(await page.locator('.cinema-card-a').evaluate(el=>getComputedStyle(el).transform),first);
await page.locator('#cinema-pause').click();assert.equal(await page.locator('.cinema-enabled').count(),0);assert.equal(await page.locator('.cinema-outro').evaluate(el=>el.inert),false);
const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();console.log(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));assert.equal(audit.violations.length,0);
await page.locator('#cinema-pause').click();assert.equal(await page.locator('.cinema-enabled').count(),1);
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);assert.equal(await page.locator('.cinema-enabled').count(),0);await page.emulateMedia({reducedMotion:'no-preference'});
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
}
assert.deepEqual(errors,[]);await browser.close();console.log('PASS cinematic scene scrubbing, five chapters, reversible animation, pause/resume, reduced motion, mobile/desktop layout and accessibility.');

