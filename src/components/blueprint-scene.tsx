'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { DURATION, clamp01, duskAt, smooth } from './blueprint-timeline';

type V3 = [number, number, number];
type Kind = 'lawn' | 'concrete' | 'steel' | 'frame' | 'wall' | 'stone' | 'slab' | 'cladding' | 'timber' | 'glass' | 'water' | 'interior' | 'lamp';
type Part = { kind: Kind; matrix: THREE.Matrix4; size?: V3; solid: boolean; outline: boolean };
type Rect = { cx: number; cy: number; hw: number; hh: number };

export type SceneProps = {
  clock: RefObject<number>;
  speed: RefObject<number>;
  revealed: RefObject<boolean>;
  pointer: RefObject<{ x: number; y: number }>;
  scroll: RefObject<number>;
  running: boolean;
  reduced: boolean;
  revision: number;
  onTick: (time: number) => void;
  onReady: () => void;
  onFailure: () => void;
};

const BG = new THREE.Color('#0a131c');
const BG_DUSK = new THREE.Color('#0d1720');
const ONE = new THREE.Vector3(1, 1, 1);
const FOV = 28;

const MATERIALS: Record<Kind, THREE.MeshStandardMaterialParameters> = {
  lawn: { color: '#1b2620', roughness: 1 },
  concrete: { color: '#8a877f', roughness: .95 },
  steel: { color: '#3a4c58', roughness: .45, metalness: .35 },
  frame: { color: '#1d252b', roughness: .5, metalness: .3 },
  wall: { color: '#dcd6c8', roughness: .9 },
  stone: { color: '#9a9283', roughness: .97 },
  slab: { color: '#e4dfd3', roughness: .85 },
  cladding: { color: '#22292e', roughness: .7 },
  timber: { color: '#9c6f45', roughness: .75 },
  glass: { color: '#a8cad8', roughness: .05, metalness: .25, transparent: true, opacity: .24, depthWrite: false, emissive: new THREE.Color('#ffab5a'), emissiveIntensity: 0 },
  water: { color: '#2a6a7c', roughness: .55 },
  interior: { color: '#cdbca2', roughness: .9 },
  lamp: { color: '#fff1d8', emissive: new THREE.Color('#ffd9a6'), emissiveIntensity: 0 },
};
// Each family of parts is revealed by its own sweeping clipping plane.
const STAGE: Record<Kind, 'base' | 'steel' | 'skin'> = {
  lawn: 'base', concrete: 'base', steel: 'steel',
  frame: 'skin', wall: 'skin', stone: 'skin', slab: 'skin', cladding: 'skin', timber: 'skin', glass: 'skin', water: 'skin', interior: 'skin', lamp: 'skin',
};
// Extents of the architecture used to frame the camera (trees may spill over).
const BOUNDS = new THREE.Box3(new THREE.Vector3(-7.2, 0, -4.2), new THREE.Vector3(10.6, 7.1, 6.2));
const CENTRE = BOUNDS.getCenter(new THREE.Vector3());
const CORNERS = Array.from({ length: 8 }, (_, i) => new THREE.Vector3(i & 1 ? BOUNDS.max.x : BOUNDS.min.x, i & 2 ? BOUNDS.max.y : BOUNDS.min.y, i & 4 ? BOUNDS.max.z : BOUNDS.min.z));

/* ------------------------------------------------------------------ model */

