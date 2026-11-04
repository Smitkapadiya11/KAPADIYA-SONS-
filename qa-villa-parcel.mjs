import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge'});
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:900},hasTouch:width===390});
  await page.goto(process.env.SITE_URL||'http://127.0.0.1:4361');
  const transform=()=>page.locator('#map-transform').evaluate(e=>e.style.transform);
  const before=await transform();
  await page.locator('#parcel-toggle').click();
  assert.equal(await transform(),before);assert.ok(!await page.locator('#house-view').isVisible());
  await page.waitForSelector('#villa-parcel canvas');
  await page.locator('#parcel-focus').click();await page.waitForTimeout(1250);
  const bounds=await page.locator('#villa-parcel').boundingBox(),plot=await page.locator('[data-plot="25"] polygon').evaluate(el=>{
    const b=el.getBBox(),m=el.getScreenCTM(),p=new DOMPoint(b.x,b.y).matrixTransform(m);
    return {x:p.x,y:p.y,width:b.width*m.a,height:b.height*m.d};
  });
  for(const k of ['x','y','width','height'])assert.ok(Math.abs(bounds[k]-plot[k])<1);
  const crop=page.locator('#villa-parcel');
  const first=await crop.screenshot();
  await page.screenshot({path:'../plot25-'+width+'.jpg'});
  await page.locator('#parcel-angle').click();assert.ok(!first.equals(await crop.screenshot()));
  await page.locator('#parcel-toggle').click();assert.equal(await page.locator('#villa-parcel canvas').count(),0);
  await page.close();
 }
}finally{await browser.close()}
console.log('In-place toggle, plot registration, camera angles and removal passed on both sizes.');

