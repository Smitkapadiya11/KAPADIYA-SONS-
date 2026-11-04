import {chromium} from "@playwright/test";
import assert from "node:assert/strict";
const browser=await chromium.launch({channel:"msedge"});
try {
  for(const [width,height,dpr] of [[390,844,2],[1440,900,1]]) {
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:width<500});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto(process.env.SITE_URL||"http://127.0.0.1:4352");
    await page.locator("#parcel-toggle").click();
    await page.locator("#open-house").click();
    await page.waitForSelector(".house-ready canvas");
    await page.screenshot({path:"../villa-exterior-"+width+".jpg"});
    await page.locator("#tour-inside").click();
    for(const name of ["living","kitchen","bedroom","bath"]){
      if(name!=="living")await page.locator('[data-room="'+name+'"]').click();
      await page.waitForSelector('[data-room="'+name+'"][aria-pressed=true]');
      await page.waitForSelector("#villa-lines g text:visible");
      assert.equal(await page.locator("#villa-lines g").count(),4);
      await page.waitForTimeout(150);
      await page.screenshot({path:"../villa-"+name+"-"+width+".jpg"});
    }
    const measureToggle=page.locator("#measure-villa");
    await measureToggle.click();await page.waitForSelector("#villa-lines",{state:"hidden"});
    await measureToggle.click();await page.waitForSelector("#villa-lines",{state:"visible"});
    if(width===390){
      const stage=page.locator(".house-stage");
      const before=await stage.screenshot();
      const cdp=await page.context().newCDPSession(page);
      const touch=(x,id)=>({x,y:380,id});
      await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[touch(140,1),touch(220,2)]});
      for(let n=1;n<=5;n++)await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[touch(140-n*6,1),touch(220+n*6,2)]});
      await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
      await page.waitForTimeout(100);assert.ok(!before.equals(await stage.screenshot()));
    }
    // Measure an active look-around, not an idle requestAnimationFrame loop.
    const measure=()=>page.evaluate(async()=>{
      const c=document.querySelector(".house-stage canvas");
      const gl=c.getContext("webgl2");
      const gpu=gl.getParameter(gl.getExtension("WEBGL_debug_renderer_info").UNMASKED_RENDERER_WEBGL);
      const draws=[];const clear=gl.clear.bind(gl);
      gl.clear=(...args)=>{draws.push(performance.now());return clear(...args)};
      const make=(type,x)=>c.dispatchEvent(new PointerEvent(type,{pointerId:1,pointerType:"mouse",button:0,buttons:type==="pointerup"?0:1,clientX:x,clientY:240,bubbles:true}));
      const start=performance.now();make("pointerdown",140);
      await new Promise(done=>{
        function step(now){make("pointermove",140+Math.sin((now-start)/400)*70);
          if(now-start<2500)requestAnimationFrame(step);else done()}
        requestAnimationFrame(step);
      });
      make("pointerup",140);gl.clear=clear;
      const measured=draws.filter(t=>t>start+450);
      const times=measured.slice(1).map((t,i)=>t-measured[i]).sort((a,b)=>a-b);
      return {fps:Math.round(1000*(measured.length-1)/(measured.at(-1)-measured[0])),p95:times[Math.floor(times.length*.95)],gpu};
    });
    // Native pointer capture needs an active browser pointer before synthesised moves.
    await page.mouse.move(140,240);await page.mouse.down();
    const inside=await measure();await page.mouse.up();
    await page.locator("#tour-outside").click();
    await page.mouse.move(140,240);await page.mouse.down();const outside=await measure();await page.mouse.up();
    assert.ok(inside.fps>0 && outside.fps>0);
    console.log(JSON.stringify({width,height,dpr,inside,outside}));
    await page.locator("#house-close").click();assert.deepEqual(errors,[]);
    await page.close();
  }
}finally{await browser.close()}

