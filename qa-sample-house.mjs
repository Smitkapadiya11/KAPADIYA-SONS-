import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:800},hasTouch:width===390});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.SITE_URL||'http://127.0.0.1:4352');
  await page.locator('#parcel-toggle').click();
  const open=page.locator('#open-house');
  await open.click();
  await page.waitForSelector('#house-view.house-ready canvas');
  await page.waitForTimeout(350);
  await page.screenshot({path:'../house-'+width+'.jpg'});
  const stage=page.locator('.house-stage');
  const original=await stage.screenshot();
  await page.mouse.move(width/2,390);await page.mouse.down();await page.mouse.move(width/2+80,420,{steps:9});await page.mouse.up();
  await page.waitForTimeout(400);assert.ok(!original.equals(await stage.screenshot()));
  if(width===390){
   const cdp=await page.context().newCDPSession(page);
   const before=await stage.screenshot();
   const touch=(x,id)=>({x,y:405,id});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch(162,1),touch(222,2)]});
   for(let n=1;n<=6;n++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[touch(162-n*5,1),touch(222+n*5,2)]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await page.waitForTimeout(250);assert.ok(!before.equals(await stage.screenshot()));
  }
  for(const name of ['Balcony','Aerial','Street']) {
   const button=page.getByRole('button',{name,exact:true});await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');
  }
  await page.getByRole('button',{name:'Return to plot plan'}).click();
  assert.ok(await open.isVisible());await open.click();await page.waitForSelector('.house-ready canvas');await page.keyboard.press('Escape');await page.waitForSelector('#house-view',{state:'hidden'});
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Mobile and desktop house load, orbit, presets, return and reopen passed.');
} finally {await browser.close();}
