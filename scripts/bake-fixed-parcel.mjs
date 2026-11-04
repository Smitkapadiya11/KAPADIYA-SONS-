import {chromium} from "@playwright/test";
import {writeFile} from "node:fs/promises";
// Run against the plot demo's Vite development server to bake the fixed map view.
const browser=await chromium.launch({channel:"msedge"});
try{
 const page=await browser.newPage();
 await page.goto(process.env.SITE_URL || "http://127.0.0.1:4361");
 const data=await page.evaluate(async()=>{
   const host=document.querySelector("#villa-parcel");
   const {drawParcel}=await import("/parcel-house.js");
   const model=await drawParcel(host);
   const encoded=host.querySelector("canvas").toDataURL("image/webp",.96).split(",")[1];
   model.dispose();return encoded;
 });
 await writeFile("pinyoursite/public/villa-plot.webp",Buffer.from(data,"base64"));
}finally{await browser.close()}
