import * as THREE from "three";

const surfaces=[
  ["lime-plaster",["stucco","trim"],1,.91,.009],
  ["surat-stone",["limestone"],1,.78,.012],
  ["kota-court",["paving"],.82,.55,.018],
  ["fired-clay",["clay","tile"],1.6,.84,.014],
  ["doob-grass",["lawn"],2.25,.98,.021],
  ["surat-teak",["oak"],1,.46,.007],
  ["palm-frond",["fronds"],1,.85,0],
  ["window-linen",["glass"],1,.28,0]
];

// Both the fixed plot portrait and the orbit viewer use the same material library.
export async function applySurfaces(model,renderer,owned){
  const loader=new THREE.TextureLoader();
  const loaded=await Promise.allSettled(surfaces.map(([name])=>loader.loadAsync("/finishes/"+name+".webp")));
  const maps={};
  for(const [i,result] of loaded.entries()){
    if(result.status!=="fulfilled")continue;
    const [name,names,scale,rough,bump]=surfaces[i],map=result.value;
    map.colorSpace=THREE.SRGBColorSpace;
    map.wrapS=map.wrapT=THREE.MirroredRepeatWrapping;map.repeat.setScalar(scale);
    map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());owned.push(map);maps[name]=map;
    model.traverse(o=>{
      if(!o.isMesh||!names.includes(o.material.name))return;
      const m=o.material;m.color.set(0xf6f2e9);m.map=map;if(bump){m.bumpMap=map;m.bumpScale=bump}m.roughness=rough;
      if(m.name==="fronds"){m.alphaTest=.40;m.side=THREE.DoubleSide;m.color.set(0xbfc9a8)}
    });
  }
  return maps;
}