// A two-storey pavilion: glazed ground floor, a steel-trussed upper volume
// cantilevering four metres over the pool, and a stone blade wall behind.
function buildHouse() {
  const parts: Part[] = [];
  const box = (kind: Kind, pos: V3, size: V3, outline = true) => parts.push({ kind, matrix: new THREE.Matrix4().makeTranslation(...pos), size, solid: true, outline });
  const member = (a: V3, b: V3, w = .16, d = .24) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const dir = B.clone().sub(A); const length = dir.length();
    const base = new THREE.Matrix4().compose(A.add(B).multiplyScalar(.5), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()), ONE);
    const local = (offset: V3, size: V3) => parts.push({ kind: 'steel', matrix: base.clone().multiply(new THREE.Matrix4().makeTranslation(...offset)), size, solid: true, outline: false });
    local([0, 0, -(d / 2 - .02)], [w, length, .04]);
    local([0, 0, d / 2 - .02], [w, length, .04]);
    local([0, 0, 0], [.04, length, d]);
    parts.push({ kind: 'steel', matrix: base, size: [w, length, d], solid: false, outline: true });
  };

  // Ground, podium, terrace and pool.
  box('lawn', [1, .006, 1.5], [30, .012, 20], false);
  box('concrete', [-1.7, .2, -.2], [10.6, .4, 6.8]);
  box('concrete', [7, .2, -1.55], [6.8, .4, 4.1]);
  box('concrete', [7, .2, .7], [6.8, .4, .4]);
  box('concrete', [7, .2, 5.7], [6.8, .4, .4]);
  box('concrete', [3.8, .2, 3.2], [.4, .4, 4.6]);
  box('concrete', [10.2, .2, 3.2], [.4, .4, 4.6]);
  box('concrete', [7, .05, 3.2], [6, .1, 4.6], false);
  box('concrete', [-1.7, .17, 4.6], [10.6, .34, 2.8]);
  for (let i = 0; i < 4; i++) box('concrete', [-2.6, .04, 6.65 + i * .72], [1.5, .08, .5]);

  // Structural steel: ground-floor frame and the cantilever trusses.
  const cols = [-6.6, -3, 0, 3], lines = [-3.2, 2.8];
  cols.forEach(x => lines.forEach(z => { member([x, .4, z], [x, 3.5, z], .2, .2); box('steel', [x, .43, z], [.4, .06, .4], false); }));
  lines.forEach(z => member([-6.6, 3.5, z], [3, 3.5, z], .16, .3));
  [-6.6, -4.8].forEach(x => member([x, 3.5, -3.2], [x, 3.5, 2.8], .14, .24));
  const panels = [-3, -1, 1, 3, 5, 7];
  lines.forEach(z => {
    member([-3, 3.62, z], [7, 3.62, z], .2, .34);
    member([-3, 6.8, z], [7, 6.8, z], .2, .3);
    panels.forEach(x => member([x, 3.62, z], [x, 6.8, z], .16, .22));
    panels.slice(0, -1).forEach((x, i) => {
      const next = panels[i + 1];
      if (x < 3) member([x, 3.62, z], [next, 6.8, z], .14, .2); else member([x, 6.8, z], [next, 3.62, z], .14, .2);
    });
  });
  panels.forEach(x => { member([x, 3.62, -3.2], [x, 3.62, 2.8], .14, .24); member([x, 6.8, -3.2], [x, 6.8, 2.8], .14, .24); });

  // Ground floor envelope.
  box('wall', [-1.8, 1.95, -3.2], [9.6, 3.1, .2]);
  box('stone', [-6.6, 1.95, -.2], [.35, 3.1, 6.2]);
  box('glass', [-1.8, 1.95, 2.86], [9.4, 3.1, .04]);
  [-5.4, -4.2, -3, -1.8, -.6, .6, 1.8, 3].forEach(x => box('frame', [x, 1.95, 2.9], [.06, 3.1, .06], false));
  [.45, 3.45].forEach(y => box('frame', [-1.8, y, 2.9], [9.6, .06, .06], false));
  box('glass', [3.05, 1.95, -.2], [.04, 3.1, 6]);
  [-1.7, -.2, 1.3].forEach(z => box('frame', [3.08, 1.95, z], [.06, 3.1, .06], false));
  [.45, 3.45].forEach(y => box('frame', [3.08, y, -.2], [.06, .06, 6.2], false));
  box('slab', [-4.95, 3.65, -.2], [3.7, .3, 6.8]);

  // Upper floor: charcoal volume, timber battens, ribbon window and a glazed cantilever end.
  box('slab', [2, 3.65, -.2], [10.2, .3, 6.8]);
  box('cladding', [2, 5.3, -3.35], [10.2, 3, .14]);
  box('cladding', [-3.03, 5.3, -.2], [.14, 3, 6.5]);
  box('cladding', [2, 4.15, 2.95], [10.2, .7, .14]);
  box('cladding', [2, 6.4, 2.95], [10.2, .8, .14]);
  box('glass', [2, 5.25, 2.95], [10, 1.5, .04]);
  [-1, 1, 3, 5].forEach(x => box('frame', [x, 5.25, 2.98], [.06, 1.5, .06], false));
  for (let i = 0; i <= 50; i++) {
    const x = -3 + i * .2;
    box('timber', [x, 4.15, 3.04], [.06, .7, .05], false);
    box('timber', [x, 6.4, 3.04], [.06, .8, .05], false);
  }
  box('glass', [7.03, 5.3, -.2], [.04, 3, 6.3]);
  [-2.1, -.2, 1.7].forEach(z => box('frame', [7.06, 5.3, z], [.06, 3, .06], false));
  [3.82, 6.78].forEach(y => box('frame', [7.06, y, -.2], [.06, .06, 6.4], false));
  box('slab', [2, 6.95, -.2], [10.4, .3, 6.8]);

  // Landscape walls, deck, water and fit-out.
  box('stone', [-2, 2.3, -4], [14, 4.6, .4]);
  for (let i = 0; i < 14; i++) box('timber', [-1.7, .365, 3.3 + i * .2], [10.6, .05, .17], false);
  box('water', [7, .3, 3.2], [6, .02, 4.6]);
  ([[-.8, .85, 0, 2.6, .9, .9], [-4.8, .7, .8, 2.4, .6, .9], [-4.8, 1, .35, 2.4, .6, .2], [5.2, .55, -1, .7, .25, 2], [6.4, .55, -1, .7, .25, 2], [4.8, 4.05, -1.4, 2, .5, 2.2]] as const)
    .forEach(([x, y, z, w, h, d]) => box('interior', [x, y, z], [w, h, d]));
  box('timber', [1.6, 1.15, .8], [1.8, .06, .9]);
  box('timber', [4.8, 4.6, -2.6], [2.2, 1, .12], false);
  box('timber', [0, 4.55, -2.6], [2, .06, .7], false);
  box('wall', [-3, 1.95, -1.8], [.15, 3.1, 2.8]);
  box('wall', [2.6, 5.3, -1.5], [.12, 3, 3.6]);
  [4.2, 5.6].forEach(x => [-2.2, -.2, 1.8].forEach(z => box('lamp', [x, 3.49, z], [.35, .02, .35], false)));

  return parts;
}

