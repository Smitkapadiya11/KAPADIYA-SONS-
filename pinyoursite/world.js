import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { qualityTier, createSky, loadSurfaces, applySurface, SURFACES, createPipeline } from "./realism.js";
import { dimensions } from "./geometry.js";
import { plotLayout, toWorld } from "./layout.js";

const STATUS = { available: 0x2ec27e, hold: 0xf5a524, sold: 0xe5484d };
const MODES = {
  day: {
    elevation: 32, azimuth: 225, turbidity: 4, rayleigh: 1.2, brightness: 0.3, fog: 0xcfd8de, sun: 0xffe9cc, sunI: 2.7,
    hemiSky: 0xcfdcf0, hemiGround: 0x5a4a35, hemiI: 0.7, glass: 0, lamp: 0.25, exposure: 0.98, env: 0.55,
  },
  dusk: {
    elevation: 5, azimuth: 290, turbidity: 8, rayleigh: 2.4, brightness: 0.55, fog: 0x8a6a5c, sun: 0xffa060, sunI: 1.4,
    hemiSky: 0x6c7cb8, hemiGround: 0x2a221c, hemiI: 1.0, glass: 1.4, lamp: 4, exposure: 1.2, env: 0.45,
  },
};
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Warm interiors seen through glass: lit rooms, drawn curtains and mullions.
function windowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  for (let i = 0; i < 4; i++) {
    const lit = Math.random() > 0.25, grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, lit ? "#ffcf8a" : "#3a2c22");
    grad.addColorStop(1, lit ? "#c8743a" : "#1d1611");
    g.fillStyle = grad;
    g.fillRect(i * 32, 0, 32, 128);
    if (lit && Math.random() > 0.5) { g.fillStyle = "rgba(255,240,215,.55)"; g.fillRect(i * 32 + 3, 0, 9, 128); }
  }
  g.fillStyle = "#1a1714";
  for (let i = 0; i <= 4; i++) g.fillRect(i * 32 - 1, 0, 2, 128);
  g.fillRect(0, 0, 128, 3);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(0.42, 0.36);
  return tex;
}

function noiseTexture(base, spread, size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d"), img = g.createImageData(size, size), [r, gg, b] = base;
  for (let i = 0; i < size * size; i++) {
    const n = (Math.random() - 0.5) * spread;
    img.data[i * 4] = r + n;
    img.data[i * 4 + 1] = gg + n * 1.1;
    img.data[i * 4 + 2] = b + n * 0.8;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Flat strips along polygon edges, inset towards the centre.
function edgeStrips(points, centre, inset, width, y) {
  const pos = [];
  const pts = points.map((p) => {
    const dx = centre.x - p.x, dz = centre.z - p.z, l = Math.hypot(dx, dz) || 1;
    return { x: p.x + (dx / l) * inset, z: p.z + (dz / l) * inset };
  });
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length], dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz);
    const nx = (-dz / l) * width / 2, nz = (dx / l) * width / 2;
    const q = [[a.x - nx, a.z - nz], [b.x - nx, b.z - nz], [b.x + nx, b.z + nz], [a.x + nx, a.z + nz]];
    for (const k of [0, 1, 2, 0, 2, 3]) pos.push(q[k][0], y, q[k][1]);
  });
  return upward(pos);
}
// Reorder triangles so their normals point up (+Y).
function upward(pos) {
  for (let i = 0; i < pos.length; i += 9) {
    const ax = pos[i], az = pos[i + 2], bx = pos[i + 3], bz = pos[i + 5], cx = pos[i + 6], cz = pos[i + 8];
    if ((bz - az) * (cx - ax) - (bx - ax) * (cz - az) < 0) {
      pos.splice(i + 3, 6, cx, pos[i + 7], cz, bx, pos[i + 4], bz);
    }
  }
  return pos;
}
function fillPositions(points, y) {
  const shape = points.map((p) => new THREE.Vector2(p.x, p.z));
  const tris = THREE.ShapeUtils.triangulateShape(shape, []);
  const pos = [];
  for (const t of tris) for (const k of t) pos.push(points[k].x, y, points[k].z);
  return upward(pos);
}

