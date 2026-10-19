import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173/');await page.waitForTimeout(700);
await page.screenshot({path:'desktop-preview.png',fullPage:true});
assert.equal(await page.locator('.service-card').count(),10);
for(const id of ['avatar','ugc','film','reels','images','automation','whatsapp','websites','apps','crm']){await page.locator(`.service-card[data-service="${id}"]`).click();await page.locator('dialog').waitFor({state:'visible'});assert.match(await page.locator('dialog .button').getAttribute('href'),/^https:\/\/wa.me\/917575807403\?text=/);await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'hidden'});}
await page.locator('[data-filter="systems"]').click();assert.equal(await page.locator('.service-card').count(),5);await page.locator('[data-filter="content"]').click();assert.equal(await page.locator('.service-card').count(),5);await page.locator('[data-filter="all"]').click();
const packageMessages=[];for(const group of ['avatar','ugc','gemini','film']){await page.locator(`[data-plan="${group}"]`).click();for(const href of await page.locator('.plan a').evaluateAll(els=>els.map(x=>x.href))){assert.match(href,/wa.me\/917575807403/);packageMessages.push(href);}}assert.equal(new Set(packageMessages).size,7);
await page.locator('#privacy-open').click();await page.locator('dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');
await page.locator('input[name="name"]').fill('Test Visitor');await page.locator('input[name="business"]').fill('Test Brand');await page.locator('textarea').fill('Need UGC for a product launch');await page.locator('select').selectOption('UGC & product ads');
let target;await page.route('https://wa.me/**',route=>{target=route.request().url();route.abort();});await page.locator('form button').click();await page.waitForTimeout(300);assert.ok(decodeURIComponent(target).includes('Test Brand'));assert.ok(decodeURIComponent(target).includes('UGC & product ads'));
for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4173/');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);if(width===390)await page.screenshot({path:'mobile-preview.png',fullPage:true});}
await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.creator-card').evaluate(el=>getComputedStyle(el).animationName),'none');
assert.deepEqual(errors,[]);console.log('PASS: 10 service details, filters, 7 unique plan WhatsApp links, brief handoff, privacy dialog, 4 viewport widths, reduced motion, no JS errors.');await browser.close();
