import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
// Run with the plot Vite dev server running. Bake the glazing reflection atlas on the authoring GPU.
const b=await chromium.launch({channel:'msedge'});
try{
  const p=await b.newPage();
  await p.goto(process.env.SITE_URL || 'http://127.0.0.1:4352');
  const png=await p.evaluate(async()=>{
    const T=await import('/node_modules/three/build/three.module.js');
    const {RoomEnvironment}=await import('/node_modules/three/examples/jsm/environments/RoomEnvironment.js');
    const gl=new T.WebGLRenderer();
    const gen=new T.PMREMGenerator(gl);const studio=new RoomEnvironment();
    const target=gen.fromScene(studio,.035);
    const {width:w,height:h}=target;
    const buffer=new Uint16Array(w*h*4);
    const c=document.createElement('canvas');c.width=6*128;c.height=128;
    const ctx=c.getContext('2d');
    const face=document.createElement('canvas');face.width=w;face.height=h;
    const faceCtx=face.getContext('2d'),im=faceCtx.createImageData(w,h);
    for(let side=0;side<6;side++){
      await gl.readRenderTargetPixelsAsync(target,0,0,w,h,buffer,side);
      for(let i=0;i<buffer.length;i+=4){
        for(let j=0;j<3;j++) im.data[i+j]=Math.round(255*Math.pow(Math.min(1,T.DataUtils.fromHalfFloat(buffer[i+j])/2),1/2.2));
        im.data[i+3]=255;
      }
      faceCtx.putImageData(im,0,0);
      ctx.drawImage(face,side*128,0,128,128);
    }
    studio.dispose();target.dispose();gen.dispose();gl.dispose();return c.toDataURL('image/png').split(',')[1];
  });
  await writeFile('pinyoursite/public/finishes/reflection.png',Buffer.from(png,'base64'));
}finally{await b.close()}