export async function createWorld({ host, labels, plots, onPick, onHover, onProgress }) {
  const mobile = matchMedia("(max-width: 760px), (pointer: coarse)").matches;
  const lowMemory = (navigator.deviceMemory || 8) < 4;
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
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 2200);
  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, {
    enableDamping: true, dampingFactor: 0.085, screenSpacePanning: false, zoomToCursor: true,
    minDistance: 12, maxDistance: 340, maxPolarAngle: 1.36, minPolarAngle: 0.08, rotateSpeed: mobile ? 0.7 : 0.55,
  });
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

  // Lighting and atmosphere.
  const sky = createSky(renderer);
  scene.add(sky.mesh);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(lowMemory ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -120, right: 120, top: 120, bottom: -120, near: 10, far: 420 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.05;
  scene.add(hemi, sun, sun.target);
  scene.fog = new THREE.Fog(0xffffff, 260, 1100);

  const grass = noiseTexture([104, 132, 70], 34);
  grass.repeat.set(420, 420);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 3000),
    new THREE.MeshStandardMaterial({ map: grass, roughness: 1 }),
  );
  ground.userData.uvScale = 3000;
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  scene.add(ground);

  // Blender assets.
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_, done, total) => onProgress?.(done / total);
  const loader = new GLTFLoader(manager);
  const [site, kit, scatter] = await Promise.all([
    loader.loadAsync("/world/site.glb"),
    loader.loadAsync("/world/kit.glb"),
    fetch("/world/scatter.json").then((r) => r.json()),
  ]);
  const glassMaterials = new Set(), lampMaterials = new Set();
  const windows = windowTexture();
  const asphalt = noiseTexture([62, 64, 67], 18), lawn = noiseTexture([110, 142, 72], 30), earth = noiseTexture([205, 190, 160], 22);
  asphalt.repeat.set(0.25, 0.25);
  lawn.repeat.set(0.4, 0.4);
  earth.repeat.set(0.3, 0.3);
  function tune(m) {
    if (m.name === "asphalt") { m.map = asphalt; m.color.set(0xffffff); }
    if (m.name === "lawn") { m.map = lawn; m.color.set(0xffffff); }
    if (m.name === "earth") { m.map = earth; m.color.set(0xffffff); }
    if (m.name === "glass") {
      Object.assign(m, { roughness: 0.12, metalness: 0.2, emissiveMap: windows, envMapIntensity: 0.9 });
      m.color.set(0x24323a);
      m.emissive = new THREE.Color(0xffffff);
      glassMaterials.add(m);
    }
    if (m.name === "lamp") { m.emissive = new THREE.Color(0xffd29a); lampMaterials.add(m); }
    if (m.name === "carpaint") { m.metalness = 0.15; m.roughness = 0.35; }
    if (m.name === "rail" || m.name === "net") { m.transparent = true; m.depthWrite = false; }
    m.side = m.transparent ? THREE.DoubleSide : THREE.FrontSide;
    if (m.name === "frond") m.side = THREE.DoubleSide;
  }
  site.scene.traverse((o) => {
    if (!o.isMesh) return;
    tune(o.material);
    o.receiveShadow = true;
    o.castShadow = !/asphalt|paint|earth|lawn|track|rubber/.test(o.material.name);
  });
  scene.add(site.scene);

  const kitGroups = {};
  kit.scene.children.forEach((g) => {
    const meshes = [];
    g.traverse((o) => { if (o.isMesh) { tune(o.material); meshes.push(o); } });
    kitGroups[g.name] = meshes;
  });
  function instance(name, matrices, shadow = true) {
    return kitGroups[name].map((mesh) => {
      const im = new THREE.InstancedMesh(mesh.geometry, mesh.material, matrices.length);
      matrices.forEach((m, i) => im.setMatrixAt(i, m));
      im.castShadow = shadow;
      im.receiveShadow = true;
      im.computeBoundingSphere();
      scene.add(im);
      return im;
    });
  }
  const m4 = (x, y, z, rot, sx, sy = sx, sz = sx) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot),
      new THREE.Vector3(sx, sy, sz),
    );

  // Trees and street lights from the Blender scatter.
  const groves = {};
  for (const [kind, x, z, s, r] of scatter.trees) (groves[kind] ||= []).push(m4(x, 0, z, r, s));
  // Natural variation: every tree gets its own shade of green.
  const shade = new THREE.Color();
  for (const kind in groves)
    for (const im of instance("tree-" + kind, groves[kind], tier !== "low" || kind !== "cone"))
      if (/leaf|frond/.test(im.material.name))
        for (let i = 0; i < im.count; i++) im.setColorAt(i, shade.setHSL(0.24 + Math.sin(i * 12.9) * 0.04, 0.35 + Math.sin(i * 7.1) * 0.12, 0.42 + Math.sin(i * 3.7) * 0.1));
  instance("lamp", scatter.lamps.map(([x, z, side]) => m4(x, 0.05, z, side > 0 ? 0 : Math.PI, 1)), false);

  // Plots: parcels, status rings and one home per plot.
  const layouts = new Map(plots.map((p) => [p.id, plotLayout(p)]));
  const faceToPlot = [];
  const parcelPos = [], parcelColor = [];
  const base = new THREE.Color(0x8fae5d);
  for (const p of plots) {
    const L = layouts.get(p.id);
    const pos = fillPositions(L.world.map((w) => {
      const dx = L.centre.x - w.x, dz = L.centre.z - w.z, l = Math.hypot(dx, dz);
      return { x: w.x + (dx / l) * 0.18, z: w.z + (dz / l) * 0.18 };
    }), 0.07);
    const c = base.clone().offsetHSL((p.id % 5) * 0.004, 0, ((p.id * 7) % 5) * 0.012 - 0.02);
    for (let i = 0; i < pos.length / 3; i++) parcelColor.push(c.r, c.g, c.b);
    for (let i = 0; i < pos.length / 9; i++) faceToPlot.push(p.id);
    parcelPos.push(...pos);
  }
  const parcelGeometry = new THREE.BufferGeometry();
  parcelGeometry.setAttribute("position", new THREE.Float32BufferAttribute(parcelPos, 3));
  parcelGeometry.setAttribute("color", new THREE.Float32BufferAttribute(parcelColor, 3));
  parcelGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(parcelPos.filter((_, i) => i % 3 !== 1), 2));
  parcelGeometry.computeVertexNormals();
  const parcels = new THREE.Mesh(parcelGeometry, new THREE.MeshStandardMaterial({ map: lawn, vertexColors: true, roughness: 0.95 }));
  parcels.receiveShadow = true;
  scene.add(parcels);

  const rings = {};
  for (const status in STATUS) {
    const pos = [];
    for (const p of plots) if (p.status === status) {
      const L = layouts.get(p.id);
      pos.push(...edgeStrips(L.world, L.centre, 0.42, 0.32, 0.1));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    rings[status] = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: STATUS[status], toneMapped: false, transparent: true, opacity: 0.92 }));
    scene.add(rings[status]);
  }

  const homeIds = { a: [], b: [], c: [], d: [] }, homeMatrices = { a: [], b: [], c: [], d: [] };
  for (const p of plots) {
    const L = layouts.get(p.id);
    const sx = THREE.MathUtils.clamp((L.width * 0.9) / 5.4, 0.8, 1.45);
    const sz = THREE.MathUtils.clamp((L.depth * 0.92) / 13.25, 0.72, 1.35);
    const rot = Math.atan2(L.front.x, L.front.z);
    const off = 1.375 * sz;
    homeIds[L.design].push(p.id);
    homeMatrices[L.design].push(m4(L.centre.x - L.front.x * off, 0.07, L.centre.z - L.front.z * off, rot, sx, 1, sz));
  }
  const homes = [];
  for (const d in homeIds) for (const im of instance("home-" + d, homeMatrices[d])) { im.userData.ids = homeIds[d]; homes.push(im); }

  // Parked cars in the driveways of sold and builder-held plots, in varied paint.
  const carMatrices = [], local = new THREE.Matrix4();
  for (const p of plots) {
    if (p.status === "available") continue;
    const L = layouts.get(p.id), sz = THREE.MathUtils.clamp((L.depth * 0.92) / 13.25, 0.72, 1.35);
    const rot = Math.atan2(L.front.x, L.front.z), off = 1.375 * sz;
    const base = m4(L.centre.x - L.front.x * off, 0.07, L.centre.z - L.front.z * off, rot, 1);
    carMatrices.push(base.multiply(local.makeTranslation(1.05, 0, 5.2 * sz)));
  }
  const paints = [0xd9d9d4, 0xb8bcc0, 0x1d1f22, 0x7a1f24, 0x1f3550, 0xc8b79a, 0x5c6266];
  const cars = instance("car", carMatrices);
  for (const im of cars) if (im.material.name === "carpaint") for (let i = 0; i < im.count; i++) im.setColorAt(i, new THREE.Color(paints[(i * 5) % paints.length]));

  // Selection and hover overlays.
  const overlay = new THREE.Group();
  scene.add(overlay);
  const fillMaterial = new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.32, depthWrite: false, toneMapped: false });
  const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xfff6dc, toneMapped: false });
  const hoverMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false });
  const hoverMesh = new THREE.Mesh(new THREE.BufferGeometry(), hoverMaterial);
  scene.add(hoverMesh);
  function geometryFrom(pos) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }

  // HTML pins for every plot.
  const pins = new Map();
  const pinLayer = document.createElement("div");
  pinLayer.className = "pins";
  labels.append(pinLayer);
  for (const p of plots) {
    const b = document.createElement("button");
    b.className = "pin " + p.status;
    b.dataset.plot = p.id;
    b.innerHTML = "<span>" + p.id + "</span>";
    b.onclick = () => onPick(p.id);
    pinLayer.append(b);
    pins.set(p.id, b);
  }
  const dimLayer = document.createElement("div");
  dimLayer.className = "dims";
  labels.append(dimLayer);
  let dimLabels = [];

  // State.
  let selected = null, hovered = null, homesVisible = true, needsRender = true, flight = null, modeTween = null;
  const filters = { available: true, hold: true, sold: true };
  let mode = "day";
  const modeState = { t: 0 };

  function applyMode(t) {
    const a = MODES.day, b = MODES.dusk, mix = (x, y) => new THREE.Color(x).lerp(new THREE.Color(y), t), lerp = THREE.MathUtils.lerp;
    sky.set({
      elevation: lerp(a.elevation, b.elevation, t), azimuth: lerp(a.azimuth, b.azimuth, t),
      turbidity: lerp(a.turbidity, b.turbidity, t), rayleigh: lerp(a.rayleigh, b.rayleigh, t), brightness: lerp(a.brightness, b.brightness, t),
    });
    scene.fog.color.copy(mix(a.fog, b.fog));
    sun.color.copy(mix(a.sun, b.sun));
    sun.intensity = lerp(a.sunI, b.sunI, t);
    sun.position.copy(sky.sun).multiplyScalar(170);
    hemi.color.copy(mix(a.hemiSky, b.hemiSky));
    hemi.groundColor.copy(mix(a.hemiGround, b.hemiGround));
    hemi.intensity = lerp(a.hemiI, b.hemiI, t);
    renderer.toneMappingExposure = lerp(a.exposure, b.exposure, t);
    scene.environmentIntensity = lerp(a.env, b.env, t);
    glassMaterials.forEach((m) => (m.emissiveIntensity = lerp(a.glass, b.glass, t)));
    lampMaterials.forEach((m) => (m.emissiveIntensity = lerp(a.lamp, b.lamp, t)));
    // Glow belongs to lamps and lit windows; keep sunlit white paint and plaster crisp.
    if (pipeline) pipeline.bloom.luminanceMaterial.threshold = lerp(1.6, 0.8, t);
    renderer.shadowMap.needsUpdate = true;
    needsRender = true;
  }
  applyMode(0);
  scene.environment = sky.environment();

  // Camera framing.
  const estate = { x: -6, z: -1 };
  // Portrait screens turn the long estate to run down the screen.
  function homeView() {
    const aspect = camera.aspect, portrait = aspect < 0.8, vfov = THREE.MathUtils.degToRad(camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const [across, along] = portrait ? [50, 78] : [80, 52];
    const fit = Math.max(across / Math.tan(hfov / 2), along / Math.tan(vfov / 2));
    return {
      target: new THREE.Vector3(estate.x, 0, estate.z),
      distance: Math.min(330, fit * (portrait ? 0.92 : 0.86)),
      polar: portrait ? 0.72 : 0.9,
      azimuth: portrait ? Math.PI / 2 + 0.18 : 0.22,
    };
  }
  function plotView(id) {
    const L = layouts.get(id);
    const mobileFrame = camera.aspect < 0.8;
    return {
      target: new THREE.Vector3(L.centre.x, 2.2, L.centre.z + (mobileFrame ? 3 : 0)),
      distance: mobileFrame ? 40 : 30,
      polar: 0.98,
      azimuth: Math.atan2(L.front.x, L.front.z) + 0.6,
    };
  }
  function currentView() {
    const offset = camera.position.clone().sub(controls.target);
    const s = new THREE.Spherical().setFromVector3(offset);
    return { target: controls.target.clone(), distance: s.radius, polar: s.phi, azimuth: s.theta };
  }
  function place(v) {
    const off = new THREE.Vector3().setFromSpherical(new THREE.Spherical(v.distance, v.polar, v.azimuth));
    controls.target.copy(v.target);
    camera.position.copy(v.target).add(off);
    camera.lookAt(v.target);
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  function fly(to, duration = 1500) {
    if (reduced.matches) { place(to); flight = null; needsRender = true; return; }
    const from = currentView();
    let dAz = to.azimuth - from.azimuth;
    dAz = Math.atan2(Math.sin(dAz), Math.cos(dAz));
    flight = { from, to: { ...to, azimuth: from.azimuth + dAz }, start: performance.now(), duration };
  }
  function stepFlight(now) {
    if (!flight) return false;
    const t = Math.min(1, (now - flight.start) / flight.duration), e = ease(t), { from, to } = flight;
    const lift = Math.sin(Math.PI * e) * Math.min(60, from.target.distanceTo(to.target) * 0.35);
    place({
      target: from.target.clone().lerp(to.target, e),
      distance: THREE.MathUtils.lerp(from.distance, to.distance, e) + lift,
      polar: THREE.MathUtils.lerp(from.polar, to.polar, e),
      azimuth: THREE.MathUtils.lerp(from.azimuth, to.azimuth, e),
    });
    if (t === 1) flight = null;
    return true;
  }
  controls.addEventListener("start", () => { flight = null; controls.autoRotate = false; onOrbitChange?.(false); });
  controls.addEventListener("change", () => {
    const t = controls.target;
    t.x = THREE.MathUtils.clamp(t.x, -95, 85);
    t.z = THREE.MathUtils.clamp(t.z, -70, 70);
    t.y = THREE.MathUtils.clamp(t.y, 0, 10);
  });
  let onOrbitChange;

  // Selection.
  function select(id, { fly: move = true } = {}) {
    selected = id;
    overlay.clear();
    dimLayer.replaceChildren();
    dimLabels = [];
    pins.forEach((b, pid) => b.classList.toggle("selected", pid === id));
    if (id == null) { needsRender = true; return; }
    const L = layouts.get(id), p = plots.find((x) => x.id === id);
    const fill = new THREE.Mesh(geometryFrom(fillPositions(L.world, 0.12)), fillMaterial);
    const edge = new THREE.Mesh(geometryFrom(edgeStrips(L.world, L.centre, 0.05, 0.22, 0.14)), edgeMaterial);
    overlay.add(fill, edge);
    for (const d of dimensions(p)) {
      const w = toWorld(d.mx, d.my), el = document.createElement("span");
      el.className = "dim";
      el.textContent = d.length.toFixed(2) + " ft";
      dimLayer.append(el);
      dimLabels.push({ el, v: new THREE.Vector3(w.x, 0.3, w.z) });
    }
    if (move) fly(plotView(id), 1700);
    needsRender = true;
  }
  function setHover(id) {
    if (id === hovered) return;
    hovered = id;
    hoverMesh.geometry.dispose();
    hoverMesh.geometry = id == null || id === selected ? new THREE.BufferGeometry() : geometryFrom(fillPositions(layouts.get(id).world, 0.11));
    pins.forEach((b, pid) => b.classList.toggle("hover", pid === id));
    canvas.style.cursor = id == null ? "" : "pointer";
    needsRender = true;
  }

  // Picking.
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(x, y) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(homesVisible ? [parcels, ...homes] : [parcels], false);
    for (const h of hits) {
      const id = h.object === parcels ? faceToPlot[h.faceIndex] : h.object.userData.ids?.[h.instanceId];
      const p = plots.find((x) => x.id === id);
      if (p && filters[p.status]) return id;
    }
    return null;
  }
  let down = null;
  canvas.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now(), n: e.isPrimary }; });
  canvas.addEventListener("pointerup", (e) => {
    if (!down || !e.isPrimary) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (moved < 7 && performance.now() - down.t < 650) onPick(pick(e.clientX, e.clientY));
    down = null;
  });
  let hoverFrame = 0;
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || e.buttons) return;
    cancelAnimationFrame(hoverFrame);
    hoverFrame = requestAnimationFrame(() => {
      const id = pick(e.clientX, e.clientY);
      setHover(id);
      onHover?.(id, e.clientX, e.clientY);
    });
  });
  canvas.addEventListener("pointerleave", () => { setHover(null); onHover?.(null); });

  // Render loop: renders only while something changes.
  let width = 0, height = 0, raf = 0, disposed = false, slow = 0, last = 0, sharpen = 0;
  const v = new THREE.Vector3();
  function updateLabels() {
    const distance = camera.position.distanceTo(controls.target);
    pinLayer.classList.toggle("far", distance > 150);
    pinLayer.classList.toggle("tiny", distance > 150 && width < 560);
    for (const p of plots) {
      const el = pins.get(p.id), L = layouts.get(p.id);
      if (!filters[p.status]) { el.hidden = true; continue; }
      v.set(L.centre.x, homesVisible ? (L.design === "d" ? 10.6 : 8.8) : 1.2, L.centre.z).project(camera);
      const visible = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      el.hidden = !visible;
      if (visible) el.style.transform = `translate3d(${((v.x + 1) * width) / 2}px,${((1 - v.y) * height) / 2}px,0)`;
    }
    for (const d of dimLabels) {
      v.copy(d.v).project(camera);
      d.el.hidden = v.z > 1;
      d.el.style.transform = `translate3d(${((v.x + 1) * width) / 2}px,${((1 - v.y) * height) / 2}px,0) translate(-50%,-50%)`;
    }
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const flying = stepFlight(now);
    if (modeTween) {
      const t = Math.min(1, (now - modeTween.start) / 900);
      modeState.t = THREE.MathUtils.lerp(modeTween.from, modeTween.to, ease(t));
      applyMode(modeState.t);
      if (t === 1) { modeTween = null; scene.environment = sky.environment(); }
    }
    const moved = controls.update();
    const pulse = selected != null;
    if (pulse) fillMaterial.opacity = 0.24 + Math.sin(now / 380) * 0.1;
    if (!(flying || moved || needsRender || pulse || modeTween)) return;
    needsRender = false;
    // Lower resolution only during sustained slow motion, restore when idle.
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
    camera.fov = camera.aspect < 0.8 ? 50 : 40;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    pipeline?.setSize(width, height);
    needsRender = true;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  place({ ...homeView(), distance: 420, polar: 0.12, azimuth: -1.1 });
  renderer.shadowMap.needsUpdate = true;
  renderer.compile(scene, camera);

  // Post effects, then stream the PBR textures in after the first frame.
  pipeline = createPipeline(renderer, scene, camera, tier);
  applyMode(modeState.t);
  if (!pipeline) renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const textured = new Set();
  scene.traverse((o) => { if (o.isMesh && o.material?.isMeshStandardMaterial) textured.add(o); });
  loadSurfaces(tier === "low" ? 2 : 8).then((sets) => {
    for (const o of textured) {
      const key = o === ground || o === parcels ? "grass" : SURFACES[o.material.name];
      if (!key || o.material.userData.surfaced) continue;
      applySurface(o.material, sets[key], o.userData.uvScale || 1);
      // The photo grass is bright; tone it to a natural Gujarat lawn.
      if (key === "grass") o.material.color.set(o === parcels ? 0xb4be9a : 0x9aa384);
      if (key === "wood") o.material.color.set(0xe0a874);
      o.material.userData.surfaced = true;
    }
    needsRender = true;
  }).catch(() => {});
  // Step quality down if this device cannot keep up.
  function downgrade() {
    if (tier === "high") { tier = "medium"; pipeline?.dispose(); pipeline = createPipeline(renderer, scene, camera, tier); pipeline?.setSize(width, height); applyMode(modeState.t); }
    else if (tier === "medium") { tier = "low"; pipeline?.dispose(); pipeline = null; renderer.toneMapping = THREE.ACESFilmicToneMapping; }
    needsRender = true;
  }
  raf = requestAnimationFrame(frame);

  return {
    canvas,
    layouts,
    intro() { fly(homeView(), reduced.matches ? 0 : 3200); },
    select,
    home() { select(null, { fly: false }); fly(homeView(), 1500); },
    focus(id) { fly(plotView(id), 1500); },
    setFilter(status, on) {
      filters[status] = on;
      rings[status].visible = on;
      needsRender = true;
    },
    setHomes(on) {
      homesVisible = on;
      homes.forEach((h) => (h.visible = on));
      cars.forEach((c) => (c.visible = on));
      renderer.shadowMap.needsUpdate = true;
      needsRender = true;
    },
    setMode(next) {
      if (next === mode) return;
      mode = next;
      modeTween = { from: modeState.t, to: next === "dusk" ? 1 : 0, start: performance.now() };
    },
    orbit(on, cb) {
      onOrbitChange = cb;
      controls.autoRotate = on;
      controls.autoRotateSpeed = 1.1;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
    },
    get disposed() { return disposed; },
  };
}
