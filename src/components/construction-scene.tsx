'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import * as THREE from 'three';

type Point = [number, number, number];
type Props = { clock: RefObject<number>; progress: RefObject<HTMLDivElement | null>; running: boolean; reduced: boolean; revision: number; onReady: () => void; onFailure: () => void; onChapter: (chapter: number) => void; onComplete: () => void };
const DURATION = 28;
const COLORS = { steel: '#344750', wall: '#dbd6c8', stone: '#c0b8a6', wood: '#a5815c', roof: '#303b3e', glass: '#91b4bb' };
const ease = (time: number, start: number, duration: number) => THREE.MathUtils.smoothstep(time, start, start + duration);

function Solid({ at, size, color, glass = false, rotation, metalness = .08 }: { at: Point; size: Point; color: string; glass?: boolean; rotation?: Point; metalness?: number }) {
  return <mesh position={at} rotation={rotation} castShadow={!glass} receiveShadow>
    <boxGeometry args={size}/><meshStandardMaterial color={color} roughness={glass ? .14 : .68} envMapIntensity={.45} metalness={glass ? .45 : metalness} transparent={glass} opacity={glass ? .42 : 1} depthWrite={!glass}/>
  </mesh>;
}
function Steel({ a, b, width = .13, depth = .2 }: { a: Point; b: Point; width?: number; depth?: number }) {
  const transform = useMemo(() => {
    const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b), direction = to.clone().sub(from);
    return { position: from.add(to).multiplyScalar(.5), quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), direction.clone().normalize()), length: direction.length() };
  }, [a,b]);
  return <group position={transform.position} quaternion={transform.quaternion}>
    {[-1,1].map(side => <Solid key={side} at={[0,0,side*(depth/2-.018)]} size={[width,transform.length,.036]} color={COLORS.steel} metalness={.55}/>)}
    <Solid at={[0,0,0]} size={[.035,transform.length,depth]} color={COLORS.steel} metalness={.55}/>
  </group>;
}
// Every element has a deterministic reveal time, shared by playback and chapter seeking.
function Assemble({ clock, at = [0,0,0], start, duration = 1.4, lift = 0, children }: { clock: RefObject<number>; at?: Point; start: number; duration?: number; lift?: number; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const amount = ease(clock.current, start, duration);
    group.current.visible = amount > .001;
    group.current.scale.y = Math.max(.001, amount);
    group.current.position.y = at[1] + (1-amount)*lift;
  });
  return <group ref={group} position={at} visible={false}>{children}</group>;
}
function Plant({ at, scale = 1, tree = false }: { at: Point; scale?: number; tree?: boolean }) {
  return <group position={at} scale={scale}>
    {tree && <><mesh position={[0,1.2,0]} castShadow><cylinderGeometry args={[.055,.10,2.4,7]}/><meshStandardMaterial color="#7f7159" roughness={1}/></mesh><mesh position={[.14,1.9,.04]} rotation={[0,0,-.45]} castShadow><cylinderGeometry args={[.035,.05,1.1,6]}/><meshStandardMaterial color="#7f7159"/></mesh></>}
    {Array.from({length:tree?38:7},(_,i) => {
      const angle=i*2.4, radius=tree?.65:.20;
      return <mesh key={i} position={[Math.sin(angle)*radius,(tree?2.25:.25)+Math.sin(i*1.4)*(tree?.58:.09),Math.cos(angle)*radius]} scale={tree?[1,.65,.9]:[.65,1,.65]}><icosahedronGeometry args={[tree?.37:.22,1]}/><meshStandardMaterial color={['#667058','#52644a','#7f8969'][i%3]} roughness={1}/></mesh>;
    })}
  </group>;
}
function Gable({ x, z }: { x: number; z: number }) {
  const shape = useMemo(() => {
    const outline = new THREE.Shape();
    outline.moveTo(-2.25,0); outline.lineTo(2.25,0); outline.lineTo(0,1.05); outline.closePath();
    return outline;
  }, []);
  return <group position={[x,3.46,z]}>
    <mesh><shapeGeometry args={[shape]}/><meshStandardMaterial color={COLORS.glass} transparent opacity={.38} side={THREE.DoubleSide} metalness={.25} roughness={.25} depthWrite={false}/></mesh>
    <Solid at={[0,.5,0]} size={[.065,1.05,.065]} color={COLORS.steel}/>
  </group>;
}
function Furniture() {
  return <>
    <Solid at={[3.8,.36,1.6]} size={[2.5,.5,.86]} color="#d5c8b6"/><Solid at={[3.8,.73,1.94]} size={[2.5,.35,.18]} color="#c3b6a2"/>
    {[-1,1].map(side => <Solid key={side} at={[3.8+side*1.15,.61,1.6]} size={[.2,.5,.9]} color="#c3b6a2"/>)}
    <Solid at={[3.8,.12,.35]} size={[2.8,.025,1.7]} color="#b8b2a3"/><Solid at={[3.8,.37,.3]} size={[1.3,.12,.6]} color="#977452"/>
    <Solid at={[-3.8,.42,-.5]} size={[2.5,.65,1.7]} color="#d9cebc"/><Solid at={[-3.8,.8,-1.23]} size={[2.5,.9,.12]} color="#a78a68"/><Solid at={[-3.8,.78,-.9]} size={[1.9,.14,.45]} color="#eee7d9"/>
    <Solid at={[3.9,.95,-2.5]} size={[2.9,.12,.9]} color="#b2997b"/><Solid at={[3.9,.45,-2.5]} size={[2.5,.9,.75]} color="#b4a18a"/>
    <Solid at={[-3.7,.45,2.6]} size={[2.5,.85,.75]} color="#aa9271"/><Solid at={[-3.7,.91,2.6]} size={[2.6,.12,.85]} color="#ded8c9"/>
  </>;
}
function House({ clock }: { clock: RefObject<number> }) {
  const columns: Point[] = [-6,-1.5,1.5,6].flatMap(x => [-4,0,4].map(z => [x,0,z] as Point));
  const plan = useMemo(() => {
    const edges = [[-6,-4,6,-4],[6,-4,6,4],[6,4,1.5,4],[1.5,4,1.5,-1.5],[1.5,-1.5,-1.5,-1.5],[-1.5,-1.5,-1.5,4],[-1.5,4,-6,4],[-6,4,-6,-4]];
    const geometry = new THREE.BufferGeometry().setFromPoints(edges.flatMap(([x,z,a,b]) => [new THREE.Vector3(x,.035,z),new THREE.Vector3(a,.035,b)]));
    return geometry;
  }, []);
  useEffect(() => () => plan.dispose(), [plan]);
  return <group>
    <lineSegments geometry={plan}><lineBasicMaterial color="#7893a0" transparent opacity={.7}/></lineSegments>
    {columns.map(([x,,z],index) => <Assemble key={`foundation-${index}`} clock={clock} start={.2+index*.11}><Solid at={[x,.12,z]} size={[.7,.24,.7]} color="#aba99d"/></Assemble>)}
    <Assemble clock={clock} start={1.4} duration={2}>
      <Solid at={[-3.75,.22,0]} size={[5,.28,8.5]} color="#cec8ba"/><Solid at={[3.75,.22,0]} size={[5,.28,8.5]} color="#cec8ba"/><Solid at={[0,.22,-3]} size={[3,.28,2.5]} color="#cec8ba"/>
      <Solid at={[0,.14,1.3]} size={[3.2,.16,5.8]} color="#bdb6a5"/>
    </Assemble>
    {columns.map(([x,,z],index) => <Assemble key={`column-${index}`} clock={clock} at={[x,.36,z]} start={4.2+index*.12} duration={1.5}><Steel a={[0,0,0]} b={[0,3.1,0]}/><Solid at={[0,.035,0]} size={[.36,.07,.36]} color="#667780" metalness={.6}/></Assemble>)}
    {[-6,-1.5,1.5,6].map((x,index) => <Assemble key={`long-${x}`} clock={clock} at={[0,3.46,0]} start={6+index*.25} lift={.5}><Steel a={[x,0,-4]} b={[x,0,4]} width={.16} depth={.24}/></Assemble>)}
    {[-3.75,3.75].flatMap((x,wing) => [-4,-2,0,2,4].map((z,index) => <Assemble key={`gable-${x}-${z}`} clock={clock} at={[x,3.46,z]} start={7+index*.28+wing*.3} lift={.6}><Steel a={[-2.25,0,0]} b={[0,1.05,0]}/><Steel a={[0,1.05,0]} b={[2.25,0,0]}/><Steel a={[-2.25,0,0]} b={[2.25,0,0]} width={.11} depth={.17}/></Assemble>))}
    <Assemble clock={clock} start={9.4} at={[0,3.46,0]} lift={.3}><Steel a={[-6,0,-4]} b={[6,0,-4]}/><Steel a={[-1.5,0,-1.5]} b={[1.5,0,-1.5]}/>{[-3.75,3.75].map(x => <Steel key={x} a={[x,1.05,-4]} b={[x,1.05,4]}/>)}</Assemble>
    <Assemble clock={clock} start={11.6} at={[0,.36,0]} duration={2.3}>
      <Solid at={[-6,1.5,0]} size={[.18,3,8]} color={COLORS.wall}/><Solid at={[6,1.5,-1.6]} size={[.18,3,4.8]} color={COLORS.wall}/>
      <Solid at={[0,1.5,-4]} size={[12,3,.18]} color={COLORS.wall}/>{[-5.45,-2.05].map(x => <Solid key={x} at={[x,1.5,4]} size={[1.1,3,.18]} color={COLORS.stone}/>)}
      <Solid at={[-3.75,.3,4]} size={[2.3,.6,.18]} color={COLORS.stone}/><Solid at={[-3.75,2.65,4]} size={[2.3,.7,.18]} color={COLORS.stone}/>
      <Solid at={[-3.75,1.5,-1.4]} size={[4.5,3,.10]} color="#e4ddcd"/>
      {[-5.45,-2.05].flatMap(x => Array.from({length:18},(_,i) => <Solid key={`${x}-${i}`} at={[x,.1+i*.166,4.1]} size={[1.1,.012,.01]} color="#a99f8a"/>))}
      <Furniture/>
    </Assemble>
    <Assemble clock={clock} start={14} at={[0,.36,0]} duration={2}>
      {[-1.5,1.5].map(x => <group key={x}><Solid at={[x,1.5,1.3]} size={[.035,2.95,5.3]} color={COLORS.glass} glass/>{[-1.3,0,1.35,2.7,4].map(z => <Solid key={z} at={[x,1.5,z]} size={[.065,3,.065]} color={COLORS.steel}/>)}</group>)}
      <Solid at={[-3.75,1.45,4.02]} size={[2.3,1.7,.045]} color={COLORS.glass} glass/>
      {[-4.9,-3.75,-2.6].map(x => <Solid key={x} at={[x,1.45,4.06]} size={[.065,1.7,.065]} color={COLORS.steel}/>)}
      {[.6,2.3].map(y => <Solid key={y} at={[-3.75,y,4.06]} size={[2.35,.065,.065]} color={COLORS.steel}/>)}
      <Solid at={[3.75,1.5,4]} size={[4.5,2.95,.045]} color={COLORS.glass} glass/>
      {[1.5,3,4.5,6].map(x => <Solid key={x} at={[x,1.5,4.02]} size={[.065,3,.065]} color={COLORS.steel}/>)}
      <Solid at={[6,1.5,2.4]} size={[.035,2.95,3.15]} color={COLORS.glass} glass/>
      {[.8,2.4,4].map(z => <Solid key={z} at={[6,1.5,z]} size={[.065,3,.065]} color={COLORS.steel}/>)}
      {[.06,2.98].flatMap(y => [-1.5,1.5].map(x => <Solid key={`${x}-${y}`} at={[x,y,1.3]} size={[.07,.07,5.4]} color={COLORS.steel}/>))}
      {[.06,2.98].map(y => <Solid key={y} at={[3.75,y,4.02]} size={[4.5,.07,.07]} color={COLORS.steel}/>)}
      <Solid at={[0,1.5,-1.5]} size={[2.95,3,.045]} color={COLORS.glass} glass/>
      {Array.from({length:24},(_,i) => <Solid key={`slat-${i}`} at={[-6.11,1.5,-3.7+i*.18]} size={[.14,3,.10]} color={i%3===0?'#8e7357':COLORS.wood}/>)}
    </Assemble>
    <Assemble clock={clock} start={16} duration={1.5}>{[-3.75,3.75].flatMap(x => [-4,4].map(z => <Gable key={`${x}-${z}`} x={x} z={z}/>))}</Assemble>
    {[-3.75,3.75].flatMap((x,wing) => [-1,1].map(side => <Assemble key={`roof-${x}-${side}`} clock={clock} at={[x,3.46,0]} start={17.2+wing*.8+(side+1)*.2} duration={2.2} lift={1.2}>
      <group position={[side*1.22,.52,0]} rotation={[0,0,-side*Math.atan(1.05/2.25)]}>
        <Solid at={[0,-.075,0]} size={[2.65,.045,8.7]} color="#9c835f"/>
        <Solid at={[0,0,0]} size={[2.7,.12,8.8]} color={COLORS.roof} metalness={.4}/>
        {Array.from({length:30},(_,i) => <Solid key={i} at={[0,.075,-4.3+i*.297]} size={[2.7,.035,.025]} color="#66706d" metalness={.4}/>)}
      </group>
      <Solid at={[0,1.1,0]} size={[.16,.08,8.9]} color="#3b4648" metalness={.4}/>
    </Assemble>))}
    <Assemble clock={clock} at={[0,3.52,-2.9]} start={18.8} lift={.6}><Solid at={[0,0,0]} size={[3.2,.16,2.5]} color={COLORS.roof}/></Assemble>
    <Assemble clock={clock} start={20.5} duration={2}>
      {Array.from({length:23},(_,i) => <Solid key={i} at={[0,.25,-1.4+i*.25]} size={[2.9,.08,.23]} color={i%3===0?'#b39b78':'#aa916c'}/>)}
      <Solid at={[0,.10,4.65]} size={[3.4,.2,.7]} color="#cac4b5"/><Solid at={[0,.04,5.25]} size={[3.7,.08,.6]} color="#d4cebe"/>
      {[-1,1].map(x => <Solid key={x} at={[x*.8,.28,2.5]} size={[.55,.35,.65]} color="#c3b49e"/>)}
      <mesh position={[0,.5,2.2]} castShadow><cylinderGeometry args={[.55,.55,.1,32]}/><meshStandardMaterial color="#8f7656" roughness={.6}/></mesh>
      <mesh position={[0,.25,2.2]}><cylinderGeometry args={[.06,.08,.5,12]}/><meshStandardMaterial color={COLORS.steel}/></mesh>
      <mesh position={[0,.52,-.1]} castShadow><cylinderGeometry args={[.55,.45,.7,24]}/><meshStandardMaterial color="#b4aa94" roughness={1}/></mesh><Plant at={[0,.85,-.1]} tree scale={.85}/>
    </Assemble>
    <Assemble clock={clock} start={22} duration={2.2}>
      {[-7.2,7.2].flatMap(x => [-3,3.2].map(z => <Plant key={`${x}-${z}`} at={[x,0,z]} tree scale={.9}/>))}
      {Array.from({length:15},(_,i) => <Plant key={i} at={[-6.6+i*.94,0,5.7]} scale={.8+(i%3)*.18}/>)}
      {[-7,7].flatMap(x => [-2,0,2].map(z => <Plant key={`${x}-${z}`} at={[x,0,z]} scale={1.1}/>))}
      {Array.from({length:5},(_,i) => <Solid key={i} at={[0,.02,6.2+i*.65]} size={[1.4,.07,.48]} color="#c4bcab"/>)}
    </Assemble>
  </group>;
}

