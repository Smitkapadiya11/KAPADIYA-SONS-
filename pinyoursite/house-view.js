import {applySurfaces} from "./villa-surfaces.js";
import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

import {createInterior} from "./interior-view.js";

import {villaDimensions} from "./villa-dimensions.js";

export async function startHouse(dialog) {
  const stage = dialog.querySelector(".house-stage");
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
  const camera = new THREE.PerspectiveCamera(39,1,.15,180);
  const maxRatio=Math.min(devicePixelRatio,1.75);
  renderer.setPixelRatio(maxRatio);
  renderer.shadowMap.autoUpdate=false;
  renderer.shadowMap.needsUpdate=true;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0,0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-label","Interactive villa exterior and interior tour");
  canvas.tabIndex=0;
  stage.append(canvas);
  const controls = new OrbitControls(camera,canvas);
  controls.enablePan = false;
  controls.minDistance = 10;
  controls.maxDistance = 65;
  controls.maxPolarAngle = Math.PI*.49;
  controls.minPolarAngle = .14;
  controls.enableDamping = true;
  const sun = new THREE.DirectionalLight(0xffe3ba,2.85);
  sun.position.set(-15,13,11);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera,{left:-13,right:13,top:14,bottom:-14});
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.normalBias = .018;
  sun.shadow.bias = -.00015;
  let reflection;
  scene.add(sun,new THREE.HemisphereLight(0xe4f0ff,0x927956,.95));
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(130,130),new THREE.ShadowMaterial({opacity:.37}));
  shadow.rotation.x = -Math.PI/2;
  shadow.position.y = -.49;
  shadow.receiveShadow = true;
  scene.add(shadow);

  const views = {
    street:{direction:[.50,.27,1],target:[0,3.65,0],radius:15},
    balcony:{direction:[-.25,.18,1],target:[0,4.5,2.1],radius:9.2},
    aerial:{direction:[.60,1.35,.70],target:[0,2.1,0],radius:15}
  };
  let active="street", flight=null, frame=0, disposed=false;
  let interior;
  const dimensions=villaDimensions(dialog,camera,draw);
  let lastFrame=0, slowFrames=0, movingRatio=maxRatio, sharpenTimer=0;
  const finishes=[];
  const buttons=[...dialog.querySelectorAll("[data-view]")];
  function preset(name,animate) {
    active=name;
    const {direction,target,radius}=views[name];
    const focus=new THREE.Vector3(...target);
    const distance=radius/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*Math.min(1,camera.aspect))*.66;
    const position=new THREE.Vector3(...direction).normalize().multiplyScalar(Math.min(distance,62)).add(focus);
    for(const b of buttons) b.setAttribute("aria-pressed",String(b.dataset.view===name));
    if(animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flight={from:camera.position.clone(),to:position,origin:controls.target.clone(),focus,start:performance.now()};
    } else {
      flight=null;camera.position.copy(position);controls.target.copy(focus);controls.update();
    }
    draw();
  }
  function draw() {
    if(!disposed && !frame) frame=requestAnimationFrame(render);
  }
  function render(now) {
    frame=0;
    if(flight && !interior?.scene){
      const t=Math.min(1,(now-flight.start)/520),ease=t*t*(3-2*t);
      camera.position.lerpVectors(flight.from,flight.to,ease);
      controls.target.lerpVectors(flight.origin,flight.focus,ease);
      if(t===1) flight=null;
    }
    controls.update();
    if(interior?.scene) flight=null;
    // Lower the drawing resolution only after sustained slow motion frames.
    // Exclude idle gaps so they do not reduce image quality.
    const interval=now-lastFrame;
    slowFrames=interval>21 && interval<110 ? slowFrames+1 : 0;
    if(slowFrames>=8 && renderer.getPixelRatio()>.85){
      movingRatio=Math.max(.85,renderer.getPixelRatio()-.2);renderer.setPixelRatio(movingRatio);slowFrames=0;
    }
    lastFrame=now;
    renderer.render(interior?.scene || scene,camera);
    dimensions.update(interior?.room || "exterior",stage.clientWidth,stage.clientHeight);
    clearTimeout(sharpenTimer);
    if(renderer.getPixelRatio()<maxRatio){
      sharpenTimer=setTimeout(()=>{if(!disposed){renderer.setPixelRatio(maxRatio);draw()}},300);
    }
    if(flight) draw();
  }
  controls.addEventListener("change",draw);
  controls.addEventListener("start",()=>{if(renderer.getPixelRatio()!==movingRatio)renderer.setPixelRatio(movingRatio);flight=null;buttons.forEach(b=>b.setAttribute("aria-pressed","false"));});
  function resize() {
    const {width,height}=stage.getBoundingClientRect();
    if(!width||!height) return;
    camera.aspect=width/height;camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);
    if(interior?.scene)draw();else preset(active,false);
  }
  const observer=new ResizeObserver(resize);
  function dispose(){
    disposed=true;clearTimeout(sharpenTimer);cancelAnimationFrame(frame);observer.disconnect();dimensions.dispose();interior?.dispose();controls.dispose();
    reflection?.dispose();finishes.forEach(texture=>texture.dispose());
    scene.traverse(o=>{o.geometry?.dispose();if(o.material) o.material.dispose()});
    sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
    for(const b of buttons) if(b.onclick===choose) b.onclick=null;
  }
  function choose(e){preset(e.currentTarget.dataset.view,true);}
  try {
    const {scene:model}=await new GLTFLoader().loadAsync("/sample-house.glb");
    scene.add(model);
    // Only glazing uses a reflection cube. Its six faces were baked offline.
    const [atlas,garden,maps]=await Promise.all([
      new THREE.ImageLoader().loadAsync("/finishes/garden-glazing.webp"),
      new THREE.TextureLoader().loadAsync("/finishes/surat-garden.webp"),
      applySurfaces(model,renderer,finishes)
    ]);
    // An unlit sky shell keeps the camera orbit and panorama colour independent
    // of sun exposure. It costs one draw and needs no runtime reflection baking.
    garden.colorSpace=THREE.SRGBColorSpace;finishes.push(garden);
    const sky=new THREE.Mesh(new THREE.SphereGeometry(108,48,24),new THREE.MeshBasicMaterial({map:garden,toneMapped:false}));
    sky.geometry.scale(-1,1,1);sky.rotation.y=-Math.PI/2;scene.add(sky);
    const sides=Array.from({length:6},(_,side)=>{
      const c=document.createElement("canvas");c.width=c.height=atlas.height;
      c.getContext("2d").drawImage(atlas,side*c.width,0,c.width,c.height,0,0,c.width,c.height);
      return c;
    });
    reflection=new THREE.CubeTexture(sides);reflection.colorSpace=THREE.SRGBColorSpace;reflection.needsUpdate=true;
    // Feather the near lawn into the panoramic garden at the edge of the lot.
    if(maps["doob-grass"]){
      const turf=maps["doob-grass"].clone();turf.repeat.setScalar(62);finishes.push(turf);
      const ground=new THREE.MeshStandardMaterial({map:turf,color:0x9fa887,roughness:1,transparent:true,depthWrite:false});
      ground.onBeforeCompile=shader=>{
        shader.vertexShader="varying vec2 groundUV;\n"+shader.vertexShader.replace("#include <uv_vertex>","#include <uv_vertex>\ngroundUV=uv;");
        shader.fragmentShader="varying vec2 groundUV;\n"+shader.fragmentShader.replace("#include <alphamap_fragment>","#include <alphamap_fragment>\ndiffuseColor.a*=1.0-smoothstep(0.22,0.50,length(groundUV-0.5));");
      };
      const lawn=new THREE.Mesh(new THREE.PlaneGeometry(62,62),ground);
      lawn.rotation.x=-Math.PI/2;lawn.position.y=-.035;lawn.receiveShadow=true;scene.add(lawn);
      shadow.visible=false;
    }
    model.traverse(o=>{
      if(!o.isMesh)return;
      o.castShadow=true;o.receiveShadow=true;
      if(o.material.name==="glass"){
        const old=o.material;
        o.material=new THREE.MeshPhongMaterial({color:0x827f79,map:maps["window-linen"],envMap:reflection,combine:THREE.MixOperation,reflectivity:.17,shininess:85,vertexColors:true});
        old.dispose();
      }
      if(o.material.name==="brass"){o.material.metalness=.73;o.material.roughness=.31}
    });
    if(dialog.open && stage.lastElementChild===canvas){
      interior=createInterior(dialog,camera,controls,draw,renderer.capabilities.maxTextureSize);
      for(const b of buttons)b.onclick=choose;
      resize();observer.observe(stage);
    }
    return dispose;
  } catch(error){dispose();throw error;}
}
