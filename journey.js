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
const stars=new THREE.BufferGeometry(),positions=[];
for(let i=0;i<180;i++){positions.push(Math.sin(i*13.1)*12,Math.cos(i*7.3)*8,-4-(i%25)*.45);}
stars.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xa9e27d,size:.025,transparent:true,opacity:.5})));
const chapters=[...document.querySelectorAll('.signal-hero,#selected-work,#studio,#pinyoursite,#avatar,.manifesto,#services,#plans,#about,#brief,footer')];
let anchors=[],p=0,target=0,px=0,py=0,tx=0,ty=0,frame=0,last=0;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
function measure(){anchors=chapters.map(e=>e.getBoundingClientRect().top+scrollY);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);update();}
function update(){let n=0;for(let i=0;i<anchors.length;i++)if(scrollY>=anchors[i]-innerHeight*.35)n=i;const a=anchors[n]-innerHeight*.35,b=(anchors[n+1]||document.documentElement.scrollHeight)-innerHeight*.35;target=n+Math.max(0,Math.min(1,(scrollY-a)/Math.max(1,b-a)));}
function render(now=0){frame=0;const off=reduced.matches||document.body.classList.contains('motion-paused');const dt=Math.min(40,now-last||16);last=now;p+=(target-p)*(off?1:1-Math.exp(-dt/160));px+=(tx-px)*.06;py+=(ty-py)*.06;
 const mobile=innerWidth<801;
 const turn=p*Math.PI*.38;
 // The same assembly travels, opens, and reforms across the entire document.
 machine.rotation.set(.35+Math.sin(p*.7)*.5+py*.12,turn+px*.2,-.25+Math.sin(p*.6)*.25);
 machine.position.set(Math.cos(p*Math.PI)* (mobile?.65:2.1),Math.sin(p*.8)*.35,0);
 const expansion=.16+Math.pow(Math.sin(p*Math.PI*.5),2)*.62;
 layers.forEach((layer,i)=>{layer.position.z=(i-5)*expansion;layer.rotation.z=(i%2?1:-1)*p*.18;});
 cage.rotation.set(p*.7,p*.4,0);
 camera.position.set(Math.sin(p*.45)*.5,Math.cos(p*.6)*.4,mobile?12:8.4+Math.sin(p*Math.PI)*1.1);camera.lookAt(0,0,0);
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
