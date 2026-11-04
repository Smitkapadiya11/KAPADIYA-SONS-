import * as THREE from "three";

// Prelit panoramas preserve the Blender lighting in a single mobile draw call.
export function createInterior(dialog, camera, controls, redraw, maxTextureSize) {
  const scene = new THREE.Scene();
  const material = new THREE.MeshBasicMaterial({toneMapped:false});
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(8,48,24),material);
  sphere.geometry.scale(-1,1,1);
  sphere.rotation.y=-Math.PI/2;
  scene.add(sphere);
  const exteriorBar=dialog.querySelector('[aria-label="House camera views"]');
  const roomBar=dialog.querySelector(".room-controls");
  const enter=dialog.querySelector("#tour-inside");
  const exit=dialog.querySelector("#tour-outside");
  const hint=dialog.querySelector("#tour-hint");
  const title=dialog.querySelector("#house-title");
  const status=dialog.querySelector("#house-status");
  const rooms={living:"Living room",kitchen:"Kitchen & dining",bedroom:"Primary bedroom",bath:"Bath suite"};
  let current=null,request=0,disposed=false,returnView;
  const textureLoader=new THREE.TextureLoader();
  async function visit(name) {
    const id=++request;
    status.textContent="Opening "+rooms[name]+"…";
    try {
      const light=navigator.connection?.saveData || maxTextureSize<4096;
      const texture=await textureLoader.loadAsync("/rooms/"+(light?"compact/":"")+name+".webp");
      if(disposed||id!==request){texture.dispose();return}
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
      if(!current) returnView={position:camera.position.clone(),target:controls.target.clone(),fov:camera.fov};
      material.map?.dispose();material.map=texture;material.needsUpdate=true;
      current=name;dialog.classList.add("inside-villa");
      exteriorBar.hidden=true;roomBar.hidden=false;enter.setAttribute("aria-expanded","true");
      for(const b of roomBar.querySelectorAll("[data-room]")) b.setAttribute("aria-pressed",String(b.dataset.room===name));
      title.textContent=rooms[name];status.textContent="";hint.textContent="Drag to look around · Choose a room to move";
      controls.enableDamping=false;controls.update();
      controls.minDistance=.01;controls.maxDistance=.01;controls.minPolarAngle=.03;controls.maxPolarAngle=Math.PI-.03;
      controls.enableZoom=false;controls.rotateSpeed=-.5;
      camera.fov=camera.aspect<.8?82:68;camera.updateProjectionMatrix();
      controls.target.set(0,0,0);camera.position.set(0,0,.01);controls.update();
      redraw();canvas.focus({preventScroll:true});
    } catch {
      if(!disposed && id===request)status.textContent="This room could not load. Select it again to retry.";
    }
  }
  function leave(){
    ++request;
    if(current){
      controls.minDistance=10;controls.maxDistance=65;controls.minPolarAngle=.14;controls.maxPolarAngle=Math.PI*.49;
      controls.rotateSpeed=1;controls.enableDamping=true;controls.enableZoom=true;
      camera.fov=returnView.fov;camera.updateProjectionMatrix();
      controls.target.copy(returnView.target);camera.position.copy(returnView.position);controls.update();
      current=null;material.map?.dispose();material.map=null;
    }
    dialog.classList.remove("inside-villa");exteriorBar.hidden=false;roomBar.hidden=true;enter.setAttribute("aria-expanded","false");
    title.textContent="The Surat Courtyard Villa";status.textContent="";hint.textContent="Drag to orbit · Pinch or scroll to zoom";
    redraw();
  }
  const canvas=controls.domElement;
  let lastSpan=0;
  function changeFov(fov){
    camera.fov=THREE.MathUtils.clamp(fov,35,100);
    camera.updateProjectionMatrix();redraw();
  }
  function wheel(event){
    if(!current)return;
    event.preventDefault();
    changeFov(camera.fov*Math.exp(Math.sign(event.deltaY)*.07));
  }
  function touch(event){
    if(!current || event.touches.length!==2){lastSpan=0;return}
    const [a,b]=event.touches;
    const span=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    if(lastSpan && span>0){event.preventDefault();changeFov(camera.fov*lastSpan/span)}
    lastSpan=span;
  }
  function key(event){
    if(!current)return;
    const key=event.key;
    if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-"].includes(key))return;
    event.preventDefault();
    if(key==="+"||key==="="||key==="-"){changeFov(camera.fov+(key==="-"?5:-5));return}
    const look=new THREE.Spherical().setFromVector3(camera.position);
    if(key==="ArrowLeft")look.theta+=.12;
    if(key==="ArrowRight")look.theta-=.12;
    if(key==="ArrowUp")look.phi=Math.min(Math.PI-.03,look.phi+.12);
    if(key==="ArrowDown")look.phi=Math.max(.03,look.phi-.12);
    camera.position.setFromSpherical(look);controls.update();redraw();
  }
  canvas.addEventListener("keydown",key);
  canvas.addEventListener("wheel",wheel,{passive:false});
  for(const type of ["touchstart","touchmove","touchend","touchcancel"])canvas.addEventListener(type,touch,{passive:false});
  enter.onclick=()=>visit("living");
  exit.onclick=()=>{leave();enter.focus()};
  roomBar.onclick=e=>{const button=e.target.closest("[data-room]");if(button)visit(button.dataset.room)};
  return {
    get room(){return current},
    get scene(){return current?scene:null},
    dispose(){
      disposed=true;
      canvas.removeEventListener("keydown",key);
      canvas.removeEventListener("wheel",wheel);
      for(const type of ["touchstart","touchmove","touchend","touchcancel"])canvas.removeEventListener(type,touch);
      leave();sphere.geometry.dispose();material.dispose();
      enter.onclick=exit.onclick=roomBar.onclick=null;
    }
  };
}
