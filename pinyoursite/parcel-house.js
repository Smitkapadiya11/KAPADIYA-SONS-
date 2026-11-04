import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

// An oblique parallel projection keeps every point on the ground registered to
// the masterplan. Only elevated geometry shifts towards the back of the lot.
export async function drawParcel(host) {
  const width=15, depth=width*parseFloat(host.style.height)/parseFloat(host.style.width);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
  const scene=new THREE.Scene();
  const textures=[];
  try {
    renderer.setSize(512,Math.round(512*depth/width),false);
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    const camera=new THREE.OrthographicCamera(-width/2,width/2,depth/2,-depth/2,.1,100);
    camera.position.set(0,50,0);camera.up.set(0,0,-1);camera.lookAt(0,0,0);
    const baseProjection=camera.projectionMatrix.clone();
    const sun=new THREE.DirectionalLight(0xffe5b7,2.3);
    sun.position.set(-14,25,-15);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
    Object.assign(sun.shadow.camera,{left:-25,right:25,bottom:-26,top:26});sun.shadow.normalBias=.03;
    scene.add(sun,new THREE.HemisphereLight(0xfff4df,0x8c997c,1.55));
    function block(w,h,d,x,y,z,color){
      const part=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color}));
      part.position.set(x,y,z);part.castShadow=part.receiveShadow=true;scene.add(part);return part;
    }
    const lawn=block(width-.55,.15,depth-.55,0,-.15,0,0x809358);
    const forecourt=block(width-.72,.08,7.3,0,-.027,-depth/2+4,0xc4ad88);
    for(let i=0;i<10;i++)block(5,.04,.52,1.1,.02,-depth/2+1.1+i*.72,0xe5d5b6);
    for(const x of [-7,7])block(.22,.6,depth-.8,x,.18,0,0xbca78b);
    block(14,.6,.22,0,.18,depth/2-.5,0xbca78b);
    for(let i=0;i<6;i++)block(2.25,.07,.59,-2,.0,7+i*1.45,0xc9b79d);
    for(const x of [-5.8,5.8]){
      for(const z of [8,11.7,15.4]){
        const shrub=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({color:z===11.7?0x788248:0x4a743f,flatShading:true}));
        shrub.scale.set(.78,.9,1.25);shrub.rotation.y=z;shrub.position.set(x,.60,z);shrub.castShadow=true;scene.add(shrub);
        for(let k=0;k<5;k++){
          const tuft=shrub.clone();tuft.scale.multiplyScalar(.46);tuft.rotation.y=k*2.4;
          tuft.position.x+=Math.cos(k*2.4)*.54;tuft.position.z+=Math.sin(k*2.4)*.73;
          tuft.position.y+=.38;scene.add(tuft);
        }
      }
    }
    const {scene:villa}=await new GLTFLoader().loadAsync("/sample-house.glb");
    villa.rotation.y=Math.PI;villa.position.set(-.45,.53,-3.4);
    scene.add(villa);
    const stone=await new THREE.TextureLoader().loadAsync("/finishes/surat-stone.webp");
    const grass=stone.clone();grass.repeat.set(6,18);grass.wrapS=grass.wrapT=THREE.RepeatWrapping;grass.colorSpace=THREE.SRGBColorSpace;grass.needsUpdate=true;
    lawn.material.map=grass;forecourt.material.map=grass;
    textures.push(grass);
    textures.push(stone);stone.colorSpace=THREE.SRGBColorSpace;stone.wrapS=stone.wrapT=THREE.RepeatWrapping;
    villa.traverse(o=>{
      if(!o.isMesh)return;
      o.castShadow=o.receiveShadow=true;
      const m=o.material;
      if(m.name==="limestone")m.color.set(0xf3e5cc);
      if(m.name==="clay")m.color.set(0x9d493c);
      if(m.name==="tile")m.color.set(0xc56c4c);
      if(m.name==="glass"){m.color.set(0x38747a);m.roughness=.24}
      if(["limestone","stucco","paving"].includes(m.name))m.map=stone;
    });
    function render(){
      const x=.22,y=-.72;
      camera.projectionMatrix.copy(baseProjection).multiply(new THREE.Matrix4().set(1,0,x,50*x,0,1,y,50*y,0,0,1,0,0,0,0,1));
      renderer.render(scene,camera);
    }
    host.replaceChildren(renderer.domElement);
    render();
    return {dispose};
  } catch(error){dispose();throw error}
  function dispose(){
    textures.forEach(t=>t.dispose());
    scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();o.shadow?.map?.dispose()});
    renderer.dispose();renderer.forceContextLoss();
  }
}
