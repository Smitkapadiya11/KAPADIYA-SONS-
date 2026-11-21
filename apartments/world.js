import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { qualityTier, createSky, loadSurfaces, applySurface, createPipeline } from "./realism.js";

const ROOT = "/apartments/";
const STATUS = { available: 0x2ec27e, hold: 0xf5a524, sold: 0xe5484d };
export const statusGroup = (s) => (s === "available" || s === "sold" ? s : "hold");
const MODES = {
  day: {
    elevation: 34, azimuth: 225, turbidity: 4, rayleigh: 1.2, brightness: 0.3, fog: 0xcfd8de, sun: 0xffe9cc, sunI: 2.7,
    hemiSky: 0xcfdcf0, hemiGround: 0x5a4a35, hemiI: 0.7, night: 0, lamp: 0.25, water: 0, exposure: 0.98, env: 0.55,
  },
  dusk: {
    elevation: 4, azimuth: 290, turbidity: 8, rayleigh: 2.4, brightness: 0.55, fog: 0x7a6258, sun: 0xffa060, sunI: 1.2,
    hemiSky: 0x5d6ca8, hemiGround: 0x241d18, hemiI: 0.85, night: 1, lamp: 4.5, water: 0.9, exposure: 1.15, env: 0.4,
  },
};
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const quadrantOf = (id) => Number(id.slice(-2)); // 01 NW, 02 NE, 03 SE, 04 SW

