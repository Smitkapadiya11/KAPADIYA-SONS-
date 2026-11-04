import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

export async function startHouse(dialog) {
  const stage = dialog.querySelector(".house-stage");
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
  const camera = new THREE.PerspectiveCamera(39,1,.15,180);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0,0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-label","Orbitable 3D exterior of the sample villa");
  stage.append(canvas);
  const controls = new OrbitControls(camera,canvas);
  controls.enablePan = false;
  controls.minDistance = 10;
  controls.maxDistance = 65;
  controls.maxPolarAngle = Math.PI*.49;
  controls.minPolarAngle = .14;
  controls.enableDamping = true;
  const sun = new THREE.DirectionalLight(0xffedd3,2.45);
  sun.position.set(-12,19,15);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera,{left:-13,right:13,top:14,bottom:-14});
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.normalBias = .025;
  scene.add(sun,new THREE.HemisphereLight(0xfff5e2,0xb9c4ab,1.85));
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(130,130),new THREE.ShadowMaterial({opacity:.18}));
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
    if(flight){
      const t=Math.min(1,(now-flight.start)/520),ease=t*t*(3-2*t);
      camera.position.lerpVectors(flight.from,flight.to,ease);
      controls.target.lerpVectors(flight.origin,flight.focus,ease);
      if(t===1) flight=null;
    }
    controls.update();
    renderer.render(scene,camera);
    if(flight) draw();
  }
  controls.addEventListener("change",draw);
  controls.addEventListener("start",()=>{flight=null;buttons.forEach(b=>b.setAttribute("aria-pressed","false"));});
  function resize() {
    const {width,height}=stage.getBoundingClientRect();
    if(!width||!height) return;
    camera.aspect=width/height;camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);preset(active,false);
  }
  const observer=new ResizeObserver(resize);
  function dispose(){
    disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();
    scene.traverse(o=>{o.geometry?.dispose();if(o.material) o.material.dispose()});
    sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
    for(const b of buttons) if(b.onclick===choose) b.onclick=null;
  }
  function choose(e){preset(e.currentTarget.dataset.view,true);}
  try {
    const {scene:model}=await new GLTFLoader().loadAsync("/sample-house.glb");
    model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
    scene.add(model);
    if(dialog.open && stage.lastElementChild===canvas){
      for(const b of buttons)b.onclick=choose;
      resize();observer.observe(stage);
    }
    return dispose;
  } catch(error){dispose();throw error;}
}
