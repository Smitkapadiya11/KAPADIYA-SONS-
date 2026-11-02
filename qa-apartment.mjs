import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.env.SITE_URL||'http://127.0.0.1:4291';const b=await chromium.launch({channel:'msedge'});const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(String(e)));
for(const width of [390,1440]){
 await p.setViewportSize({width,height:850});await p.goto(base+'/apartments/index.html');await p.getByRole('button',{name:'Wing A',exact:true}).last().click();await p.locator('select').selectOption('22');await p.locator('#choices button').last().click();assert.match(await p.locator('#info a').getAttribute('href'),/917575807403/);const url=p.url();await p.reload();await p.locator('#info a').waitFor();assert.equal(p.url(),url);for(const name of ['Details','Nearby','Gallery','GPS']){await p.getByRole('button',{name,exact:true}).click();await p.locator('dialog[open]').waitFor();await p.locator('#close').click()}await p.locator('#home').click();assert.equal(await p.locator('#scene path').count(),3);assert.equal((await p.request.get(base+'/apartments/brochure.pdf')).status(),200);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
}assert.deepEqual(errors,[]);await b.close();console.log('Passed mobile and desktop unit selection, deep links, navigation, brochure and contact checks.')