function Film(props: Props) {
  const { camera, size, invalidate } = useThree();
  const chapter = useRef(-1);
  const firstFrame = useRef(true);
  const completed = useRef(false);
  useEffect(() => { invalidate(); completed.current=false; }, [props.revision,props.running,invalidate]);
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      const compact = size.width < 600;
      camera.zoom = Math.min(size.width / (compact ? 20 : 21), size.height / 16.5);
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height]);
  useFrame((_, delta) => {
    if (props.running && !completed.current) props.clock.current = Math.min(DURATION,props.clock.current + Math.min(delta,.05));
    const time = props.clock.current;
    const nextChapter = time < 5 ? 0 : time < 12 ? 1 : time < 21 ? 2 : 3;
    if (nextChapter !== chapter.current) {chapter.current=nextChapter;props.onChapter(nextChapter);}
    if (props.progress.current) props.progress.current.style.transform=`scaleX(${time/DURATION})`;
    if(firstFrame.current){firstFrame.current=false;props.onReady();}
    if(time>=DURATION && props.running && !completed.current){completed.current=true;props.onComplete();}
  });
  return <>
    <color attach="background" args={['#e9e6dc']}/>
    <ambientLight intensity={.35}/><hemisphereLight args={['#f7f3e6','#929587',.8]}/>
    <directionalLight position={[-8,14,6]} intensity={2.5} color="#fff0d3" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-bias={-.0005} shadow-normalBias={.035}/>
    <directionalLight position={[8,7,-6]} intensity={.65} color="#c8e0ed"/>
    <Environment frames={1} resolution={128}><Lightformer intensity={2} color="#fff6e5" position={[0,10,0]} rotation={[Math.PI/2,0,0]} scale={[15,15,1]}/><Lightformer intensity={1} color="#c8dce4" position={[10,3,0]} rotation={[0,-Math.PI/2,0]} scale={[10,6,1]}/></Environment>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.11,0]} receiveShadow><planeGeometry args={[200,200]}/><shadowMaterial color="#606554" transparent opacity={.19}/></mesh>
    <House clock={props.clock}/>
    <OrbitControls makeDefault target={[0,1.05,.2]} enablePan={false} enableZoom={false} enableRotate minAzimuthAngle={-Math.PI} maxAzimuthAngle={Math.PI} minPolarAngle={Math.PI/8} maxPolarAngle={Math.PI/2.05}/>
  </>;
}
class FilmBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure();}
  render(){return this.state.failed?null:this.props.children;}
}
export default function ConstructionScene(props: Props) {
  const [supported,setSupported]=useState(false);
  useEffect(()=>{
    const canvas=document.createElement('canvas');
    const context=canvas.getContext('webgl2');
    if(context){setSupported(true);context.getExtension('WEBGL_lose_context')?.loseContext();}else props.onFailure();
    // Capability is checked once; callbacks are notifications to the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  if(!supported)return null;
  return <FilmBoundary onFailure={props.onFailure}><Canvas orthographic shadows dpr={[1,1.25]} camera={{position:[15,20,20],zoom:35,near:.1,far:300}} gl={{alpha:false,antialias:true,powerPreference:'high-performance'}} frameloop={props.running?'always':'demand'} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1;}}><Film {...props}/></Canvas></FilmBoundary>;
}

