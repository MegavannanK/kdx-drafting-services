'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Component, type ReactNode, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Beam } from './steel-scene';

type Point = [number, number, number];
type Props = { phase: number; exploded: boolean; rotating: boolean; resetKey: number; active: boolean; reduced: boolean; interactive: boolean };
function Block({at,size,color,glass=false}:{at:Point;size:Point;color:string;glass?:boolean}) {
  return <mesh position={at} castShadow={!glass} receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} transparent={glass} opacity={glass?.38:1} depthWrite={!glass} roughness={glass?.15:.65} metalness={glass?.25:.1}/></mesh>;
}
function Member({a,b,width=.13,color='#9db1bb'}:{a:Point;b:Point;width?:number;color?:string}) {return <Beam start={a} end={b} width={width} depth={width*1.3} color={color} wireframe={false}/>;}
function Stair({side,finish}:{side:number;finish:boolean}) {
  const top=side*8.6, bottom=side*12.5;
  return <group>
    {[-.9,.9].map(z=><Member key={z} a={[top,2.7,z]} b={[bottom,.25,z]} width={.18}/>)}
    {Array.from({length:15},(_,i)=>{const t=(i+.5)/15,x=top+(bottom-top)*t,y=2.7-2.45*t;return <group key={i}><Block at={[x,y,0]} size={[.31,.09,1.8]} color={finish?'#c6b6a0':'#849faa'}/>{[-.94,.94].map(z=><Member key={z} a={[x,y,z]} b={[x,y+.95,z]} width={.035}/>)}</group>;})}
    {[-.94,.94].map(z=><Member key={z} a={[top,3.68,z]} b={[bottom,1.23,z]} width={.06}/>)}
    <Block at={[bottom,.08,0]} size={[2,.18,2.9]} color="#a6acaa"/>
  </group>;
}
function Walkway({phase,exploded,reduced}:Pick<Props,'phase'|'exploded'|'reduced'>) {
  const frame=useRef<THREE.Group>(null),finish=useRef<THREE.Group>(null),deck=useRef<THREE.Group>(null);
  const state=useRef({frame:phase>=1?1:0,finish:phase>=2?1:0,explode:0});
  useFrame((_,delta)=>{
    state.current.frame=reduced?(phase>=1?1:0):THREE.MathUtils.damp(state.current.frame,phase>=1?1:0,5,delta);
    state.current.finish=reduced?(phase>=2?1:0):THREE.MathUtils.damp(state.current.finish,phase>=2?1:0,5,delta);
    state.current.explode=reduced?(exploded?1:0):THREE.MathUtils.damp(state.current.explode,exploded?1:0,5,delta);
    if(frame.current){frame.current.scale.y=Math.max(.001,state.current.frame);frame.current.visible=state.current.frame>.005;frame.current.position.y=(1-state.current.frame)*3;}
    if(deck.current)deck.current.position.y=state.current.explode*.7;
    if(finish.current){finish.current.scale.y=Math.max(.001,state.current.finish);finish.current.position.y=(1-state.current.finish)*3+state.current.explode*2;finish.current.visible=state.current.finish>.005;}
  });
  const xs=Array.from({length:9},(_,i)=>-8+i*2);
  return <group position={[0,-1.7,0]}>
    <Block at={[0,-.14,0]} size={[29,.15,7]} color="#293f4c"/>
    {xs.flatMap((x,i)=>[-.95,.95].map(z=><group key={`${x}-${z}`}><mesh position={[x,.15,z]} castShadow receiveShadow><cylinderGeometry args={[.22,.22,.5,16]}/><meshStandardMaterial color="#a9b0ab" roughness={.9}/></mesh><Member a={[x,.35,z]} b={[x,2.7,z]} width={.16} color="#6c8f9f"/><Block at={[x,.4,z]} size={[.34,.07,.34]} color="#c7d0cd"/>{i%3===0&&i<8&&<Member a={[x,.4,z]} b={[x+2,2.7,z]} width={.065} color="#617f8d"/>}</group>))}
    <group ref={frame}>
      {[-.95,.95].map(z=><Member key={z} a={[-8.65,2.7,z]} b={[8.65,2.7,z]} width={.25} color="#7b9fae"/>)}
      {xs.map(x=><Member key={x} a={[x,2.7,-1]} b={[x,2.7,1]} width={.12}/>)}
      {xs.map(x=><group key={x}><Member a={[x,2.7,-.95]} b={[x,4.9,-.95]} width={.08}/><Member a={[x,2.7,.95]} b={[x,4.9,.95]} width={.08}/><Member a={[x,4.9,-1.1]} b={[x,4.9,1.1]} width={.08}/></group>)}
      {[-1.1,1.1].map(z=><Member key={z} a={[-8.65,4.9,z]} b={[8.65,4.9,z]} width={.12}/>)}
      <group ref={deck}>
        {Array.from({length:57},(_,i)=><Block key={i} at={[-8.4+i*.3,2.82,0]} size={[.285,.09,1.85]} color={phase===2?'#ad9273':'#667f8b'}/>)}
        {[-.98,.98].map(z=><group key={z}><Member a={[-8.6,3.8,z]} b={[8.6,3.8,z]} width={.045}/>{Array.from({length:65},(_,i)=><Member key={i} a={[-8.5+i*.265,2.8,z]} b={[-8.5+i*.265,3.8,z]} width={.018}/>)}</group>)}
        <Stair side={-1} finish={phase===2}/><Stair side={1} finish={phase===2}/>
      </group>
    </group>
    <group ref={finish}>
      <Block at={[0,5,0]} size={[17.8,.12,2.7]} color="#c6c5b7"/>
      {xs.slice(0,-1).map(x=><Block key={x} at={[x+1,3.9,-1.02]} size={[1.92,1.98,.035]} color="#8bafb8" glass/>)}
      {[-7.7,7.7].map(x=><group key={x}><Block at={[x,3.05,.25]} size={[.35,.48,.55]} color="#a0a294"/><mesh position={[x,3.45,.25]}><sphereGeometry args={[.34,10,10]}/><meshStandardMaterial color="#829879" roughness={1}/></mesh></group>)}
      <Block at={[0,4.89,0]} size={[17.2,.025,.06]} color="#e9d9ad"/>
    </group>
  </group>;
}
function Camera({resetKey,exploded}:Pick<Props,'resetKey'|'exploded'>) {
  const {camera,size}=useThree();
  const compact=size.width<500;
  useEffect(()=>{
    camera.position.set(...(compact?[24,18,14]:[16,11,19]) as Point);
    camera.lookAt(0,1,0);
  },[camera,resetKey,compact]);
  useEffect(()=>{
    if(camera instanceof THREE.OrthographicCamera){
      camera.zoom=Math.min(size.width/(compact?23:32),size.height/(compact?16:13),38)*(exploded?.85:1);
      camera.updateProjectionMatrix();
    }
  },[camera,size.width,size.height,exploded,resetKey,compact]);
  return null;
}
function Fallback(){return <div className="walkway-fallback"><img src={`${process.env.NEXT_PUBLIC_BASE_PATH||''}/images/projects/project-03.jpg`} alt="Original KDX covered walkway steel model"/><p>Original project image · Interactive 3D is unavailable on this device.</p></div>;}
class Boundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true};}render(){return this.state.failed?<Fallback/>:this.props.children;}}
export default function WalkwayScene(props:Props){const[available,setAvailable]=useState<boolean|null>(null);useEffect(()=>{const c=document.createElement('canvas').getContext('webgl2');setAvailable(Boolean(c));c?.getExtension('WEBGL_lose_context')?.loseContext();},[]);if(available===false)return <Fallback/>;if(available===null)return <div className="scene-loading">Preparing the project study…</div>;return <Boundary><Canvas orthographic shadows dpr={[1,1.5]} camera={{position:[16,11,19],zoom:26,near:.1,far:150}} frameloop={props.active?'always':'never'} gl={{alpha:true,antialias:true}}><Camera resetKey={props.resetKey} exploded={props.exploded}/><ambientLight intensity={1.8}/><directionalLight position={[4,12,8]} intensity={3} castShadow shadow-mapSize={[1024,1024]}/><directionalLight position={[-6,4,-3]} intensity={1.8} color="#93c9e7"/><Walkway phase={props.phase} exploded={props.exploded} reduced={props.reduced}/><ContactShadows position={[0,-1.94,0]} color="#07101a" opacity={.5} scale={40} blur={2} far={12}/><OrbitControls key={props.resetKey} makeDefault target={[0,props.exploded?1.6:.8,0]} enablePan={false} enableZoom={false} enableRotate={props.interactive} minZoom={10} maxZoom={65} autoRotate={props.rotating} autoRotateSpeed={.22} minPolarAngle={Math.PI/7} maxPolarAngle={Math.PI/2.1}/></Canvas></Boundary>;}
