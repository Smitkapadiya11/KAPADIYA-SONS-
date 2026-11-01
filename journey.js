import * as THREE from 'three';
const host=document.createElement('div');host.id='journey-world';host.setAttribute('aria-hidden','true');document.body.prepend(host);
let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{host.remove();}
if(renderer){
host.append(renderer.domElement);
document.body.classList.add('journey-ready');
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
scene.add(new THREE.HemisphereLight(0xd9ffc0,0x111b24,3));
const light=new THREE.DirectionalLight(0xecffd3,5);light.position.set(3,5,5);scene.add(light);
const rim=new THREE.PointLight(0x8aff22,55,25);rim.position.set(-4,1,4);scene.add(rim);
const machine=new THREE.Group();scene.add(machine);
const metal=new THREE.MeshStandardMaterial({color:0x24352b,metalness:.75,roughness:.29});
const bright=new THREE.MeshStandardMaterial({color:0xbbff39,emissive:0x83db13,emissiveIntensity:.55,metalness:.3,roughness:.25});
const layers=[];
for(let i=0;i<11;i++){
 const group=new THREE.Group();machine.add(group);layers.push(group);
 const radius=1.8+Math.sin(i/10*Math.PI)*.35;
 const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.065,8,96),i%3===0?bright:metal);group.add(ring);
 const inner=new THREE.Mesh(new THREE.TorusGeometry(radius-.3,.025,6,80),bright);group.add(inner);
 const teeth=new THREE.InstancedMesh(new THREE.BoxGeometry(.12,.23,.14),metal,18);
 const accents=new THREE.InstancedMesh(new THREE.BoxGeometry(.12,.23,.14),bright,6);
 const dummy=new THREE.Object3D();
 let metalIndex=0;
 for(let j=0;j<24;j++){const a=j/24*Math.PI*2;dummy.position.set(Math.cos(a)*radius,Math.sin(a)*radius,0);dummy.rotation.z=a;dummy.updateMatrix();if(j%4===0)accents.setMatrixAt(j/4,dummy.matrix);else teeth.setMatrixAt(metalIndex++,dummy.matrix);}
 group.add(teeth,accents);
 group.position.z=(i-5)*.16;
}
const cage=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.15,1)),new THREE.LineBasicMaterial({color:0xbaff45,transparent:true,opacity:.8}));machine.add(cage);
const ribbons=new THREE.Group();machine.add(ribbons);
for(let k=0;k<7;k++){
 const points=[];
 for(let j=0;j<=180;j++){
  const a=j/180*Math.PI*2,r=2.45+.18*Math.sin(a*3+k*.45);
  points.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,Math.sin(a*2+k*.5)*.55));
 }
 const ribbon=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:k%2?0xdfffad:0x91dc45,transparent:true,opacity:.22+k*.035}));
 ribbon.rotation.set(k*.16,k*.21,0);ribbons.add(ribbon);
}
const stars=new THREE.BufferGeometry(),positions=[];
// Three authored worlds share one camera and hand off through scroll position.
const city=new THREE.Group(),orbit=new THREE.Group();scene.add(city,orbit);
const architectural=new THREE.LineBasicMaterial({color:0xc1ff79,transparent:true,opacity:.8});
for(let i=0;i<25;i++){
 const height=.6+((i*7)%11)*.22;
 const tower=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.48,height,.48)),architectural);
 tower.position.set((i%5-2)*.72,height/2-1.2,(Math.floor(i/5)-2)*.72);city.add(tower);
}
const foundation=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4,.08,4)),architectural);foundation.position.y=-1.25;city.add(foundation);
// Window bands, a street grid and corner pylons complete the architectural model.
for(let k=0;k<5;k++){
 const points=[new THREE.Vector3(-2,-1.19,(k-2)*.8),new THREE.Vector3(2,-1.19,(k-2)*.8),new THREE.Vector3((k-2)*.8,-1.19,-2),new THREE.Vector3((k-2)*.8,-1.19,2)];
 city.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),architectural));
}
const connections=[];
for(let i=0;i<2;i++){
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(65*3),3));
 const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0xbaff64,transparent:true,opacity:.48}));scene.add(line);
 const pulse=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),bright);scene.add(pulse);connections.push({line,pulse});
}
const path=new THREE.CubicBezierCurve3(new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3());
const nucleus=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.1,1)),architectural);orbit.add(nucleus);
const satellites=[];
for(let i=0;i<5;i++){
 const lane=new THREE.Group();lane.rotation.set(i*.55,i*.7,i*.3);orbit.add(lane);
 lane.add(new THREE.Mesh(new THREE.TorusGeometry(1.8+i*.12,.015,4,96),bright));
 const node=new THREE.Mesh(new THREE.IcosahedronGeometry(.11,0),bright);lane.add(node);satellites.push(node);
}
for(let i=0;i<180;i++){positions.push(Math.sin(i*13.1)*12,Math.cos(i*7.3)*8,-4-(i%25)*.45);}
stars.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xa9e27d,size:.025,transparent:true,opacity:.5})));
const chapters=[...document.querySelectorAll('.signal-hero,#selected-work,#studio,#pinyoursite,#avatar,.manifesto,#services,#plans,#about,#brief,footer')];
let anchors=[],p=0,target=0,px=0,py=0,tx=0,ty=0,frame=0,last=0,flow=0;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
function measure(){anchors=chapters.map(e=>e.getBoundingClientRect().top+scrollY);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);update();}
function update(){let n=0;for(let i=0;i<anchors.length;i++)if(scrollY>=anchors[i]-innerHeight*.35)n=i;const a=anchors[n]-innerHeight*.35,b=(anchors[n+1]||document.documentElement.scrollHeight)-innerHeight*.35;target=n+Math.max(0,Math.min(1,(scrollY-a)/Math.max(1,b-a)));}
function render(now=0){frame=0;const off=reduced.matches||document.body.classList.contains('motion-paused');const dt=Math.min(40,now-last||16);last=now;if(!off&&!document.hidden)flow+=dt*.0004;p+=(target-p)*(off?1:1-Math.exp(-dt/65));px+=(tx-px)*.18;py+=(ty-py)*.18;
 const mobile=innerWidth<801;
 const turn=p*Math.PI*.38;
 // The same assembly travels, opens, and reforms across the entire document.
 machine.rotation.set(.35+Math.sin(p*.7)*.5+py*.48+Math.sin(flow)*.06,turn+px*.65,-.25+Math.sin(p*.6)*.25);
 machine.position.set(Math.cos(p*Math.PI)* (mobile?.65:2.1),Math.sin(p*.8)*.35,0);
 const expansion=.16+Math.pow(Math.sin(p*Math.PI*.5),2)*.62;
 // Continuous morph weights: assembled portal → helix → petal fan → portal.
 // Transform the shared layers instead of rebuilding geometry each frame.
 const helix=Math.pow(.5-.5*Math.cos(p*Math.PI*.66),2);
 const petals=Math.pow(.5-.5*Math.cos(p*Math.PI*.43),4);
 layers.forEach((layer,i)=>{
   const phase=i/11*Math.PI*2+flow;
   const wave=Math.sin(flow*1.5+i*.48);
   layer.position.set(Math.cos(phase)*helix*.85,Math.sin(phase)*helix*.85,(i-5)*expansion+wave*.06);
   layer.rotation.set(Math.cos(phase)*petals*.8,Math.sin(phase)*petals*.8,(i%2?1:-1)*(p*.18+flow*.12));
   const breath=1+wave*.025;
   layer.scale.set(breath*(1+petals*.22),breath*(1-petals*.3),1);
 });
 cage.rotation.set(p*.7+flow*.25,p*.4+flow*.18,0);
 cage.scale.setScalar(1+Math.sin(flow*1.4)*.045);
 ribbons.rotation.set(flow*.12,p*.35,-flow*.16);
 ribbons.scale.setScalar(1+helix*.1);
 rim.position.set(-4+px*5,1-py*4,4);
 const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
 const cityWeight=smooth(1.7,2.8,p)*(1-smooth(4,4.8,p));
 const orbitWeight=smooth(4.1,5.2,p)*(1-smooth(7.5,8.4,p));
 const portalWeight=1-Math.max(cityWeight,orbitWeight);
 machine.scale.setScalar(.16+portalWeight*.68);machine.visible=true;
 for(const [world,weight] of [[city,cityWeight],[orbit,orbitWeight]]){
  world.visible=true;world.position.copy(machine.position);world.rotation.copy(machine.rotation);world.scale.setScalar(.16+weight*.68);
 }
 // Inactive worlds remain complete satellites, joined by flowing vector conduits.
 machine.position.x=machine.position.x*portalWeight-2.55*(1-portalWeight);
 machine.position.y+=1.5*(1-portalWeight);
 city.position.x=city.position.x*cityWeight+2.6*(1-cityWeight);city.position.y-=1.45*(1-cityWeight);
 orbit.position.x=orbit.position.x*orbitWeight+2.5*(1-orbitWeight);orbit.position.y+=1.65*(1-orbitWeight);
 if(mobile){machine.position.x*=.55;city.position.x*=.55;orbit.position.x*=.55;}
 connections.forEach(({line,pulse},i)=>{
  const from=i===0?machine.position:city.position,to=i===0?city.position:orbit.position;
  path.v0.copy(from);path.v3.copy(to);path.v1.set(from.x+1,from.y-1.3,-1);path.v2.set(to.x-1,to.y+1.3,-1);
  const attribute=line.geometry.attributes.position;
  for(let j=0;j<=64;j++){const v=path.getPoint(j/64);attribute.setXYZ(j,v.x,v.y,v.z);}
  attribute.needsUpdate=true;line.geometry.computeBoundingSphere();pulse.position.copy(path.getPoint((flow*.23+i*.5)%1));
 });
 city.rotation.x=.35+py*.4;city.rotation.y=p*.65+px*.65+flow*.08;
 nucleus.rotation.set(flow*.3,flow*.2,0);
 satellites.forEach((node,i)=>{const a=flow*(.6+i*.12)+i,r=1.8+i*.12;node.position.set(Math.cos(a)*r,Math.sin(a)*r,0);});
 camera.position.set(Math.sin(p*.45)*.5,Math.cos(p*.6)*.4,mobile?14.5:8.4+Math.sin(p*Math.PI)*1.1);camera.lookAt(0,0,0);
 renderer.render(scene,camera);
 if(!document.hidden&&!off)frame=requestAnimationFrame(render);
}
function sync(){cancelAnimationFrame(frame);render();}
window.addEventListener('scroll',()=>{update();if(!frame)render();},{passive:true});
window.addEventListener('pointermove',e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5;},{passive:true});
window.addEventListener('resize',measure,{passive:true});
new ResizeObserver(measure).observe(document.querySelector('main'));
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
document.fonts.ready.then(measure);measure();render();
}
