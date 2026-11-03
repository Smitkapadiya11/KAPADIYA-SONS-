import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'msedge'});
for(const [width,height] of [[1534,871],[390,844]]){
 const p=await b.newPage({viewport:{width,height}});p.on('pageerror',e=>{throw e});
 await p.goto((process.env.SITE_URL||'http://127.0.0.1:4314')+'/apartments/index.html?map=true');
 const art=p.locator('.project-art');await art.waitFor();await art.evaluate(i=>i.decode());
 await p.waitForSelector('.leaflet-tile-loaded');await p.waitForFunction(()=>Array.from(document.querySelectorAll('.leaflet-tile')).every(i=>i.complete && i.naturalWidth>0));
 const bounds=()=>art.boundingBox();const first=await bounds();
 assert.ok(Math.abs(first.x+first.width/2-width/2)<2);
 assert.ok(Math.abs(first.y+first.height/2-height/2)<2);
 assert.ok(await p.locator('dialog').evaluate(d=>d.scrollHeight<=d.clientHeight));
 await p.screenshot({path:'../gps-'+width+'.jpg'});
 await p.getByRole('button',{name:'Zoom in',exact:true}).last().click();
 assert.ok((await bounds()).width>first.width*1.8);
 await p.getByRole('button',{name:'Face north'}).click();
 await p.getByRole('button',{name:'Reset map view'}).click();assert.ok(Math.abs((await bounds()).width-first.width)<2);
 await p.locator('#return-plan').click();await p.waitForURL(url=>!url.searchParams.has('map'));await p.close()
}await b.close();console.log('GPS framing, zoom, reset, direct entry and return passed on both sizes.');