function canvasTexture(draw, size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const noise = (base, spread) =>
  canvasTexture((g, n) => {
    const img = g.createImageData(n, n);
    for (let i = 0; i < n * n; i++) {
      const v = (Math.random() - 0.5) * spread;
      img.data.set([base[0] + v, base[1] + v * 1.1, base[2] + v * 0.8, 255], i * 4);
    }
    g.putImageData(img, 0, 0);
  });
const windowTexture = () =>
  canvasTexture((g) => {
    for (let i = 0; i < 4; i++) {
      const lit = Math.random() > 0.2, grad = g.createLinearGradient(0, 0, 0, 128);
      grad.addColorStop(0, lit ? "#ffd598" : "#2c241d");
      grad.addColorStop(1, lit ? "#c9773c" : "#15110d");
      g.fillStyle = grad;
      g.fillRect(i * 32, 0, 32, 128);
      if (lit && Math.random() > 0.45) { g.fillStyle = "rgba(255,244,222,.5)"; g.fillRect(i * 32 + 4, 0, 10, 128); }
    }
    g.fillStyle = "#16130f";
    for (let i = 0; i <= 4; i++) g.fillRect(i * 32 - 1, 0, 2, 128);
  });

export async function createWorld({ host, labels, data, onPickWing, onPickUnit, onHover, onProgress }) {
  const mobile = matchMedia("(max-width: 760px), (pointer: coarse)").matches;
  let tier = qualityTier(mobile);
  let pipeline = null;
  // Post-processing does its own anti-aliasing (SMAA), so MSAA is only for the low tier.
  const renderer = new THREE.WebGLRenderer({ antialias: tier === "low", powerPreference: "high-performance", stencil: false });
  const maxRatio = Math.min(devicePixelRatio, mobile ? 1.6 : 1.75);
  let ratio = maxRatio;
  renderer.setPixelRatio(ratio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const canvas = renderer.domElement;
  canvas.className = "world-canvas";
  host.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.3, 2600);
  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, {
    enableDamping: true, dampingFactor: 0.085, screenSpacePanning: false, zoomToCursor: true,
    minDistance: 10, maxDistance: 420, maxPolarAngle: 1.45, minPolarAngle: 0.1, rotateSpeed: mobile ? 0.7 : 0.55,
  });
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

  const hemi = new THREE.HemisphereLight();
  const sun = new THREE.DirectionalLight();
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar((navigator.deviceMemory || 8) < 4 ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 10, far: 520 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.06;
  scene.add(hemi, sun, sun.target);
  const sky = createSky(renderer);
  scene.add(sky.mesh);
  scene.fog = new THREE.Fog(0xffffff, 320, 1400);
  const grass = noise([98, 128, 66], 32);
  grass.repeat.set(500, 500);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3600, 3600), new THREE.MeshStandardMaterial({ map: grass, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.06;
  ground.receiveShadow = true;
  ground.userData.uvScale = 3600;
  scene.add(ground);

  // Blender assets.
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_, done, total) => onProgress?.(done / total);
  const loader = new GLTFLoader(manager);
  const [towers, site, props, layout] = await Promise.all([
    loader.loadAsync(ROOT + "world/towers.glb"),
    loader.loadAsync(ROOT + "world/site.glb"),
    loader.loadAsync(ROOT + "world/props.glb"),
    fetch(ROOT + "world/layout.json").then((r) => r.json()),
  ]);
  const night = { value: 0 }, lampMaterials = new Set(), waterMaterials = new Set();
  const asphalt = noise([60, 62, 66], 16), lawn = noise([106, 140, 70], 30);
  asphalt.repeat.setScalar(0.25);
  lawn.repeat.setScalar(0.4);
  function tune(m) {
    if (m.name === "asphalt") { m.map = asphalt; m.color.set(0xffffff); }
    if (m.name === "lawn") { m.map = lawn; m.color.set(0xffffff); }
    if (m.name === "lamp") { m.emissive = new THREE.Color(0xffd29a); lampMaterials.add(m); }
    if (m.name === "water") { m.emissive = new THREE.Color(0x1fa3c9); m.color.set(0x2f9fc4); m.roughness = 0.04; waterMaterials.add(m); }
    if (m.name === "lobby") { m.emissive = new THREE.Color(0xffc887); m.emissiveIntensity = 0; lampMaterials.add(m); m.userData.soft = true; }
    if (m.name === "rail") { m.transparent = true; m.depthWrite = false; m.side = THREE.DoubleSide; }
    if (m.name === "frond") m.side = THREE.DoubleSide;
  }
  site.scene.traverse((o) => {
    if (!o.isMesh) return;
    tune(o.material);
    o.receiveShadow = true;
    o.castShadow = !/asphalt|paint|lawn|court|rubber|deck|paving/.test(o.material.name);
  });
  scene.add(site.scene);

  const groups = {};
  for (const root of [towers.scene, props.scene]) for (const g of root.children) {
    const meshes = [];
    g.traverse((o) => { if (o.isMesh) { tune(o.material); meshes.push(o); } });
    groups[g.name] = meshes;
  }
  const m4 = (x, y, z, rot = 0, s = 1) =>
    new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), new THREE.Vector3(s, s, s));
  function instance(name, matrices, shadow = true) {
    return groups[name].map((mesh) => {
      const im = new THREE.InstancedMesh(mesh.geometry, mesh.material, matrices.length);
      matrices.forEach((m, i) => im.setMatrixAt(i, m));
      im.castShadow = shadow;
      im.receiveShadow = true;
      im.computeBoundingSphere();
      scene.add(im);
      return im;
    });
  }
  const groves = {};
  for (const [kind, x, z, s, r] of layout.trees) (groves[kind] ||= []).push(m4(x, 0, z, r, s));
  for (const kind in groves) instance("tree-" + kind, groves[kind], !mobile || kind === "palm");
  instance("lamp", layout.lamps.map(([x, z, rot]) => m4(x, 0.05, z, rot)), false);

  // Surrounding low-rise neighbourhood, as in the project elevation: one instanced draw.
  {
    const spots = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    while (spots.length < 150) {
      const x = (rnd() - 0.5) * 700, z = (rnd() - 0.5) * 700;
      const clear = (x > -80 && x < 100 && z > -80 && z < 95) || Math.abs(x - 74) < 22 || Math.abs(z - 70) < 22;
      if (!clear && Math.hypot(x, z) < 380) spots.push([x, z]);
    }
    const facade = windowTexture();
    facade.repeat.set(12, 5);
    const block = new THREE.MeshStandardMaterial({ color: 0xbdb6ab, roughness: 0.95, emissive: 0xffffff, emissiveMap: facade, emissiveIntensity: 0 });
    block.onBeforeCompile = (shader) => {
      shader.uniforms.uNight = night;
      shader.fragmentShader = "uniform float uNight;\n" + shader.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance *= uNight * 0.12;");
    };
    block.emissiveIntensity = 1;
    const town = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), block, spots.length);
    spots.forEach(([x, z], i) => {
      const w = 12 + rnd() * 16, d = 10 + rnd() * 12, h = 7 + rnd() * (Math.hypot(x, z) > 200 ? 26 : 10);
      town.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d)));
    });
    town.castShadow = town.receiveShadow = true;
    scene.add(town);
  }

  // Towers: one instanced floor module per plate type, glass split per flat.
  const glassBase = new THREE.MeshStandardMaterial({ color: 0x56707b, roughness: 0.06, metalness: 0.35, envMapIntensity: 1.5, emissive: 0xffffff, emissiveMap: windowTexture() });
  glassBase.emissiveMap.repeat.set(0.42, 0.36);
  glassBase.onBeforeCompile = (shader) => {
    shader.uniforms.uNight = night;
    shader.vertexShader = "attribute vec4 aTint;\nattribute float aGlow;\nvarying vec4 vTint;\nvarying float vGlow;\n" +
      shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvTint = aTint;\nvGlow = aGlow;");
    shader.fragmentShader = "uniform float uNight;\nvarying vec4 vTint;\nvarying float vGlow;\n" +
      shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance *= uNight * vGlow;\ndiffuseColor.rgb = mix(diffuseColor.rgb, vTint.rgb, vTint.a);\ntotalEmissiveRadiance = mix(totalEmissiveRadiance, vTint.rgb * (0.55 + 0.6 * uNight), vTint.a);",
      );
  };
  const towerKeys = Object.keys(layout.towers);
  const floors = layout.floors, FLOOR = layout.floor, PODIUM = layout.podium;
  const slots = {}; // kind -> [{wing, floor}]
  for (const w of towerKeys) for (let f = 1; f <= floors; f++) (slots[layout.towers[w].plate] ||= []).push({ wing: w, floor: f });
  const floorMeshes = {}, glass = {}, pickables = [];
  const units = new Map(); // id -> {unit, wing, kind, index, q}
  for (const kind in slots) {
    const list = slots[kind];
    floorMeshes[kind] = [];
    glass[kind] = {};
    for (const mesh of groups["floor-" + kind]) {
      const q = /glass-q(\d)/.exec(mesh.material.name)?.[1];
      const geometry = q ? mesh.geometry.clone() : mesh.geometry;
      if (q) {
        geometry.setAttribute("aTint", new THREE.InstancedBufferAttribute(new Float32Array(list.length * 4), 4));
        geometry.setAttribute("aGlow", new THREE.InstancedBufferAttribute(Float32Array.from(list, () => (Math.random() > 0.28 ? 0.55 + Math.random() * 0.5 : 0.05)), 1));
      }
      const im = new THREE.InstancedMesh(geometry, q ? glassBase : mesh.material, list.length);
      im.castShadow = !q;
      im.receiveShadow = true;
      im.userData = { kind, q: q && +q };
      scene.add(im);
      floorMeshes[kind].push(im);
      pickables.push(im);
      if (q) glass[kind][q] = im;
    }
  }
  const towerParts = {};
  for (const w of towerKeys) {
    const t = layout.towers[w], parts = [];
    for (const [name, y] of [["podium-" + t.plate, 0], ["crown-" + t.plate, PODIUM + floors * FLOOR]]) {
      const g = new THREE.Group();
      for (const mesh of groups[name]) {
        const m = new THREE.Mesh(mesh.geometry, mesh.material);
        m.castShadow = m.receiveShadow = true;
        m.userData.wing = w;
        g.add(m);
        pickables.push(m);
      }
      g.position.set(t.x, y, t.z);
      g.userData = { base: y, crown: name.startsWith("crown") };
      scene.add(g);
      parts.push(g);
    }
    towerParts[w] = parts;
  }
  for (const w of towerKeys) {
    const kind = layout.towers[w].plate;
    data.wings[w].units.forEach((u) => {
      const index = slots[kind].findIndex((s) => s.wing === w && s.floor === u.floor);
      units.set(u.id, { unit: u, wing: w, kind, index, q: quadrantOf(u.id) });
    });
  }
  const unitAt = (kind, index, q) => {
    for (const v of units.values()) if (v.kind === kind && v.index === index && v.q === q) return v;
    return null;
  };

  // State.
  let wing = null, slice = null, selected = null, hovered = null, statusAll = false, needsRender = true, flight = null, modeTween = null, balcony = null;
  const sliceAnim = { t: 0, target: 0 };
  const modeState = { t: 1 };
  let mode = "dusk";

  function layoutTowers() {
    const lift = 27 * ease(sliceAnim.t);
    for (const kind in slots) {
      slots[kind].forEach((s, i) => {
        const t = layout.towers[s.wing];
        let y = PODIUM + (s.floor - 1) * FLOOR, scale = 1;
        if (slice && s.wing === slice.wing) {
          if (s.floor > slice.floor) y += lift;
          if (s.floor === slice.floor && sliceAnim.t > 0.02) scale = 0.0001;
        }
        const m = new THREE.Matrix4().compose(new THREE.Vector3(t.x, y, t.z), new THREE.Quaternion(), new THREE.Vector3(scale, scale, scale));
        for (const im of floorMeshes[kind]) im.setMatrixAt(i, m);
      });
      for (const im of floorMeshes[kind]) { im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); }
    }
    for (const w of towerKeys) for (const g of towerParts[w]) g.position.y = g.userData.base + (g.userData.crown && slice?.wing === w ? lift : 0);
    renderer.shadowMap.needsUpdate = true;
    needsRender = true;
  }
  layoutTowers();

  const tint = new THREE.Color();
  function paint() {
    for (const kind in glass) for (const q in glass[kind]) glass[kind][q].geometry.attributes.aTint.array.fill(0);
    for (const [id, v] of units) {
      let a = 0;
      if (id === selected) { tint.set(0xd4ff39); a = 0.95; }
      else if (id === hovered) { tint.set(0xffffff); a = 0.6; }
      else if (statusAll || v.wing === wing) { tint.set(STATUS[statusGroup(v.unit.status)]); a = slice && v.wing === slice.wing ? 0.45 : 0.78; }
      if (!a) continue;
      glass[v.kind][v.q].geometry.attributes.aTint.array.set([tint.r, tint.g, tint.b, a], v.index * 4);
    }
    for (const kind in glass) for (const q in glass[kind]) glass[kind][q].geometry.attributes.aTint.needsUpdate = true;
    needsRender = true;
  }
  paint();

  function applyMode(t) {
    const a = MODES.day, b = MODES.dusk, mix = (x, y) => new THREE.Color(x).lerp(new THREE.Color(y), t), lerp = THREE.MathUtils.lerp;
    sky.set({
      elevation: lerp(a.elevation, b.elevation, t), azimuth: lerp(a.azimuth, b.azimuth, t),
      turbidity: lerp(a.turbidity, b.turbidity, t), rayleigh: lerp(a.rayleigh, b.rayleigh, t), brightness: lerp(a.brightness, b.brightness, t),
    });
    scene.fog.color.copy(mix(a.fog, b.fog));
    sun.color.copy(mix(a.sun, b.sun));
    sun.intensity = lerp(a.sunI, b.sunI, t);
    sun.position.copy(sky.sun).multiplyScalar(240);
    hemi.color.copy(mix(a.hemiSky, b.hemiSky));
    hemi.groundColor.copy(mix(a.hemiGround, b.hemiGround));
    hemi.intensity = lerp(a.hemiI, b.hemiI, t);
    renderer.toneMappingExposure = lerp(a.exposure, b.exposure, t);
    scene.environmentIntensity = lerp(a.env, b.env, t);
    night.value = lerp(a.night, b.night, t);
    lampMaterials.forEach((m) => (m.emissiveIntensity = lerp(a.lamp, b.lamp, t) * (m.userData.soft ? 0.35 : 1)));
    waterMaterials.forEach((m) => (m.emissiveIntensity = lerp(a.water, b.water, t)));
    // Glow belongs to lamps and lit windows; keep sunlit facades crisp.
    if (pipeline) pipeline.bloom.luminanceMaterial.threshold = lerp(1.6, 0.8, t);
    renderer.shadowMap.needsUpdate = true;
    needsRender = true;
  }
  applyMode(1);
  scene.environment = sky.environment();

  // Floor plan reveal for the sliced floor.
  const planGroup = new THREE.Group();
  scene.add(planGroup);
  const planTextures = {};
  const textureLoader = new THREE.TextureLoader();
  const boxes = [];
  async function buildPlan() {
    planGroup.clear();
    boxes.length = 0;
    if (!slice) return;
    const t = layout.towers[slice.wing], plate = layout.plates[t.plate], [x0, y0, x1, y1] = plate.crop;
    const tex = (planTextures[slice.wing] ||= await textureLoader.loadAsync(ROOT + slice.wing + ".webp"));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.repeat.set((x1 - x0) / 1920, (y1 - y0) / 1080);
    tex.offset.set(x0 / 1920, 1 - y1 / 1080);
    if (!slice) return;
    const y = PODIUM + (slice.floor - 1) * FLOOR + 0.04;
    const plan = new THREE.Mesh(new THREE.PlaneGeometry(plate.w, plate.d), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    plan.rotation.x = -Math.PI / 2;
    plan.position.set(t.x, y, t.z);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(plate.w + 0.5, 0.3, plate.d + 0.5), new THREE.MeshStandardMaterial({ color: 0xeeeae3 }));
    slab.position.set(t.x, y - 0.17, t.z);
    planGroup.add(slab, plan);
    for (const [id, v] of units) {
      if (v.wing !== slice.wing || v.unit.floor !== slice.floor) continue;
      const sx = v.q === 1 || v.q === 4 ? -1 : 1, sz = v.q === 1 || v.q === 2 ? -1 : 1;
      const color = id === selected ? 0xd4ff39 : STATUS[statusGroup(v.unit.status)];
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(plate.w / 2 - 0.6, 2.6, plate.d / 2 - 0.6),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: id === selected ? 0.28 : 0.1, depthWrite: false, toneMapped: false }),
      );
      box.position.set(t.x + (sx * plate.w) / 4, y + 1.32, t.z + (sz * plate.d) / 4);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), new THREE.LineBasicMaterial({ color, toneMapped: false }));
      box.add(edges);
      box.userData.id = id;
      boxes.push(box);
      planGroup.add(box);
    }
    needsRender = true;
  }

  // Camera.
  const views = {
    overview() {
      const portrait = camera.aspect < 0.8;
      return { target: new THREE.Vector3(2, 26, 2), distance: portrait ? 330 : 235, polar: portrait ? 1.0 : 1.08, azimuth: 0.62 };
    },
    wing(w) {
      const t = layout.towers[w], portrait = camera.aspect < 0.8;
      // Look from outside the estate so the other towers sit behind, never in front.
      return { target: new THREE.Vector3(t.x, 37, t.z), distance: portrait ? 190 : 128, polar: 1.3, azimuth: Math.atan2(t.x, t.z) + 0.3 };
    },
    floor(w, f) {
      const t = layout.towers[w], portrait = camera.aspect < 0.8, plate = layout.plates[t.plate];
      const y = PODIUM + (f - 1) * FLOOR;
      return { target: new THREE.Vector3(t.x, y + 1, t.z), distance: Math.max(plate.w, 30) * (portrait ? 2.2 : 1.5), polar: 0.6, azimuth: Math.atan2(t.x, t.z) + 0.3 };
    },
  };
  function current() {
    const s = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    return { target: controls.target.clone(), distance: s.radius, polar: s.phi, azimuth: s.theta };
  }
  function place(v) {
    controls.target.copy(v.target);
    camera.position.copy(v.target).add(new THREE.Vector3().setFromSpherical(new THREE.Spherical(v.distance, v.polar, v.azimuth)));
    camera.lookAt(v.target);
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  function fly(to, duration = 1600) {
    if (reduced.matches || !duration) { place(to); flight = null; needsRender = true; return; }
    const from = current();
    let d = to.azimuth - from.azimuth;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    flight = { from, to: { ...to, azimuth: from.azimuth + d }, start: performance.now(), duration };
  }
  function stepFlight(now) {
    if (!flight) return false;
    const t = Math.min(1, (now - flight.start) / flight.duration), e = ease(t), { from, to } = flight;
    const lift = Math.sin(Math.PI * e) * Math.min(70, from.target.distanceTo(to.target) * 0.3);
    place({
      target: from.target.clone().lerp(to.target, e),
      distance: THREE.MathUtils.lerp(from.distance, to.distance, e) + lift,
      polar: THREE.MathUtils.lerp(from.polar, to.polar, e),
      azimuth: THREE.MathUtils.lerp(from.azimuth, to.azimuth, e),
    });
    if (t === 1) flight = null;
    return true;
  }
  controls.addEventListener("start", () => { flight = null; });
  controls.addEventListener("change", () => {
    if (balcony) return;
    const t = controls.target;
    t.x = THREE.MathUtils.clamp(t.x, -110, 110);
    t.z = THREE.MathUtils.clamp(t.z, -110, 110);
    t.y = THREE.MathUtils.clamp(t.y, 0, 80);
  });

  // Labels above each tower.
  const wingLabels = new Map();
  for (const w of towerKeys) {
    const b = document.createElement("button");
    b.className = "wing-label";
    b.dataset.wing = w;
    b.onclick = () => onPickWing(w);
    labels.append(b);
    wingLabels.set(w, b);
  }
  const unitLabel = document.createElement("span");
  unitLabel.className = "unit-label";
  unitLabel.hidden = true;
  labels.append(unitLabel);

  // Picking.
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(x, y) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (slice) {
      const hit = ray.intersectObjects(boxes, false)[0];
      if (hit) return { unit: hit.object.userData.id };
    }
    const hit = ray.intersectObjects(pickables, false)[0];
    if (!hit) return null;
    const o = hit.object;
    if (o.isInstancedMesh) {
      const s = slots[o.userData.kind][hit.instanceId];
      if (o.userData.q && (wing === s.wing || slice)) {
        const v = unitAt(o.userData.kind, hit.instanceId, o.userData.q);
        if (v) return { unit: v.unit.id, wing: s.wing };
      }
      return { wing: s.wing };
    }
    return { wing: o.userData.wing };
  }
  let down = null;
  canvas.addEventListener("pointerdown", (e) => (down = { x: e.clientX, y: e.clientY, t: performance.now() }));
  canvas.addEventListener("pointerup", (e) => {
    if (!down || !e.isPrimary || balcony) return;
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 7 && performance.now() - down.t < 650) {
      const p = pick(e.clientX, e.clientY);
      if (p?.unit) onPickUnit(p.unit);
      else if (p?.wing) onPickWing(p.wing);
    }
    down = null;
  });
  let hoverFrame = 0;
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || e.buttons || balcony) return;
    cancelAnimationFrame(hoverFrame);
    hoverFrame = requestAnimationFrame(() => {
      const p = pick(e.clientX, e.clientY), id = p?.unit || null;
      canvas.style.cursor = p ? "pointer" : "";
      if (id !== hovered) { hovered = id; paint(); }
      onHover?.(p, e.clientX, e.clientY);
    });
  });
  canvas.addEventListener("pointerleave", () => { if (hovered) { hovered = null; paint(); } onHover?.(null); });

  // Render loop.
  let width = 0, height = 0, raf = 0, slow = 0, last = 0, sharpen = 0;
  const v = new THREE.Vector3();
  function project(el, x, y, z) {
    v.set(x, y, z).project(camera);
    const visible = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
    el.hidden = !visible;
    if (visible) el.style.transform = `translate3d(${((v.x + 1) * width) / 2}px,${((1 - v.y) * height) / 2}px,0)`;
  }
  function updateLabels() {
    for (const [w, el] of wingLabels) {
      const t = layout.towers[w];
      if (wing || balcony) { el.hidden = true; continue; }
      project(el, t.x, PODIUM + floors * FLOOR + 9, t.z);
    }
    const u = selected && units.get(selected);
    if (u && slice && !balcony) {
      const t = layout.towers[u.wing], plate = layout.plates[t.plate];
      const sx = u.q === 1 || u.q === 4 ? -1 : 1, sz = u.q === 1 || u.q === 2 ? -1 : 1;
      project(unitLabel, t.x + (sx * plate.w) / 4, PODIUM + (u.unit.floor - 1) * FLOOR + 3.4, t.z + (sz * plate.d) / 4);
    } else unitLabel.hidden = true;
  }
  let paused = false;
  function frame(now) {
    if (paused) { raf = 0; return; }
    raf = requestAnimationFrame(frame);
    const flying = stepFlight(now);
    if (modeTween) {
      const t = Math.min(1, (now - modeTween.start) / 900);
      modeState.t = THREE.MathUtils.lerp(modeTween.from, modeTween.to, ease(t));
      applyMode(modeState.t);
      if (t === 1) { modeTween = null; scene.environment = sky.environment(); }
    }
    let sliding = false;
    if (sliceAnim.t !== sliceAnim.target) {
      const step = (now - (sliceAnim.last || now)) / 700;
      sliceAnim.t = sliceAnim.target > sliceAnim.t ? Math.min(sliceAnim.target, sliceAnim.t + step) : Math.max(sliceAnim.target, sliceAnim.t - step);
      layoutTowers();
      sliding = true;
      if (sliceAnim.t === 0 && sliceAnim.target === 0 && sliceAnim.onClosed) { sliceAnim.onClosed(); sliceAnim.onClosed = null; }
    }
    sliceAnim.last = now;
    const moved = controls.update();
    if (!(flying || moved || needsRender || modeTween || sliding)) return;
    needsRender = false;
    const dt = now - last;
    last = now;
    slow = dt > 24 && dt < 120 ? slow + 1 : 0;
    if (slow > 14) {
      slow = 0;
      if (ratio > 1) { ratio = Math.max(1, ratio - 0.25); renderer.setPixelRatio(ratio); pipeline?.setSize(width, height); }
      else if (tier !== "low") downgrade();
    }
    clearTimeout(sharpen);
    if (ratio < maxRatio) sharpen = setTimeout(() => { ratio = maxRatio; renderer.setPixelRatio(ratio); pipeline?.setSize(width, height); needsRender = true; }, 900);
    pipeline ? pipeline.render() : renderer.render(scene, camera);
    updateLabels();
  }
  function resize() {
    const r = host.getBoundingClientRect();
    width = r.width;
    height = r.height;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.fov = camera.aspect < 0.8 ? 52 : 40;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    pipeline?.setSize(width, height);
    needsRender = true;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  place({ ...views.overview(), distance: 620, polar: 0.35, azimuth: -0.4 });
  renderer.shadowMap.needsUpdate = true;
  renderer.compile(scene, camera);

  // Post effects, then stream the PBR textures in after the first frame.
  pipeline = createPipeline(renderer, scene, camera, tier);
  applyMode(modeState.t);
  if (!pipeline) renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const SURFACES = {
    lawn: "grass", asphalt: "asphalt", paving: "paving", deck: "wood", teak: "wood", stone: "concrete",
    slab: "plaster", render: "plaster", wall: "plaster", rubber: "concrete",
  };
  const textured = new Set();
  scene.traverse((o) => { if (o.isMesh && o.material?.isMeshStandardMaterial) textured.add(o); });
  loadSurfaces(tier === "low" ? 2 : 8).then((sets) => {
    for (const o of textured) {
      const key = o === ground ? "grass" : SURFACES[o.material.name];
      if (!key || o.material.userData.surfaced) continue;
      applySurface(o.material, sets[key], o.userData.uvScale || 1);
      if (key === "grass") o.material.color.set(o === ground ? 0x9aa384 : 0xb4be9a);
      if (key === "wood") o.material.color.set(0xe0a874);
      o.material.userData.surfaced = true;
    }
    renderer.shadowMap.needsUpdate = true;
    needsRender = true;
  }).catch(() => {});
  // Step quality down if this device cannot keep up.
  function downgrade() {
    if (tier === "high") { tier = "medium"; pipeline?.dispose(); pipeline = createPipeline(renderer, scene, camera, tier); pipeline?.setSize(width, height); applyMode(modeState.t); }
    else if (tier === "medium") { tier = "low"; pipeline?.dispose(); pipeline = null; renderer.toneMapping = THREE.ACESFilmicToneMapping; }
    needsRender = true;
  }
  raf = requestAnimationFrame(frame);

  function closeSlice(done) {
    if (!slice) { done?.(); return; }
    sliceAnim.target = 0;
    sliceAnim.onClosed = () => { slice = null; planGroup.clear(); boxes.length = 0; layoutTowers(); done?.(); };
    if (reduced.matches) { sliceAnim.t = 0; sliceAnim.onClosed(); sliceAnim.onClosed = null; }
  }
  function exitBalcony() {
    if (!balcony) return;
    Object.assign(controls, balcony.saved);
    balcony = null;
    canvas.classList.remove("balcony");
  }

  return {
    intro() { fly(views.overview(), 3400); },
    overview() {
      exitBalcony();
      wing = null;
      selected = null;
      closeSlice(() => paint());
      paint();
      fly(views.overview(), 1600);
    },
    wing(w) {
      exitBalcony();
      const change = () => { wing = w; selected = null; paint(); fly(views.wing(w), 1600); };
      if (slice) closeSlice(change);
      else change();
    },
    floor(w, f, unitId = null) {
      exitBalcony();
      const open = () => {
        wing = w;
        slice = { wing: w, floor: f };
        selected = unitId;
        sliceAnim.target = 1;
        if (reduced.matches) sliceAnim.t = 1;
        layoutTowers();
        paint();
        buildPlan();
        fly(views.floor(w, f), 1500);
      };
      if (slice && (slice.wing !== w || slice.floor !== f)) closeSlice(open);
      else if (slice) { selected = unitId; paint(); buildPlan(); }
      else open();
    },
    balcony(id) {
      const u = units.get(id);
      if (!u) return;
      // Stand just outside this flat's facade and look the way the inventory says it faces.
      const t = layout.towers[u.wing], plate = layout.plates[t.plate];
      const dir = { North: [0, -1], South: [0, 1], East: [1, 0], West: [-1, 0] }[u.unit.facing] || [0, -1];
      const qx = u.q === 1 || u.q === 4 ? -1 : 1, qz = u.q === 1 || u.q === 2 ? -1 : 1;
      const y = PODIUM + (u.unit.floor - 1) * FLOOR + 1.65;
      const eye = dir[0]
        ? new THREE.Vector3(t.x + dir[0] * (plate.w / 2 + 1.2), y, t.z + (qz * plate.d) / 4)
        : new THREE.Vector3(t.x + (qx * plate.w) / 4, y, t.z + dir[1] * (plate.d / 2 + 1.6));
      const sz = dir[1], sx = dir[0];
      closeSlice(() => {
        paint();
        if (!balcony) balcony = { saved: { minDistance: controls.minDistance, maxDistance: controls.maxDistance, rotateSpeed: controls.rotateSpeed, enableZoom: controls.enableZoom, enablePan: controls.enablePan, minPolarAngle: controls.minPolarAngle, maxPolarAngle: controls.maxPolarAngle } };
        canvas.classList.add("balcony");
        const look = eye.clone().add(new THREE.Vector3(sx, camera.aspect < 0.8 ? -0.32 : -0.16, sz).normalize().multiplyScalar(0.02));
        // Fly close to the facade first, then step out onto the balcony.
        // Orbiting a target 2 cm ahead of the eye turns drags into looking around.
        fly({ target: eye.clone(), distance: 14, polar: 1.4, azimuth: Math.atan2(-sx, -sz) }, 1300);
        setTimeout(() => {
          if (!balcony) return;
          Object.assign(controls, { minDistance: 0.01, maxDistance: 0.03, rotateSpeed: -0.35, enableZoom: false, enablePan: false, minPolarAngle: 0.6, maxPolarAngle: 2.2 });
          flight = null;
          controls.target.copy(look);
          camera.position.copy(eye);
          camera.lookAt(look);
          needsRender = true;
        }, reduced.matches ? 0 : 1350);
      });
    },
    exitBalcony(id) {
      exitBalcony();
      const u = units.get(id);
      if (u) this.floor(u.wing, u.unit.floor, id);
    },
    setStatusAll(on) { statusAll = on; paint(); },
    setMode(next) {
      if (next === mode) return;
      mode = next;
      modeTween = { from: modeState.t, to: next === "dusk" ? 1 : 0, start: performance.now() };
    },
    get balconyActive() { return Boolean(balcony); },
    // Full-screen overlays (map, flat tour) get the GPU to themselves.
    pause(on) {
      paused = on;
      canvas.style.visibility = on ? "hidden" : "";
      if (!on && !raf) { needsRender = true; raf = requestAnimationFrame(frame); }
    },
  };
}
