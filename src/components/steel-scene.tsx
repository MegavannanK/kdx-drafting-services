'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Component, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type Point = [number, number, number];
type Member = { start: Point; end: Point; color?: string; width?: number; depth?: number };
export type SceneProps = { wireframe: boolean; exploded: boolean; rotating: boolean; resetKey: number; };

function FitCamera({ exploded, resetKey }: { exploded: boolean; resetKey: number }) {
  const { camera, size } = useThree();
  useEffect(() => { camera.position.set(12, 9, 13); camera.lookAt(0, .6, 0); }, [camera, resetKey]);
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = Math.min(48, size.width / 14.8, size.height / 13) * (exploded ? .82 : 1);
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height, exploded]);
  return null;
}

export function Beam({ start, end, color = '#bfc4c3', width = .17, depth = .28, wireframe }: Member & { wireframe: boolean }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    return { position: a.add(b).multiplyScalar(.5), quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()), length: direction.length() };
  }, [start, end]);
  return <group position={position} quaternion={quaternion}>
    {[ -1, 1 ].map(side => <mesh key={side} castShadow receiveShadow position={[0, 0, side * (depth / 2 - .025)]}>
      <boxGeometry args={[width, length, .045]} /><meshStandardMaterial color={color} metalness={.48} roughness={.42} wireframe={wireframe} />
    </mesh>)}
    <mesh castShadow receiveShadow><boxGeometry args={[.045, length, depth]} /><meshStandardMaterial color={color} metalness={.48} roughness={.42} wireframe={wireframe} /></mesh>
  </group>;
}

function Structure({ wireframe, exploded }: Pick<SceneProps, 'wireframe' | 'exploded'>) {
  const group = useRef<THREE.Group>(null);
  const [expansion] = useState({ value: 0 });
  useFrame((_, delta) => { expansion.value = THREE.MathUtils.damp(expansion.value, exploded ? 1 : 0, 4, delta); if (group.current) { group.current.children.forEach((child, i) => { if (i < 3) child.position.y = expansion.value * i * 1.15; }); } });
  const levels = useMemo(() => [0, 1, 2].map(level => {
    const members: Member[] = [], bottom = level * 2.25, top = bottom + 2.25;
    const orange = level === 2 ? '#e65f25' : '#acb4b5';
    for (let bay = 0; bay <= 4; bay++) {
      const x = bay * 2.05 - 4.1;
      for (const z of [-2, 2]) {
        members.push({ start: [x, bottom, z], end: [x, top, z], color: '#bfc6c5', width: .22, depth: .24 });
        if (bay < 4) members.push({ start: [x, top, z], end: [x + 2.05, top, z], color: orange });
      }
      members.push({ start: [x, top, -2], end: [x, top, 2], color: orange, width: .2, depth: .3 });
      if (bay < 4) for (const step of [0.5, 1, 1.5]) members.push({ start: [x + step, top, -2], end: [x + step, top, 2], color: level === 2 ? '#de662d' : '#d0d4d0', width: .075, depth: .13 });
    }
    if (level < 2) {
      for (const x of [-4.1, 4.1]) {
        members.push({ start: [x, bottom, -2], end: [x, top, 2], color: '#697979', width: .075, depth: .07 });
        members.push({ start: [x, top, -2], end: [x, bottom, 2], color: '#697979', width: .075, depth: .07 });
      }
      members.push({ start: [-4.1, bottom, -2], end: [-2.05, top, -2], color: '#697979', width: .07, depth: .08 });
    }
    return members;
  }), []);
  return <group ref={group} position={[0, -.7, 0]}>
    {levels.map((members, level) => <group key={level}>{members.map((member, i) => <Beam {...member} wireframe={wireframe} key={i} />)}</group>)}
    {[-4.1, -2.05, 0, 2.05, 4.1].flatMap(x => [-2, 2].map(z => <mesh key={`${x}-${z}`} receiveShadow castShadow position={[x, -.12, z]}><boxGeometry args={[.6, .2, .6]} /><meshStandardMaterial color="#b9b6ac" roughness={.8} /></mesh>))}
  </group>;
}

function Fallback() { return <div className="model-fallback"><svg viewBox="0 0 600 420" role="img" aria-label="Illustrative steel structure"><g fill="none" stroke="#6c7773" strokeWidth="3">{[0,1,2].map(y => <g key={y} transform={`translate(0,${y * 70})`}>{[0,1,2,3,4].map(x => <path key={x} d={`M ${90+x*70} ${160-x*18} l 160 80 v -70 l -160 -80 v 70 m 0 -70 l 280 -72 m -120 152 l 280 -72`} />)}</g>)}</g></svg><span>3D preview unavailable on this device</span></div>; }
class SceneBoundary extends Component<{children: ReactNode}, {failed: boolean}> { state = {failed: false}; static getDerivedStateFromError() { return {failed: true}; } render() {return this.state.failed ? <Fallback /> : this.props.children;} }

export default function SteelScene(props: SceneProps) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [inView, setInView] = useState(true);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => { const canvas = document.createElement('canvas'); setAvailable(Boolean(canvas.getContext('webgl2'))); const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting)); if (host.current) observer.observe(host.current); return () => observer.disconnect(); }, []);
  return <div ref={host} className="scene-canvas" aria-label="Interactive illustrative steel frame. Drag to rotate; use the controls below for alternate views.">
    {available === false ? <Fallback /> : available === null ? <div className="scene-loading">ASSEMBLING THE DETAILS<span /></div> : <SceneBoundary><Canvas shadows dpr={[1, 1.5]} orthographic camera={{ position: [12, 9, 13], zoom: 48, near: .1, far: 100 }} frameloop={inView ? 'always' : 'never'} gl={{ antialias: true, alpha: true }}>
      <FitCamera exploded={props.exploded} resetKey={props.resetKey} /><ambientLight intensity={1.7} /><directionalLight position={[5, 14, 5]} intensity={3} castShadow shadow-mapSize={[1024, 1024]} /><directionalLight position={[-8, 4, -6]} intensity={1.3} />
      <group position={[0, -2.1, 0]}><Structure wireframe={props.wireframe} exploded={props.exploded} /><ContactShadows position={[0, -.92, 0]} opacity={.32} scale={24} blur={2.5} far={12} resolution={256} color="#565849" /><gridHelper args={[24, 24, '#c8c6bd', '#dcd9ce']} position={[0, -.94, 0]} /></group>
      <OrbitControls key={props.resetKey} makeDefault target={[0, .6, 0]} enableZoom={false} enablePan={false} autoRotate={props.rotating} autoRotateSpeed={.35} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.15} />
    </Canvas></SceneBoundary>}
  </div>;
}
