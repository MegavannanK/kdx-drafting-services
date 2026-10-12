'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Component, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type Point = [number, number, number];
type Member = { start: Point; end: Point; color?: string; width?: number; depth?: number };
export type SceneProps = { wireframe: boolean; exploded: boolean; rotating: boolean; resetKey: number; view?: 'architecture' | 'steel' | 'cutaway'; };

function FitCamera({ exploded, resetKey }: { exploded: boolean; resetKey: number }) {
  const { camera, size } = useThree();
  useEffect(() => { camera.position.set(12, 9, 13); camera.lookAt(0, .6, 0); }, [camera, resetKey]);
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = Math.min(48, size.width / 16.5, size.height / 13) * (exploded ? .66 : 1);
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height, exploded, resetKey]);
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

function Solid({ at, size, color, glass = false }: { at: Point; size: Point; color: string; glass?: boolean }) {
  return <mesh position={at} castShadow={!glass} receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={glass ? .16 : .75} metalness={glass ? .25 : .05} transparent={glass} opacity={glass ? .32 : 1} depthWrite={!glass} /></mesh>;
}
function Plant({ at, scale = 1 }: { at: Point; scale?: number }) {
  return <group position={at} scale={scale}><Solid at={[0,.14,0]} size={[.32,.28,.32]} color="#a8a298"/>{[0,1,2].map(i=><mesh key={i} position={[(i-1)*.13,.43+i*.09,0]} castShadow><sphereGeometry args={[.22,8,8]}/><meshStandardMaterial color={i===1?'#557447':'#71855c'} roughness={1}/></mesh>)}</group>;
}
function Interior({ level }: { level: number }) {
  return <group>
    <Solid at={[-1.9,.09,.6]} size={[2.4,.025,1.5]} color={level===1?'#bcb6a8':'#a9b7b4'}/>
    <Solid at={[-2,.36,1]} size={[1.8,.55,.65]} color="#d8cbbc"/><Solid at={[-2,.73,1.22]} size={[1.8,.28,.18]} color="#cbbdac"/>
    <Solid at={[-2,.29,.13]} size={[1.1,.12,.55]} color="#8c6849"/>
    <Solid at={[1.2,.66,-.4]} size={[1.5,.12,.95]} color="#b68b63"/>
    {[-.5,.5].flatMap(x=>[-.7,.7].map(z=><group key={`${x}-${z}`}><Solid at={[1.2+x,.32,-.4+z]} size={[.38,.09,.36]} color="#d2c8b7"/><Solid at={[1.2+x,.14,-.4+z]} size={[.055,.28,.055]} color="#34454d"/></group>))}
    <Solid at={[3.55,1,-1.1]} size={[.14,1.85,1.5]} color="#d8cabb"/>
    <Solid at={[-3.8,.45,-1.6]} size={[.45,.8,.55]} color="#8d7256"/>
    <Plant at={[3.3,.07,1.15]}/><Plant at={[-3.55,.07,-1]}/>
    {Array.from({length:10},(_,i)=><Solid key={i} at={[2.8,.1+i*.2,-1.55+i*.24]} size={[.72,.15,.27]} color="#b7ae9d"/>)}
  </group>;
}
function Structure({ wireframe, exploded, view = 'architecture' }: Pick<SceneProps, 'wireframe' | 'exploded' | 'view'>) {
  const floors = useRef<(THREE.Group|null)[]>([]);
  const expansion = useRef(0);
  useFrame((_, delta) => { expansion.current = THREE.MathUtils.damp(expansion.current, exploded ? 1 : 0, 4, delta); floors.current.forEach((floor,i)=>{if(floor) floor.position.y=i*2.25+expansion.current*i*1.35;}); });
  const steel = view === 'steel', cutaway = view === 'cutaway';
  return <group position={[0,-.7,0]}>
    {[0,1,2].map(level=><group key={level} ref={el=>{floors.current[level]=el;}} position={[0,level*2.25,0]}>
      {[-4.1,-2.05,0,2.05,4.1].flatMap(x=>[-2,2].map(z=><Beam key={`${x}-${z}`} start={[x,0,z]} end={[x,2.25,z]} width={.18} depth={.22} color={steel?'#39779d':'#354754'} wireframe={wireframe}/>))}
      {[-2,2].map(z=><Beam key={z} start={[-4.1,2.25,z]} end={[4.1,2.25,z]} color={steel?'#5392b4':'#364954'} width={.17} depth={.24} wireframe={wireframe}/>)}
      {[-4.1,-2.05,0,2.05,4.1].map(x=><Beam key={x} start={[x,2.25,-2]} end={[x,2.25,2]} color="#546974" width={.17} depth={.24} wireframe={wireframe}/>)}
      {steel && <>{[-3.6,-3.1,-2.6,-1.55,-1.05,-.55,.5,1,1.5,2.55,3.05,3.55].map(x=><Beam key={x} start={[x,2.25,-2]} end={[x,2.25,2]} color="#8c9c9f" width={.065} depth={.12} wireframe={wireframe}/>)}{[-4.1,4.1].map(x=><Beam key={x} start={[x,0,-2]} end={[x,2.25,2]} color="#7c8f91" width={.06} depth={.06} wireframe={wireframe}/>)}{[-4.1,0,4.1].flatMap(x=>[-2,2].map(z=><Solid key={`${x}-${z}`} at={[x,.04,z]} size={[.4,.08,.4]} color="#71858b"/>))}</>}
      {!steel&&<>
        <Solid at={[0,-.05,cutaway&&level>0?-.95:0]} size={[8.8,.18,cutaway&&level>0?2.35:4.9]} color="#e2dbca"/>
        <Solid at={[0,1.08,-2.05]} size={[8.2,2.05,.06]} color="#6a9ca9" glass/>
        <Solid at={[-4.15,1.05,0]} size={[.12,2.1,4]} color="#c8bda8"/>
        {!cutaway&&<>
          {[-3.1,-1.05,1.05,3.1].map(x=><group key={x}><Solid at={[x,1.05,2.05]} size={[1.95,2.06,.055]} color="#759dab" glass/><Solid at={[x,1.05,2.06]} size={[.035,2.1,.055]} color="#526873"/></group>)}
          <Solid at={[4.15,1.05,0]} size={[.05,2.1,4]} color="#80a6ad" glass/>
          <Solid at={[0,.5,2.42]} size={[8.65,.7,.035]} color="#84a9ad" glass/>
          <Solid at={[0,.88,2.42]} size={[8.65,.035,.035]} color="#61717a"/>
          {[-3.7,-3.4,-3.1,-2.8].map(x=><Solid key={x} at={[x,1.1,2.19]} size={[.11,2.15,.18]} color="#a5805b"/>)}
          {level===2&&<><Solid at={[0,2.33,0]} size={[9.1,.22,5.1]} color="#dfd6c4"/><Solid at={[0,2.49,-.4]} size={[6.8,.09,3.4]} color="#6f7f72"/></>}
        </>}
        <Interior level={level}/>
        {!cutaway&&[-1.5,.3,2.1,3.6].map(x=><Plant key={x} at={[x,.05,2.25]} scale={.62}/>)}
      </>}
    </group>)}
    <Solid at={[0,-.28,0]} size={[10.8,.28,7.4]} color="#b9b7aa"/>
    <Solid at={[0,-.12,3.05]} size={[9.3,.1,.6]} color="#d4cebd"/>
    <Solid at={[-.6,-.14,4.15]} size={[6.7,.12,1.2]} color="#69949a"/>
    {[-5,5].flatMap(x=>[-2.8,1.8].map(z=><group key={`${x}-${z}`}><Solid at={[x,.5,z]} size={[.11,1.35,.11]} color="#75664e"/><mesh position={[x,1.65,z]} castShadow><sphereGeometry args={[.65,12,10]}/><meshStandardMaterial color="#6d825d" roughness={1}/></mesh><mesh position={[x+.15,2.1,z]} castShadow><sphereGeometry args={[.48,12,10]}/><meshStandardMaterial color="#7d906a" roughness={1}/></mesh></group>))}
  </group>;
}

