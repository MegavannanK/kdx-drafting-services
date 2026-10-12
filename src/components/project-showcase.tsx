'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Layers3, Pause, Play, RotateCcw } from 'lucide-react';
import './project-showcase.css';
const WalkwayScene=dynamic(()=>import('./walkway-scene'),{ssr:false,loading:()=> <div className="scene-loading">Preparing the project study…</div>});
const basePath=process.env.NEXT_PUBLIC_BASE_PATH||'';
const studies=[
  {name:'Layers of a building',detail:'Primary framing, floor systems and connections.'},
  {name:'A frame in balance',detail:'Columns, beams and foundation coordination.'},
  {name:'Connecting places',detail:'A covered walkway with raised decking and stairs.'},
  {name:'A change in direction',detail:'Walkway framing, balustrades and supporting columns.'},
  {name:'The roofscape',detail:'Roof members coordinated across a complex footprint.'},
  {name:'The rhythm of a structure',detail:'Floor joists and primary member coordination.'},
  {name:'Strength in the detail',detail:'A cantilevered platform and its supporting connections.'},
];
const chapters=[
  {label:'Structure',title:<>Start with<br/><em>solid foundations.</em></>,body:'Follow the column rhythm and bracing that support the elevated walkway.'},
  {label:'Connect',title:<>A structure becomes<br/><em>a place to move.</em></>,body:'Decking, stairs and balustrades connect the two landings into one continuous route.'},
  {label:'Experience',title:<>The complete<br/><em>architectural experience.</em></>,body:'A canopy, timber-toned deck and glazed wind screens explore how the steel structure could become a finished space.'},
];
export default function ProjectShowcase(){
  const section=useRef<HTMLElement>(null),bar=useRef<HTMLDivElement>(null);
  const [phase,setPhase]=useState(0),[reduced,setReduced]=useState(false),[active,setActive]=useState(false),[entered,setEntered]=useState(false);
  const [exploded,setExploded]=useState(false),[rotating,setRotating]=useState(false),[resetKey,setResetKey]=useState(0),[study,setStudy]=useState(2);
  useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{setReduced(mq.matches);if(mq.matches)setRotating(false);};change();mq.addEventListener('change',change);const observer=new IntersectionObserver(([e])=>{setActive(e.isIntersecting);if(e.isIntersecting)setEntered(true);},{rootMargin:'150px'});if(section.current)observer.observe(section.current);return()=>{mq.removeEventListener('change',change);observer.disconnect();};},[]);
  useEffect(()=>{if(reduced)return;let raf=0;const update=()=>{raf=0;const el=section.current;if(!el)return;const p=Math.max(0,Math.min(1,-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-window.innerHeight)));setPhase(Math.min(2,Math.floor(p*3)));if(bar.current)bar.current.style.transform=`scaleX(${p})`;};const scroll=()=>{if(!raf)raf=requestAnimationFrame(update);};update();window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);return()=>{window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);cancelAnimationFrame(raf);};},[reduced]);
  function choosePhase(i:number){if(reduced){setPhase(i);return;}const el=section.current;if(el)window.scrollTo({top:window.scrollY+el.getBoundingClientRect().top+(el.offsetHeight-window.innerHeight)*(i/3+.1),behavior:'smooth'});}
  return <>
    <section ref={section} className="project-story" data-reduced-motion={reduced} aria-label="Covered walkway project reconstruction">
      <div className="project-story-sticky"><div className="project-story-top"><span>FEATURED STUDY / COVERED WALKWAY</span><a href="#work-gallery">Browse the gallery <ArrowDown size={13}/></a></div><div className="project-story-layout"><div className="project-story-copy"><span className="eyebrow">0{phase+1} / 03 · {chapters[phase].label.toUpperCase()}</span><h3>{chapters[phase].title}</h3><p>{chapters[phase].body}</p><div className="project-source"><img src={`${basePath}/images/projects/project-03.jpg`} alt="Original KDX covered walkway project image used as the reconstruction reference" loading="lazy"/><span>THE ORIGINAL STEEL STUDY<small>KDX PROJECT ARCHIVE / 03</small></span></div></div><div className="walkway-visual" aria-label="Interactive covered walkway reconstruction">{entered&&<WalkwayScene phase={phase} exploded={exploded} rotating={rotating} resetKey={resetKey} active={active}/>}<div className="walkway-controls"><button onClick={()=>setExploded(!exploded)} aria-pressed={exploded}><Layers3 size={14}/>{exploded?'Assemble walkway':'Separate layers'}</button><div><button onClick={()=>setRotating(!rotating)} aria-label={rotating?'Pause walkway rotation':'Rotate walkway'}>{rotating?<Pause size={14}/>:<Play size={14}/>}</button><button onClick={()=>{setResetKey(x=>x+1);setExploded(false);}} aria-label="Reset walkway view"><RotateCcw size={14}/></button></div></div><span className="walkway-hint">DRAG TO EXPLORE · SCROLL TO ZOOM</span></div></div><div className="project-story-bottom"><span>{reduced?'SELECT A STAGE':'SCROLL TO SEE THE DESIGN TAKE SHAPE'}</span><div role="group" aria-label="Walkway design stages">{chapters.map((c,i)=><button key={c.label} onClick={()=>choosePhase(i)} aria-pressed={phase===i} className={phase===i?'active':''}><small>0{i+1}</small>{c.label}</button>)}</div><p>VISUAL RECONSTRUCTION FROM ARCHIVE IMAGE · ARCHITECTURAL FINISHES ARE A DESIGN EXPLORATION</p><div className="project-story-progress"><div ref={bar}/></div></div></div>
    </section>
    <div className="work-gallery" id="work-gallery"><div className="gallery-heading"><div><span className="eyebrow">FROM OUR PROJECT ARCHIVE</span><h3>The work.<br/><em>In its own detail.</em></h3></div><p>Seven original KDX model studies.<br/>Choose a view to discover the work up close.</p></div><figure className="gallery-stage"><img key={study} src={`${basePath}/images/projects/project-0${study+1}.jpg`} alt={`Original KDX project study ${study+1}: ${studies[study].name}`}/><figcaption><div><span>STUDY 0{study+1} / 07</span><h4>{studies[study].name}</h4><p>{studies[study].detail}</p></div><div className="gallery-arrows"><button aria-label="Previous project study" onClick={()=>setStudy((study+6)%7)}><ArrowLeft size={18}/></button><button aria-label="Next project study" onClick={()=>setStudy((study+1)%7)}><ArrowRight size={18}/></button></div></figcaption></figure><div className="gallery-thumbnails" role="group" aria-label="Choose a project study">{studies.map((s,i)=><button key={s.name} aria-label={`View study ${i+1}: ${s.name}`} aria-pressed={study===i} className={study===i?'active':''} onClick={()=>setStudy(i)}><img src={`${basePath}/images/projects/project-0${i+1}.jpg`} alt="" loading="lazy"/><span>0{i+1}</span></button>)}</div></div>
  </>;
}