function mergeByKind(parts: Part[]) {
  const groups = new Map<Kind, THREE.BufferGeometry[]>();
  parts.filter(p => p.solid).forEach(p => {
    const g = new THREE.BoxGeometry(...p.size!);
    g.applyMatrix4(p.matrix);
    const list = groups.get(p.kind) ?? []; list.push(g); groups.set(p.kind, list);
  });
  const result: { kind: Kind; geometry: THREE.BufferGeometry }[] = [];
  groups.forEach((list, kind) => {
    const merged = mergeGeometries(list, false);
    list.forEach(g => g.dispose());
    if (merged) result.push({ kind, geometry: merged });
  });
  return result;
}

const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

/** All blueprint lines, ordered so the drawing starts with the plan and rises. */
function buildLinework(parts: Part[]) {
  const chunks: { key: number; positions: ArrayLike<number> }[] = [];
  const plan: number[] = [];
  const seg = (x1: number, z1: number, x2: number, z2: number) => plan.push(x1, .03, z1, x2, .03, z2);
  const rect = (x1: number, z1: number, x2: number, z2: number) => { seg(x1, z1, x2, z1); seg(x2, z1, x2, z2); seg(x2, z2, x1, z2); seg(x1, z2, x1, z1); };
  rect(-7, -3.6, 3.6, 3.2); rect(3.6, -3.6, 10.4, 5.9); rect(4, .9, 10, 5.5); rect(-3.1, -3.4, 7.1, 3); rect(-7, 3.2, 3.6, 6);
  const gridX = [-6.6, -3, 0, 3, 5, 7], gridZ = [-3.2, 2.8];
  gridX.forEach(x => seg(x, -5.4, x, 7.8));
  gridZ.forEach(z => seg(-8.8, z, 12, z));
  seg(-6.6, 7.5, 7, 7.5);
  gridX.forEach(x => seg(x - .2, 7.3, x + .2, 7.7));
  seg(11.7, -3.2, 11.7, 2.8);
  gridZ.forEach(z => seg(11.5, z - .2, 11.9, z + .2));
  chunks.push({ key: -100, positions: plan });

  parts.filter(p => p.outline).forEach((p, i) => {
    const source = new THREE.BoxGeometry(...p.size!);
    const edges = new THREE.EdgesGeometry(source, 20);
    edges.applyMatrix4(p.matrix);
    const centre = new THREE.Vector3().setFromMatrixPosition(p.matrix);
    chunks.push({ key: centre.y + (p.kind === 'concrete' ? -3 : 0) + hash(i) * 1.1, positions: edges.attributes.position.array });
    edges.dispose(); source.dispose();
  });
  chunks.sort((a, b) => a.key - b.key);
  const all = new Float32Array(chunks.reduce((n, c) => n + c.positions.length, 0));
  let offset = 0; chunks.forEach(c => { all.set(c.positions, offset); offset += c.positions.length; });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(all, 3));
  return { geometry, vertices: all.length / 3, planVertices: plan.length / 3 };
}

