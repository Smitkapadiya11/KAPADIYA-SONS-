import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

const views={
  overhead:{target:[0,.16,-.35],direction:[.18,1,.39],span:12.8},
  living:{target:[-3,.35,.48],direction:[.22,.85,.86],span:5.5},
  bedrooms:{target:[3.0,.22,-.12],direction:[.28,1,.32],span:8.8},
  kitchen:{target:[-.25,.55,-2.05],direction:[.28,.72,.86],span:4.5}
};
export async function openFlat(dialog,isCurrent){
  const stage=dialog.querySelector(".flat-stage"),buttons=[...dialog.querySelectorAll("[data-flat-view]")];
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
  renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=THREE.PCFShadowMap;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,120);
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute("aria-label","Furnished B-102 cutaway, drag to orbit or use the viewpoint buttons");
  const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.enablePan=false;
  controls.minPolarAngle=.02;controls.maxPolarAngle=1.24;controls.minDistance=3;controls.maxDistance=68;
  const hemi=new THREE.HemisphereLight(0xfff5e4,0xa29b91,1.65);
  const sun=new THREE.DirectionalLight(0xffebce,2.6);sun.position.set(-6,14,7);sun.castShadow=true;
  Object.assign(sun.shadow.camera,{left:-8,right:8,bottom:-8,top:8});sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.018;
  scene.add(hemi,sun);
  let frame=0,disposed=false,flight=null,active="overhead";
  function draw(){if(!frame&&!disposed)frame=requestAnimationFrame(render)}
  function render(now){
    frame=0;
    if(flight){
      const t=Math.min(1,(now-flight.start)/430),s=t*t*(3-2*t);
      camera.position.lerpVectors(flight.eye,flight.end,s);controls.target.lerpVectors(flight.from,flight.focus,s);
      if(t===1)flight=null;
    }
    controls.update();renderer.render(scene,camera);if(flight)draw();
  }
  function preset(name,animate){
    active=name;const v=views[name],focus=new THREE.Vector3(...v.target);
    const distance=v.span/(2*Math.tan(Math.PI*camera.fov/360)*Math.min(1,camera.aspect));
    const end=new THREE.Vector3(...v.direction).normalize().multiplyScalar(distance).add(focus);
    if(animate&&!matchMedia("(prefers-reduced-motion:reduce)").matches){
      flight={eye:camera.position.clone(),end,from:controls.target.clone(),focus,start:performance.now()};
    }else{flight=null;controls.target.copy(focus);camera.position.copy(end);controls.update()}
    for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.flatView===name));draw();
  }
  function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();preset(active,false);
  }
  function choose(e){preset(e.currentTarget.dataset.flatView,true)}
  const observer=new ResizeObserver(resize);
  function clean(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();
    const assets=new Set();
    scene.traverse(o=>{if(o.geometry)assets.add(o.geometry);for(const m of [].concat(o.material||[])){assets.add(m);for(const v of Object.values(m))if(v?.isTexture)assets.add(v)}});
    for(const a of assets)a.dispose();sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
    for(const b of buttons)if(b.onclick===choose)b.onclick=null;
  }
  try{
    const gltf=await new GLTFLoader().loadAsync("/apartments/flat/b102.gltf");
    scene.add(gltf.scene);if(!isCurrent())return clean;
    gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true}});
    stage.append(canvas);controls.addEventListener("change",draw);controls.addEventListener("start",()=>flight=null);
    for(const b of buttons)b.onclick=choose;
    renderer.shadowMap.needsUpdate=true;resize();observer.observe(stage);
    dialog.classList.add("interactive");dialog.querySelector("#flat-hint").textContent="Drag to orbit · Pinch or scroll to zoom";
    return clean;
  }catch(e){clean();throw e}
}
