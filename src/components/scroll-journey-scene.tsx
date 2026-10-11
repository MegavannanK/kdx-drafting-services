'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { Component, type ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Beam } from './steel-scene';

type Point = [number, number, number];
type Member = { start: Point; end: Point; color: string; width?: number; depth?: number };
type Props = { progress: RefObject<number>; active: boolean; reduced: boolean; chapter: number };
const smooth = (value: number, start: number, end: number) => THREE.MathUtils.smoothstep(value, start, end);

function buildFrame(z: number): Member[] {
  return [
    {start:[-2.6,0,z],end:[-2.6,3.1,z],color:'#bbc7bd',width:.2,depth:.26},
    {start:[2.6,0,z],end:[2.6,3.1,z],color:'#bbc7bd',width:.2,depth:.26},
    {start:[-2.6,3.1,z],end:[0,4.15,z],color:'#e47941',width:.19,depth:.27},
    {start:[0,4.15,z],end:[2.6,3.1,z],color:'#e47941',width:.19,depth:.27},
  ];
}

function Connection({ progress, reduced }: Pick<Props,'progress'|'reduced'>) {
  const movingBeam = useRef<THREE.Group>(null);
  const bolts = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const t = smooth(progress.current, .54, .72);
    const offset = 1.2 * (1 - t);
    if (movingBeam.current) movingBeam.current.position.x = reduced ? offset : THREE.MathUtils.damp(movingBeam.current.position.x, offset, 7, delta);
    if (bolts.current) bolts.current.position.x = reduced ? offset * 1.5 : THREE.MathUtils.damp(bolts.current.position.x, offset * 1.5, 7, delta);
  });
  return <group rotation={[0, -.25, 0]}>
    <Beam start={[-1.25,-2.2,0]} end={[-1.25,2.4,0]} width={1} depth={1.15} color="#a9bbb1" wireframe={false} />
    <group ref={movingBeam}>
      <Beam start={[-.73,.05,0]} end={[2.9,.05,0]} width={.7} depth={1} color="#e87538" wireframe={false} />
      <mesh castShadow position={[-.71,.05,0]}><boxGeometry args={[.15,1.5,1.2]} /><meshStandardMaterial color="#849d91" metalness={.7} roughness={.35} /></mesh>
    </group>
    <group ref={bolts}>{[-.48,0,.48].flatMap(y => [-.4,.4].map(z => <group key={`${y}-${z}`} position={[-.55,y+.05,z]} rotation={[0,0,Math.PI/2]}>
      <mesh castShadow><cylinderGeometry args={[.07,.07,.5,12]} /><meshStandardMaterial color="#d0d6d1" metalness={.75} roughness={.28} /></mesh>
      <mesh castShadow position={[0,-.3,0]}><cylinderGeometry args={[.14,.14,.11,6]} /><meshStandardMaterial color="#dbe2d9" metalness={.65} roughness={.3} /></mesh>
      <mesh position={[0,-.22,0]}><cylinderGeometry args={[.16,.16,.035,24]} /><meshStandardMaterial color="#8b9f94" metalness={.7} roughness={.3} /></mesh>
    </group>))}</group>
  </group>;
}

