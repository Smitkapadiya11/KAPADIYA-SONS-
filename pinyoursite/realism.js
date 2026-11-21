import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";
import { EffectComposer, RenderPass, EffectPass, BloomEffect, SMAAEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { N8AOPostPass } from "n8ao";

// high: desktop-class GPUs; medium: phones and tablets; low: weak devices (no post effects).
export function qualityTier(mobile) {
  const memory = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
  const asked = new URLSearchParams(location.search).get("quality");
  if (["high", "medium", "low"].includes(asked)) return asked;
  if (memory < 4 || cores <= 4) return "low";
  return mobile ? "medium" : "high";
}

// Physically based sky (Preetham) that also lights reflections through a PMREM.
export function createSky(renderer) {
  const sky = new Sky();
  sky.scale.setScalar(4500);
  const u = sky.material.uniforms;
  const gain = { value: 0.32 };
  sky.material.onBeforeCompile = (shader) => {
    shader.uniforms.skyGain = gain;
    shader.fragmentShader = "uniform float skyGain;\n" + shader.fragmentShader.replace("gl_FragColor = vec4( texColor, 1.0 );", "gl_FragColor = vec4( texColor * skyGain, 1.0 );");
  };
  if (u.cloudCoverage) Object.assign(u.cloudCoverage, { value: 0.32 });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const envSky = sky.clone();
  envSky.material = sky.material;
  envSky.scale.setScalar(900);
  envScene.add(envSky);
  let target = null;
  const sun = new THREE.Vector3();
  return {
    mesh: sky,
    sun,
    set({ elevation, azimuth, turbidity, rayleigh, brightness }) {
      sun.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - elevation), THREE.MathUtils.degToRad(azimuth));
      u.sunPosition.value.copy(sun);
      u.turbidity.value = turbidity;
      u.rayleigh.value = rayleigh;
      u.mieCoefficient.value = 0.005;
      u.mieDirectionalG.value = 0.8;
      gain.value = brightness;
    },
    // Rebuild the reflection environment from the current sky (a few ms; done after mode changes).
    environment() {
      target?.dispose();
      target = pmrem.fromScene(envScene, 0, 1, 2000);
      return target.texture;
    },
  };
}

// CC0 PBR sets from ambientCG, converted to 512 px WebP. Each material name maps to a set and a tile size in metres.
const SETS = {
  grass: { tile: 4.5, rough: false },
  asphalt: { tile: 5 },
  plaster: { tile: 3 },
  wood: { tile: 1.6 },
  paving: { tile: 2.2 },
  concrete: { tile: 4 },
};
export const SURFACES = {
  lawn: "grass", earth: "concrete", asphalt: "asphalt", paving: "paving", curb: "concrete",
  render: "plaster", "render-warm": "plaster", wall: "plaster", stone: "concrete", concrete: "concrete",
  teak: "wood", track: "concrete", rubber: "concrete",
};
export async function loadSurfaces(anisotropy) {
  const loader = new THREE.TextureLoader();
  const load = (url, srgb) =>
    loader.loadAsync(url).then((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = anisotropy;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    });
  const out = {};
  await Promise.all(
    Object.entries(SETS).map(async ([name, set]) => {
      const [map, normalMap, roughnessMap] = await Promise.all([
        load(`/tex/${name}-c.webp`, true),
        load(`/tex/${name}-n.webp`, false),
        set.rough === false ? null : load(`/tex/${name}-r.webp`, false),
      ]);
      out[name] = { map, normalMap, roughnessMap, tile: set.tile };
    }),
  );
  return out;
}
// Apply a set to a material whose UVs are in metres (Blender planar UVs) or scaled by `uvScale`.
export function applySurface(material, set, uvScale = 1) {
  const repeat = uvScale / set.tile;
  for (const key of ["map", "normalMap", "roughnessMap"]) {
    if (!set[key]) continue;
    const t = set[key].clone();
    t.repeat.setScalar(repeat);
    t.needsUpdate = true;
    material[key] = t;
  }
  material.normalScale = new THREE.Vector2(0.7, 0.7);
  if (set.roughnessMap) material.roughness = 1;
  material.needsUpdate = true;
}

// Post-processing: contact shadows (N8AO), bloom for lamps and lit windows, SMAA and filmic tone mapping.
export function createPipeline(renderer, scene, camera, tier) {
  if (tier === "low") return null;
  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType });
  composer.addPass(new RenderPass(scene, camera));
  const ao = new N8AOPostPass(scene, camera, 1, 1);
  Object.assign(ao.configuration, {
    aoRadius: 3.2, distanceFalloff: 1.2, intensity: tier === "high" ? 2.6 : 2.2, color: new THREE.Color(0x10140f),
    halfRes: tier !== "high", depthAwareUpsampling: true, gammaCorrection: false,
  });
  ao.setQualityMode(tier === "high" ? "Medium" : "Performance");
  composer.addPass(ao);
  const bloom = new BloomEffect({ luminanceThreshold: 0.85, luminanceSmoothing: 0.2, intensity: 0.7, mipmapBlur: true, radius: 0.6 });
  composer.addPass(new EffectPass(camera, bloom, new SMAAEffect(), new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC })));
  renderer.toneMapping = THREE.NoToneMapping;
  return {
    render: () => composer.render(),
    setSize: (w, h) => composer.setSize(w, h),
    bloom,
    dispose: () => composer.dispose(),
  };
}