function buildGrid(size: number, step: number, every: number) {
  const minor: number[] = [], major: number[] = [];
  for (let i = -size; i <= size; i += step) {
    const list = Math.round(i / step) % every === 0 ? major : minor;
    list.push(i, 0, -size, i, 0, size, -size, 0, i, size, 0, i);
  }
  const make = (data: number[]) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(data, 3)); return g; };
  return { minor: make(minor), major: make(major) };
}

type PlantType = 'cypress' | 'tree' | 'shrub';
/** One merged, vertex-coloured mesh per plant so each can grow independently. */
function plantGeometry(type: PlantType, seed: number) {
  const pieces: THREE.BufferGeometry[] = [];
  const paint = (g: THREE.BufferGeometry, color: string) => {
    const c = new THREE.Color(color); const n = g.attributes.position.count; const data = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { data[i * 3] = c.r; data[i * 3 + 1] = c.g; data[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(data, 3)); g.deleteAttribute('uv'); return g;
  };
  const trunk = (height: number) => { const t = new THREE.CylinderGeometry(.06, .11, height, 7).toNonIndexed(); t.translate(0, height / 2, 0); pieces.push(paint(t, '#5e5242')); };
  const blob = (r: number, s: V3, p: V3, color: string) => { const g = new THREE.IcosahedronGeometry(r, 1); g.scale(...s); g.translate(...p); pieces.push(paint(g, color)); };
  if (type === 'cypress') {
    trunk(.6);
    for (let i = 0; i < 6; i++) blob(.62 - i * .07, [1, 1.5, 1], [Math.sin(seed + i) * .06, 1.1 + i * .82, Math.cos(seed + i) * .06], ['#2c432f', '#36503a', '#2f4832'][i % 3]);
  } else if (type === 'tree') {
    trunk(2.8);
    for (let i = 0; i < 26; i++) {
      const a = i * 2.4 + seed, r = .5 + hash(seed + i) * .55;
      blob(.42, [1, .7, 1], [Math.sin(a) * r, 2.9 + Math.sin(i * 1.7) * .45, Math.cos(a) * r], ['#5b6b45', '#4a5b3c', '#6f7f53'][i % 3]);
    }
  } else {
    for (let i = 0; i < 6; i++) { const a = i * 2.4 + seed; blob(.24, [.9, .8, .9], [Math.sin(a) * .2, .22 + Math.sin(i) * .06, Math.cos(a) * .2], ['#4c5e3e', '#3f5236', '#5d6d48'][i % 3]); }
  }
  const merged = mergeGeometries(pieces, false)!; pieces.forEach(p => p.dispose()); return merged;
}

const PLANTS: { at: V3; scale: number; type: PlantType }[] = [
  ...[-8.6, -7.2, -5.8, 5.6, 7, 8.4].map((x, i) => ({ at: [x, 0, -5.2] as V3, scale: .9 + hash(i) * .25, type: 'cypress' as const })),
  { at: [-9, 0, 4.4], scale: 1.05, type: 'tree' },
  { at: [12, 0, -2.4], scale: .95, type: 'tree' },
  ...[-6.6, -5.8, -5, -4.2, -3.4, -1.6, -.7, .2, 1.1, 2, 2.9].map(x => ({ at: [x, 0, 6.35] as V3, scale: .9 + hash(x) * .4, type: 'shrub' as const })),
  ...[1, 2.4, 3.8, 5.2].map(z => ({ at: [10.95, 0, z] as V3, scale: 1, type: 'shrub' as const })),
  ...[-2, 0, 2].map(z => ({ at: [-7.6, 0, z] as V3, scale: 1.1, type: 'shrub' as const })),
];

/* ------------------------------------------------------------------ scene */

const easeOutBack = (x: number) => { const c = 1.4; return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
// Gentle sine easing reads as a steady, cinematic camera move (no sudden surges).
const easeSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
/** Playback pace: 1 story second = 1 / PACE real seconds. */
const PACE = .74;
/** Hero viewing angle the framing distance is measured from, so the descent never zooms. */
const HERO_POLAR = 1.1, HERO_AZIMUTH = .6;
const lerp = THREE.MathUtils.lerp;
// Screen regions (NDC centre and half-extent) the building is fitted into: [intro, revealed].
const layoutRects = (wide: boolean): [Rect, Rect] => wide
  ? [{ cx: 0, cy: -.04, hw: .6, hh: .62 }, { cx: .42, cy: -.05, hw: .52, hh: .6 }]
  : [{ cx: 0, cy: .04, hw: .9, hh: .42 }, { cx: 0, cy: .43, hw: .9, hh: .27 }];

function Film(props: SceneProps & { warm: boolean; onWarm: () => void }) {
  const { camera, size, scene, gl, invalidate } = useThree();
  const persp = camera as THREE.PerspectiveCamera;

  const model = useMemo(() => {
    const parts = buildHouse();
    const solids = mergeByKind(parts);
    const lines = buildLinework(parts);
    const grid = buildGrid(48, 1, 5);
    const plants = PLANTS.map((p, i) => ({ ...p, geometry: plantGeometry(p.type, i * 1.7) }));
    return { solids, lines, grid, plants };
  }, []);

  const planes = useMemo(() => ({
    base: new THREE.Plane(new THREE.Vector3(0, 0, -1), -9.5),
    steel: new THREE.Plane(new THREE.Vector3(0, -1, 0), -.1),
    skin: new THREE.Plane(new THREE.Vector3(-1, 0, 0), -10),
  }), []);

  const materials = useMemo(() => {
    const solid = Object.fromEntries((Object.keys(MATERIALS) as Kind[]).map(kind => {
      const m = new THREE.MeshStandardMaterial(MATERIALS[kind]);
      m.clippingPlanes = [planes[STAGE[kind]]]; m.clipShadows = true;
      return [kind, m];
    })) as Record<Kind, THREE.MeshStandardMaterial>;
    const line = new THREE.LineBasicMaterial({ color: '#7cc8ff', transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });
    const gridMinor = new THREE.LineBasicMaterial({ color: '#3d6f96', transparent: true, opacity: 0, depthWrite: false });
    const gridMajor = new THREE.LineBasicMaterial({ color: '#5a9bd0', transparent: true, opacity: 0, depthWrite: false });
    const scan = new THREE.MeshBasicMaterial({ color: '#8fd3ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
    const scanEdge = new THREE.MeshBasicMaterial({ color: '#d4efff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const plant = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
    return { solid, line, gridMinor, gridMajor, scan, scanEdge, plant };
  }, [planes]);

  useEffect(() => () => {
    model.solids.forEach(s => s.geometry.dispose()); model.lines.geometry.dispose();
    model.grid.minor.dispose(); model.grid.major.dispose(); model.plants.forEach(p => p.geometry.dispose());
    Object.values(materials.solid).forEach(m => m.dispose());
    [materials.line, materials.gridMinor, materials.gridMajor, materials.scan, materials.scanEdge, materials.plant].forEach(m => m.dispose());
  }, [model, materials]);

  // Compile every shader before the first frame so the build never hitches mid-flight.
  // All meshes stay "visible" for the whole film; clipping planes hide them until revealed.
  useEffect(() => {
    let alive = true;
    gl.compileAsync(scene, camera).catch(() => undefined).then(() => { if (alive) props.onWarm(); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (props.warm) invalidate(); }, [props.warm, invalidate]);

  const plantRefs = useRef<(THREE.Group | null)[]>([]);
  const skinScan = useRef<THREE.Group>(null);
  const steelScan = useRef<THREE.Group>(null);
  const baseScan = useRef<THREE.Mesh>(null);
  const lamps = useRef<(THREE.PointLight | null)[]>([]);
  const orbit = useRef(0);
  const look = useRef({ x: 0, y: 0 });
  const layout = useRef<number | null>(null);
  const radius = useRef(48);
  const shown = useRef<number | null>(null);
  const ready = useRef(false);
  const shadowsLive = useRef(true);
  const target = useMemo(() => new THREE.Vector3(1.7, 2.6, 1), []);
  const scratch = useMemo(() => ({ dir: new THREE.Vector3(), hero: new THREE.Vector3(Math.sin(HERO_POLAR) * Math.sin(HERO_AZIMUTH), Math.cos(HERO_POLAR), Math.sin(HERO_POLAR) * Math.cos(HERO_AZIMUTH)), v: new THREE.Vector3() }), []);

  useEffect(() => { orbit.current = 0; shadowsLive.current = true; gl.shadowMap.autoUpdate = true; invalidate(); }, [props.revision, gl, invalidate]);

  function project(dir: THREE.Vector3, distance: number) {
    camera.position.copy(target).addScaledVector(dir, distance);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const c of CORNERS) {
      scratch.v.copy(c).project(camera);
      minX = Math.min(minX, scratch.v.x); maxX = Math.max(maxX, scratch.v.x);
      minY = Math.min(minY, scratch.v.y); maxY = Math.max(maxY, scratch.v.y);
    }
    return { minX, maxX, minY, maxY };
  }
  /**
   * Fits the building into `rect`. The distance is solved from the fixed hero angle
   * (not the moving camera), then eased, so the camera's descent and drift never
   * read as a zoom. The current view only decides where on screen it is centred.
   */
  function frameTo(rect: Rect, dt: number, push: number) {
    const { width: w, height: h } = size;
    persp.clearViewOffset();
    for (let pass = 0; pass < 3; pass++) {
      const b = project(scratch.hero, radius.current);
      radius.current *= Math.max((b.maxX - b.minX) / 2 / rect.hw, (b.maxY - b.minY) / 2 / rect.hh);
    }
    if (shown.current === null) shown.current = radius.current;
    else shown.current += (radius.current - shown.current) * (1 - Math.exp(-dt * 2));
    // Centre on the projected centroid: it moves continuously as the camera turns,
    // unlike the bounding-box extremes, which switch corners and cause sideways jitter.
    project(scratch.dir, shown.current * push);
    scratch.v.copy(CENTRE).project(camera);
    persp.setViewOffset(w, h, -(rect.cx - scratch.v.x) * w / 2, (rect.cy - scratch.v.y) * h / 2, w, h);
  }

  useFrame((_, delta) => {
    if (!props.warm) return;
    const dt = Math.min(delta, 1 / 30);
    if (props.running) {
      if (props.clock.current < DURATION) props.clock.current = Math.min(DURATION, props.clock.current + dt * props.speed.current * PACE);
      else if (!props.reduced) orbit.current += dt;
    }
    const t = props.clock.current;
    const dusk = duskAt(t);

    // Linework: plan first, then rising members; fades to a faint x-ray once built.
    const planShare = smooth(t, 0, 1.3), rest = smooth(t, .5, 3.7);
    const drawn = planShare < 1 ? model.lines.planVertices * planShare : model.lines.planVertices + (model.lines.vertices - model.lines.planVertices) * rest;
    model.lines.geometry.setDrawRange(0, Math.floor(drawn / 2) * 2);
    materials.line.opacity = .85 - smooth(t, 5.4, 2.6) * .82;
    materials.gridMinor.opacity = smooth(t, 0, 1) * .3 - dusk * .22;
    materials.gridMajor.opacity = smooth(t, 0, 1) * .48 - dusk * .32;

    // Clipping sweeps.
    const baseZ = lerp(-9.5, 12, smooth(t, .8, 1.8));
    const steelY = lerp(-.1, 7.4, smooth(t, 2.2, 2.2));
    const skinX = lerp(-10, 11.5, smooth(t, 4.3, 2.3));
    planes.base.constant = baseZ; planes.steel.constant = steelY; planes.skin.constant = skinX;
    const pulse = (start: number, length: number) => Math.sin(Math.PI * clamp01((t - start) / length));
    // Scanners are only shown while their own sweep runs (shaders were compiled up front).
    if (baseScan.current) { baseScan.current.position.z = baseZ; baseScan.current.visible = pulse(.8, 1.8) > .01; }
    if (steelScan.current) { steelScan.current.position.y = steelY; steelScan.current.visible = pulse(2.2, 2.2) > .01; }
    if (skinScan.current) { skinScan.current.position.x = skinX; skinScan.current.visible = pulse(4.3, 2.3) > .01; }
    materials.scan.opacity = Math.max(pulse(2.2, 2.2), pulse(4.3, 2.3)) * .085;
    materials.scanEdge.opacity = Math.max(pulse(.8, 1.8), pulse(2.2, 2.2), pulse(4.3, 2.3)) * .9;

    // Landscape grows in.
    plantRefs.current.forEach((group, i) => {
      if (!group) return;
      const s = easeOutBack(clamp01((t - 5.3 - (i % 8) * .08 - Math.floor(i / 8) * .14) / .8));
      group.scale.setScalar(Math.max(.0001, s) * PLANTS[i].scale);
    });

    // Blue hour: interiors, soffit lights and the pool come alive.
    materials.solid.glass.emissiveIntensity = dusk * .45;
    materials.solid.lamp.emissiveIntensity = dusk * 3;
    lamps.current.forEach(l => { if (l) l.intensity = dusk * 22; });
    (scene.background as THREE.Color).copy(BG).lerp(BG_DUSK, dusk);
    scene.fog?.color.copy(scene.background as THREE.Color);

    // The scene is static once complete, so stop re-rendering the shadow map.
    const live = t < DURATION;
    if (live !== shadowsLive.current) { shadowsLive.current = live; gl.shadowMap.autoUpdate = live; gl.shadowMap.needsUpdate = true; }

    // Camera: plan view → sweeping descent → slow, breathing drift, always fitted to a screen region.
    const wide = size.width / size.height >= 1.3;
    const goal = props.revealed.current ? 1 : 0;
    // Step-aside move: a fixed-length tween (2.6 s) rather than an exponential chase.
    if (layout.current === null || props.reduced) layout.current = goal;
    else layout.current += Math.sign(goal - layout.current) * Math.min(Math.abs(goal - layout.current), dt / 2.6);
    const [intro, final] = layoutRects(wide);
    const m = easeSine(clamp01(layout.current));
    const zoom = 1 + props.scroll.current * .18;
    const rect = { cx: lerp(intro.cx, final.cx, m), cy: lerp(intro.cy, final.cy, m), hw: lerp(intro.hw, final.hw, m) * zoom, hh: lerp(intro.hh, final.hh, m) * zoom };

    const k = easeSine(clamp01(t / 7.6));
    const settle = props.reduced ? 0 : smooth(t, DURATION - 1.2, 1.2);
    const pointer = props.pointer.current;
    const ease = 1 - Math.exp(-dt * 2.4);
    look.current.x += (pointer.x * settle - look.current.x) * ease;
    look.current.y += (pointer.y * settle - look.current.y) * ease;
    const o = orbit.current;
    const polar = lerp(.05, 1.1, k) + Math.sin(o * .11) * .05 - look.current.y * .05;
    const azimuth = lerp(-.15, .6, k) + Math.sin(o * .085) * .26 + look.current.x * .12;
    scratch.dir.set(Math.sin(polar) * Math.sin(azimuth), Math.cos(polar), Math.sin(polar) * Math.cos(azimuth));
    // A barely-there 4% dolly over the whole build keeps it alive without a visible zoom.
    frameTo(rect, dt, lerp(1.04, 1, easeSine(clamp01(t / 7.6))));

    props.onTick(t);
    if (!ready.current) { ready.current = true; props.onReady(); }
  });

  return <>
    <color attach="background" args={[BG.getHex()]}/>
    <fog attach="fog" args={[BG.getHex(), 90, 240]}/>
    <hemisphereLight args={['#9fbad4', '#151d25', .75]}/>
    <directionalLight position={[-14, 16, 12]} intensity={2.1} color="#ffd8a8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-camera-far={80} shadow-bias={-.0004} shadow-normalBias={.03}/>
    <directionalLight position={[12, 8, -14]} intensity={1.2} color="#7fb4ff"/>
    {([[-1.5, 2.2, .4], [1.8, 2.2, .2], [3, 5.4, -.4]] as V3[]).map((p, i) => <pointLight key={i} ref={el => { lamps.current[i] = el; }} position={p} color="#ffb36b" intensity={0} distance={10} decay={2}/>)}

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.01, 0]} receiveShadow>
      <planeGeometry args={[480, 480]}/><meshStandardMaterial color="#0f1a24" roughness={.96}/>
    </mesh>
    <lineSegments geometry={model.grid.minor} material={materials.gridMinor} position={[0, .02, 0]}/>
    <lineSegments geometry={model.grid.major} material={materials.gridMajor} position={[0, .022, 0]}/>

    {model.solids.map(({ kind, geometry }) => <mesh key={kind} geometry={geometry} material={materials.solid[kind]} castShadow={kind !== 'glass' && kind !== 'lawn' && kind !== 'water'} receiveShadow renderOrder={kind === 'glass' ? 2 : 0}/>)}
    {model.plants.map((p, i) => <group key={i} ref={el => { plantRefs.current[i] = el; }} position={p.at} scale={.0001}><mesh geometry={p.geometry} material={materials.plant} castShadow receiveShadow/></group>)}
    <lineSegments geometry={model.lines.geometry} material={materials.line} renderOrder={5} frustumCulled={false}/>

    <mesh ref={baseScan} position={[1, .05, -9.5]} material={materials.scanEdge}><boxGeometry args={[30, .02, .03]}/></mesh>
    <group ref={steelScan} position={[2, -1, -.2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={materials.scan}><planeGeometry args={[19, 12]}/></mesh>
    </group>
    <group ref={skinScan} position={[-10, 0, 0]}>
      <mesh position={[0, 3.8, .6]} rotation={[0, Math.PI / 2, 0]} material={materials.scan}><planeGeometry args={[13, 7.6]}/></mesh>
      <mesh position={[0, .05, .6]} material={materials.scanEdge}><boxGeometry args={[.03, .02, 13]}/></mesh>
      <mesh position={[0, 7.6, .6]} material={materials.scanEdge}><boxGeometry args={[.02, .02, 13]}/></mesh>
    </group>
  </>;
}

class FilmBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function BlueprintScene(props: SceneProps) {
  const [supported, setSupported] = useState(false);
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    if (context) { setSupported(true); context.getExtension('WEBGL_lose_context')?.loseContext(); } else props.onFailure();
    // Capability is checked once; callbacks are notifications to the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!supported) return null;
  return <FilmBoundary onFailure={props.onFailure}>
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: FOV, near: 1, far: 500, position: [0, 60, 1] }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      frameloop={!warm ? 'never' : props.running ? 'always' : 'demand'}
      onCreated={({ gl }) => { gl.localClippingEnabled = true; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.08; }}
    >
      <Film {...props} warm={warm} onWarm={() => setWarm(true)}/>
    </Canvas>
  </FilmBoundary>;
}
