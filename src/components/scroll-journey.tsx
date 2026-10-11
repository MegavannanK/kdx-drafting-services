'use client';

import dynamic from 'next/dynamic';
import { ArrowDown, ArrowUpRight, Check, MoveDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './scroll-journey.css';

const JourneyScene = dynamic(() => import('./scroll-journey-scene'), { ssr: false, loading: () => <div className="journey-loading">Preparing the structure<span /></div> });

export const chapters = [
  { label: 'Interpret', heading: <>Every structure<br />starts with a line.</>, body: 'Architectural intent. Engineering requirements. We bring the information together before the first member takes shape.', output: 'DRAWINGS → UNDERSTANDING', detail: '01 / DESIGN INTENT', title: 'From drawings to understanding' },
  { label: 'Coordinate', heading: <>See the whole.<br />Resolve the details.</>, body: 'A coordinated 3D model makes the relationships visible. Columns, beams, and bracing come together, before they meet on site.', output: 'TEKLA STRUCTURES / 3D MODEL', detail: '02 / COORDINATED STRUCTURE', title: 'Build the coordinated model' },
  { label: 'Detail', heading: <>Big confidence.<br />In the smallest details.</>, body: 'Zoom into the connection. Plates, bolts, and member geometry become clear, considered information for fabrication.', output: 'CONNECTIONS / SHOP DRAWINGS', detail: '03 / CONNECTION STUDY', title: 'Explore a bolted connection' },
  { label: 'Deliver', heading: <>From digital precision.<br />To physical possibility.</>, body: 'The model becomes a connected set of drawings and production data. One clear package for the next stage of your build.', output: 'NC DATA / DXF / IFC', detail: '04 / READY FOR FABRICATION', title: 'Prepare the fabrication package' },
];

export default function ScrollJourney() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const progressBar = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = () => setReduced(media.matches);
    onPreference(); media.addEventListener('change', onPreference);
    const observer = new IntersectionObserver(([entry]) => { setActive(entry.isIntersecting); if (entry.isIntersecting) setHasEntered(true); }, { rootMargin: '180px' });
    if (section.current) observer.observe(section.current);
    return () => { media.removeEventListener('change', onPreference); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const update = () => {
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      const next = Math.max(0, Math.min(1, -rect.top / Math.max(1, travel)));
      progress.current = next;
      setChapter(Math.min(3, Math.floor(next * 4)));
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${next})`;
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, [reduced]);

  const goToChapter = (index: number) => {
    if (reduced) { progress.current = index * .25 + .125; setChapter(index); return; }
    const el = section.current;
    if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + (el.offsetHeight - window.innerHeight) * (index * .25 + .08), behavior: 'smooth' });
  };

  return <section id="approach" className="scroll-journey" ref={section} data-reduced-motion={reduced} aria-label="How KDX turns drawings into fabrication details">
    <div className="journey-sticky">
      <div className="journey-top"><span className="eyebrow"><span className="orange-dot" /> THE MAKING OF A STRUCTURE</span><a href="#services">Skip the story <ArrowDown size={13} /></a></div>
      <div className="journey-atmosphere" aria-hidden="true" />
      <div className="journey-scene" aria-label={chapters[chapter].title}>
        {hasEntered && <JourneyScene progress={progress} active={active} reduced={reduced} chapter={chapter} />}
      </div>
      <div className="journey-copy" key={chapter}>
        <span className="journey-chapter-count">0{chapter + 1}<span>/ 04</span></span>
        <h2>{chapters[chapter].heading}</h2><p>{chapters[chapter].body}</p>
        <div className="journey-output">{chapter === 3 ? <Check size={13} /> : <span className="output-cross">+</span>}{chapters[chapter].output}</div>
        {chapter === 3 && <a className="journey-cta" href="#projects">Explore the real projects <ArrowUpRight size={15} /></a>}
      </div>
      <div className="journey-annotation"><span /><div>{chapters[chapter].detail}<small>{chapter === 2 ? 'BOLTED END-PLATE / ILLUSTRATIVE DETAIL' : 'STEEL DETAILING / PROCESS VISUALISATION'}</small></div></div>
      <div className="journey-bottom">
        <div className="journey-scroll-hint"><MoveDown size={17} /><span>{reduced ? 'SELECT A CHAPTER TO EXPLORE' : 'SCROLL TO FOLLOW THE PROCESS'}</span></div>
        <div className="journey-chapters" role="group" aria-label="Process chapters">{chapters.map((item, index) => <button key={item.label} aria-label={`Chapter ${index + 1}: ${item.label}`} aria-pressed={chapter === index} className={chapter === index ? 'current' : chapter > index ? 'completed' : ''} onClick={() => goToChapter(index)}><span>0{index + 1}</span>{item.label}<i /></button>)}</div>
        <div className="journey-progress"><div ref={progressBar} /></div>
        <span className="journey-disclaimer">REPRESENTATIVE MODEL · NOT FOR CONSTRUCTION</span>
      </div>
    </div>
  </section>;
}
