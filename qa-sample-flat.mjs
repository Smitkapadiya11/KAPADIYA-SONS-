import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.env.SITE_URL||'http://127.0.0.1:4378';
const browser=await chromium.launch({channel:'msedge'});
try{
 for(const width of [390,1440]){
  const p=await browser.newPage({viewport:{width,height:850},hasTouch:width===390});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  const loads=[];p.on('request',r=>loads.push(r.url()));
  await p.goto(base+'/apartments/index.html');
  await p.locator('.marker').first().waitFor();
  assert.ok(!loads.some(s=>s.endsWith('b102.bin')));
  await p.locator('#legend').click();assert.ok(await p.locator('#status-key').isVisible());
  await p.locator('#legend').click();await p.locator('#toggle-flat').click();
  assert.equal(await p.locator('#flat-card button:visible').count(),2);
  await p.locator('#inspect-flat').click();assert.match(p.url(),/unit=B-102/);
  await p.locator('#toggle-flat').click();
  const before=p.url();await p.locator('#open-flat').click();await p.waitForSelector('#flat-tour.interactive canvas');
  const stage=p.locator('.flat-stage');
  const a=await stage.screenshot();await p.mouse.move(width/2,380);await p.mouse.down();await p.mouse.move(width/2+75,410,{steps:8});await p.mouse.up();await p.waitForTimeout(300);
  assert.ok(!a.equals(await stage.screenshot()));
  if(width===390){
   const cdp=await p.context().newCDPSession(p);
   const touch=(x,id)=>({x,y:400,id});
   const beforePinch=await stage.screenshot();
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch(150,1),touch(230,2)]});
   for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[touch(150-i*5,1),touch(230+i*5,2)]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await p.waitForTimeout(200);assert.ok(!beforePinch.equals(await stage.screenshot()));
  }
  for(const v of ['living','bedrooms','kitchen','overhead']){
   await p.locator('[data-flat-view='+v+']').click();assert.equal(await p.locator('[data-flat-view='+v+']').getAttribute('aria-pressed'),'true');
  }
  await p.waitForTimeout(700);await p.screenshot({path:'../flat-production-'+width+'.jpg'});
  await p.locator('#close-flat').click();assert.equal(p.url(),before);
  await p.locator('.flat-stage canvas').waitFor({state:'detached'});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);await p.close();
 }
 console.log('Verified switches, unit B-102, overhead and room cameras, orbit, touch pinch and return on both viewports.');
}finally{await browser.close()}