function AnimatedStructure({ progress, reduced }: Pick<Props,'progress'|'reduced'>) {
  const building = useRef<THREE.Group>(null);
  const blueprint = useRef<THREE.Group>(null);
  const frames = useRef<(THREE.Group|null)[]>([]);
  const secondary = useRef<THREE.Group>(null);
  const connection = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const state = useRef({ p: 0 });
  const model = useMemo(() => {
    const zs = [-4,-2,0,2,4];
    const primary = zs.map(buildFrame);
    const extras: Member[] = [];
    for (const x of [-2.6,2.6]) for (const y of [1,2.1,3.1]) extras.push({start:[x,y,-4],end:[x,y,4],color:'#6d8b7b',width:.08,depth:.12});
    for (const x of [-1.95,-1.3,-.65,0,.65,1.3,1.95]) { const y=4.15-Math.abs(x)/2.6*1.05; extras.push({start:[x,y,-4],end:[x,y,4],color:'#b9c5b8',width:.07,depth:.11}); }
    for (const x of [-2.6,2.6]) { extras.push({start:[x,0,-4],end:[x,3.1,-2],color:'#779a88',width:.06,depth:.06}); extras.push({start:[x,3.1,-4],end:[x,0,-2],color:'#779a88',width:.06,depth:.06}); }
    const points = [...primary.flat(),...extras].flatMap(m => [...m.start,...m.end]);
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
    return { primary, extras, geometry, zs };
  }, []);
  useEffect(() => () => model.geometry.dispose(), [model]);
  useFrame((_, delta) => {
    state.current.p = reduced ? progress.current : THREE.MathUtils.damp(state.current.p, progress.current, 7, delta);
    const p = state.current.p;
    const focusDetail = smooth(p,.45,.52) * (1-smooth(p,.74,.82));
    if (building.current) { building.current.position.set(-focusDetail * 13,-2.15,0); building.current.scale.setScalar(1-focusDetail*.28); building.current.visible=focusDetail<.999; }
    if (connection.current) { connection.current.position.set((1-focusDetail)*13,0,0); connection.current.visible=focusDetail>.001; connection.current.scale.setScalar(.95+focusDetail*.08); }
    if (blueprint.current) { blueprint.current.scale.y=.02+smooth(p,.06,.23)*.98; blueprint.current.visible=p<.47; }
    frames.current.forEach((frame,i) => { if (!frame) return; const growth=smooth(p,.16+i*.028,.29+i*.028); frame.position.y=(1-growth)*(3+i*.45); frame.scale.y=Math.max(.001,growth); frame.visible=growth>.005; });
    if (secondary.current) { const growth=smooth(p,.31,.44); secondary.current.scale.setScalar(Math.max(.001,growth)); secondary.current.visible=growth>.005; }
    const angle=.7+p*.48;
    const topDown=1-smooth(p,0,.23);
    camera.position.set(Math.sin(angle)*14,8+topDown*12,Math.cos(angle)*14);
    camera.lookAt(0,0,0);
    if (camera instanceof THREE.OrthographicCamera) { camera.zoom=Math.min(size.width/13.5,size.height/11.2,65)*(1+focusDetail*.26); camera.updateProjectionMatrix(); }
  });
  return <>
    <group ref={building} position={[0,-2.15,0]}>
      <group ref={blueprint}><lineSegments geometry={model.geometry}><lineBasicMaterial color="#94c7b1" transparent opacity={.72} /></lineSegments></group>
      {model.primary.map((members,i) => <group key={i} ref={el => { frames.current[i]=el; }}>{members.map((m,j) => <Beam key={j} {...m} wireframe={false} />)}{[-2.6,2.6].map(x => <mesh key={x} position={[x,-.08,model.zs[i]]} receiveShadow><boxGeometry args={[.5,.16,.5]} /><meshStandardMaterial color="#527465" roughness={.8} /></mesh>)}</group>)}
      <group ref={secondary}>{model.extras.map((m,i) => <Beam key={i} {...m} wireframe={false} />)}</group>
    </group>
    <group ref={connection} visible={false}><Connection progress={progress} reduced={reduced} /></group>
    <gridHelper args={[24,24,'#466253','#293f34']} position={[0,-2.3,0]} />
    <ContactShadows position={[0,-2.29,0]} opacity={.4} scale={23} blur={2.4} far={10} color="#020d08" resolution={256} />
  </>;
}

function StaticStudy({ chapter }: {chapter:number}) {
  return <div className="journey-fallback"><svg viewBox="0 0 560 360" role="img" aria-label="Structural steel frame illustration"><g fill="none" stroke={chapter===2?'#e87538':'#86b098'} strokeWidth="1.6">{[0,1,2,3,4].map(i => <path key={i} transform={`translate(${i*54},${-i*18})`} d="M80 290V165L190 90l100 36v125M80 165l110-75 100 36M80 290l210-39M190 90v120" />)}<path d="M80 290l216-72M80 165l216-72M190 90l216-72M290 126l216-72M290 251l216-72" /></g></svg></div>;
}
class JourneyBoundary extends Component<{children:ReactNode;chapter:number},{failed:boolean}> { state={failed:false}; static getDerivedStateFromError(){return {failed:true};} render(){return this.state.failed?<StaticStudy chapter={this.props.chapter}/>:this.props.children;} }

export default function JourneyScene(props:Props) {
  const [available,setAvailable]=useState<boolean|null>(null);
  useEffect(() => { const canvas=document.createElement('canvas'); const context=canvas.getContext('webgl2'); setAvailable(Boolean(context)); context?.getExtension('WEBGL_lose_context')?.loseContext(); },[]);
  if(available===false)return <StaticStudy chapter={props.chapter}/>;
  if(available===null)return <div className="journey-loading">Preparing the structure<span/></div>;
  return <JourneyBoundary chapter={props.chapter}><Canvas orthographic shadows dpr={[1,1.5]} camera={{position:[10,12,14],zoom:50,near:.1,far:100}} gl={{alpha:true,antialias:true}} frameloop={props.active?'always':'never'}>
    <ambientLight intensity={1.9}/><directionalLight position={[2,10,7]} intensity={3.5} castShadow shadow-mapSize={[1024,1024]}/><directionalLight position={[-6,3,-5]} color="#98cbb4" intensity={1.7}/><pointLight position={[5,4,3]} color="#ffaa64" intensity={12}/>
    <AnimatedStructure progress={props.progress} reduced={props.reduced}/>
  </Canvas></JourneyBoundary>;
}