function Fallback() { return <div className="model-fallback"><img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/architecture-hero.jpg`} alt="Architectural concept with a steel frame, glazed facades and landscaped terraces"/><span>Interactive 3D is unavailable on this device. Architectural concept shown.</span></div>; }
class SceneBoundary extends Component<{children: ReactNode}, {failed: boolean}> { state = {failed: false}; static getDerivedStateFromError() { return {failed: true}; } render() {return this.state.failed ? <Fallback /> : this.props.children;} }

export default function SteelScene(props: SceneProps) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [inView, setInView] = useState(true);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => { const canvas = document.createElement('canvas'); const context = canvas.getContext('webgl2'); setAvailable(Boolean(context)); context?.getExtension('WEBGL_lose_context')?.loseContext(); const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting)); if (host.current) observer.observe(host.current); return () => observer.disconnect(); }, []);
  return <div ref={host} className="scene-canvas" aria-label="Interactive architectural concept with steel frame, glazed facades, interior furniture and landscaped terraces. Drag to rotate and scroll to zoom.">
    {available === false ? <Fallback /> : available === null ? <div className="scene-loading">ASSEMBLING THE DETAILS<span /></div> : <SceneBoundary><Canvas shadows dpr={[1, 1.5]} orthographic camera={{ position: [12, 9, 13], zoom: 48, near: .1, far: 100 }} frameloop={inView ? 'always' : 'never'} gl={{ antialias: true, alpha: true }}>
      <FitCamera exploded={props.exploded} resetKey={props.resetKey} /><ambientLight intensity={1.7} /><directionalLight position={[5, 14, 5]} intensity={3} castShadow shadow-mapSize={[1024, 1024]} /><directionalLight position={[-8, 4, -6]} intensity={1.3} />
      <group position={[0, -2.1, 0]}><Structure wireframe={props.wireframe} exploded={props.exploded} view={props.view} /><ContactShadows position={[0, -.92, 0]} opacity={.32} scale={24} blur={2.5} far={12} resolution={256} color="#565849" /><gridHelper args={[24, 24, '#d5d6d0', '#e4e4dd']} position={[0, -.94, 0]} /></group>
      <OrbitControls key={props.resetKey} makeDefault target={[0, props.exploded ? 1.9 : .6, 0]} enableZoom={true} minZoom={18} maxZoom={90} enablePan={false} autoRotate={props.rotating} autoRotateSpeed={.35} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.15} />
    </Canvas></SceneBoundary>}
  </div>;
}
