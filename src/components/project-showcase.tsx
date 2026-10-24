'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Hand, Layers3, Pause, Play, RotateCcw } from 'lucide-react';
import './project-showcase.css';

const WalkwayScene = dynamic(() => import('./walkway-scene'), {
  ssr: false,
  loading: () => <div className="scene-loading">Preparing the walkway study…</div>,
});
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const chapters = [
  { label: 'Structure', title: <>A strong start.<br/><span>Every step supported.</span></>, body: 'Columns, footings and bracing establish the rhythm of an elevated walkway.' },
  { label: 'Connect', title: <>From one place.<br/><span>To the next.</span></>, body: 'Stairs, landings and balustrades join the frame into a continuous route. Scroll to see each layer come together.' },
  { label: 'Experience', title: <>The frame becomes<br/><span>an everyday place.</span></>, body: 'A canopy, warm decking and glazed screens explore a possible architectural finish for the steel structure.' },
];

export default function ProjectShowcase() {
  const section = useRef<HTMLElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [manual, setManual] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(false);
  const [entered, setEntered] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const shortScreen = matchMedia('(max-height: 600px)');
    const updatePreference = () => {
      setReduced(motion.matches);
      setManual(motion.matches || shortScreen.matches);
      if (motion.matches) setRotating(false);
    };
    updatePreference();
    motion.addEventListener('change', updatePreference);
    shortScreen.addEventListener('change', updatePreference);
    const observer = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting);
      if (entry.isIntersecting) setEntered(true);
    }, { rootMargin: '150px' });
    if (section.current) observer.observe(section.current);
    return () => {
      motion.removeEventListener('change', updatePreference);
      shortScreen.removeEventListener('change', updatePreference);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (manual) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = section.current;
      if (!el) return;
      const progress = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - window.innerHeight)));
      setPhase(Math.min(2, Math.floor(progress * 3)));
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${progress})`;
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    return () => {
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', scroll);
      cancelAnimationFrame(frame);
    };
  }, [manual]);

  function choosePhase(index: number) {
    if (manual) { setPhase(index); return; }
    const el = section.current;
    if (el) window.scrollTo({
      top: window.scrollY + el.getBoundingClientRect().top + (el.offsetHeight - window.innerHeight) * (index / 3 + .12),
      behavior: 'smooth',
    });
  }

  return <section ref={section} className="project-story" data-manual={manual} aria-label="Scroll-driven stair and walkway study">
    <div className="project-story-sticky">
      <div className="project-story-top"><span>STUDY 01 / STAIRS & WALKWAY</span><a href="#about">Skip the story <ArrowDown size={14}/></a></div>
      <div className="project-story-layout">
        <div className="project-story-copy"><span className="eyebrow">0{phase + 1} / 03 · {chapters[phase].label.toUpperCase()}</span><h3>{chapters[phase].title}</h3><p>{chapters[phase].body}</p><div className="project-source"><img src={`${base}/images/projects/project-03.jpg`} alt="Original KDX archive image of the steel walkway and stairs used for this visual reconstruction" loading="lazy"/><span>FROM OUR PROJECT ARCHIVE<small>ORIGINAL STEEL MODEL / 03</small></span></div></div>
        <div className="walkway-visual">
          <div className="walkway-canvas" data-interactive={interactive} aria-label="Interactive walkway model">{entered && <WalkwayScene phase={phase} exploded={exploded} rotating={rotating} resetKey={resetKey} active={active} reduced={reduced} interactive={interactive}/>}</div>
          <div className="walkway-controls"><div><button onClick={() => setExploded(!exploded)} aria-pressed={exploded}><Layers3 size={15}/>{exploded ? 'Assemble layers' : 'Separate layers'}</button><button onClick={() => setInteractive(!interactive)} aria-pressed={interactive}><Hand size={15}/>{interactive ? 'Finish exploring' : 'Drag to explore'}</button></div><div><button onClick={() => setRotating(!rotating)} aria-label={rotating ? 'Pause walkway rotation' : 'Rotate walkway'} aria-pressed={rotating}>{rotating ? <Pause size={16}/> : <Play size={16}/>}</button><button onClick={() => {setResetKey(key => key + 1); setExploded(false); setRotating(false); setInteractive(false);}} aria-label="Reset walkway view"><RotateCcw size={16}/></button></div></div>
          <span className="walkway-hint">{interactive ? 'DRAG THE MODEL TO ROTATE' : 'SCROLL TO REVEAL · SELECT A STAGE TO JUMP AHEAD'}</span>
        </div>
      </div>
      <div className="project-story-bottom"><div className="walkway-stages" role="group" aria-label="Walkway design stages">{chapters.map((chapter,index) => <button key={chapter.label} onClick={() => choosePhase(index)} aria-pressed={phase === index}><small>0{index+1}</small>{chapter.label}<i/></button>)}</div><div className="project-story-progress"><div ref={progressBar}/></div><div className="walkway-footnote"><span>{manual ? 'SELECT A STAGE TO EXPLORE' : 'SCROLL TO SEE THE DESIGN TAKE SHAPE'}</span><p>Visual reconstruction from an archive image. Architectural finishes are an illustrative design exploration.</p></div></div>
    </div>
  </section>;
}
