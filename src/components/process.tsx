'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import './process.css';

const JourneyScene = dynamic(() => import('./scroll-journey-scene'), { ssr: false, loading: () => <div className="pr-loading"><span/></div> });

const STEPS = [
  {
    label: 'Brief', you: 'You share the brief',
    title: <>Every structure <em>starts with a line.</em></>,
    body: 'Send the drawings, sketches or engineering you have. We read the intent and the requirements before a single member is placed.',
    output: 'Drawings → understanding',
  },
  {
    label: 'Model', you: 'We agree the scope',
    title: <>See the whole. <em>Resolve the details.</em></>,
    body: 'Deliverables agreed, we build a coordinated 3D model, so columns, beams and bracing meet on screen before they meet on site.',
    output: 'Tekla Structures · 3D model',
  },
  {
    label: 'Detail', you: 'We review it together',
    title: <>Big confidence. <em>In the smallest details.</em></>,
    body: 'Plates, bolts and member geometry are resolved with you, then drawn as clear, considered information for fabrication.',
    output: 'Connections · shop drawings',
  },
  {
    label: 'Deliver', you: 'You receive the package',
    title: <>From the model. <em>To the workshop.</em></>,
    body: 'One coordinated set of drawings and production data, ready for your fabricator or the next stage of the build.',
    output: 'NC · DXF · IFC',
  },
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Fourth fold: how a project runs, told on one pinned screen. Scrolling
 * drives the steel frame from linework to a bolted connection to a finished
 * package; the four client steps ride along in the rail. Short screens and
 * reduced motion get the same story on buttons, without the pin.
 */
export default function Process({ onExploreProject }: { onExploreProject: () => void }) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const rail = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState(false);
  const [active, setActive] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const short = matchMedia('(max-height: 600px)');
    const onPreference = () => {
      const isManual = motion.matches || short.matches;
      setManual(isManual);
      if (isManual) { progress.current = .125; setStep(0); }
    };
    onPreference();
    motion.addEventListener('change', onPreference);
    short.addEventListener('change', onPreference);
    const io = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting);
      if (entry.isIntersecting) { setEntered(true); entry.target.classList.add('is-in'); }
    }, { rootMargin: '200px 0px' });
    if (section.current) io.observe(section.current);
    return () => { motion.removeEventListener('change', onPreference); short.removeEventListener('change', onPreference); io.disconnect(); };
  }, []);

  useEffect(() => {
    if (manual) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = section.current;
      if (!el) return;
      const p = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - window.innerHeight)));
      progress.current = p;
      setStep(Math.min(3, Math.floor(p * 4)));
      rail.current?.querySelectorAll<HTMLElement>('[data-fill]').forEach((bar, i) => {
        bar.style.transform = `scaleX(${Math.max(0, Math.min(1, p * 4 - i)).toFixed(3)})`;
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, [manual]);

  function go(i: number) {
    if (manual) { progress.current = i * .25 + .125; setStep(i); return; }
    const el = section.current;
    if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + (el.offsetHeight - window.innerHeight) * (i * .25 + .1), behavior: 'smooth' });
  }

  const current = STEPS[step];

  return <section ref={section} className="pr" id="approach" data-tone="dark" data-manual={manual} aria-labelledby="pr-title">
    <div className="pr-pin">
      <div className="pr-glow" aria-hidden="true"/>
      <div className="pr-scene" aria-hidden="true">
        {entered && <JourneyScene progress={progress} active={active} reduced={manual} chapter={step}/>}
      </div>

      <header className="pr-head">
        <div>
          <p className="pr-eyebrow"><span>03</span>How we work</p>
          <h2 id="pr-title" className="pr-title">Drawings in. <em>Detail out.</em></h2>
        </div>
        <a className="pr-skip" href="#about">Skip <ArrowDown size={14}/></a>
      </header>

      <div className="pr-copy" key={step} aria-live="polite">
        <p className="pr-you"><span className="pr-num">{pad(step + 1)}</span>{current.you}</p>
        <h3>{current.title}</h3>
        <p className="pr-body">{current.body}</p>
        <p className="pr-output"><i/>{current.output}</p>
        {step === 3 && <button type="button" className="pr-link" onClick={onExploreProject}>See it on a real project<ArrowUpRight size={15}/></button>}
      </div>

      <footer className="pr-foot">
        <div className="pr-rail" ref={rail} role="group" aria-label="Process steps">
          {STEPS.map((item, i) => <button key={item.label} type="button" onClick={() => go(i)} aria-current={step === i}
            className={i < step ? 'is-done' : i === step ? 'is-active' : ''}>
            <span className="pr-rail-label"><b>{pad(i + 1)}</b>{item.label}</span>
            <span className="pr-rail-bar"><i data-fill style={manual ? { transform: `scaleX(${i <= step ? 1 : 0})` } : undefined}/></span>
          </button>)}
        </div>
        <p className="pr-note">{manual ? 'Select a step' : 'Scroll to build the frame'}<span>Architectural projects follow the same four steps · Representative model</span></p>
      </footer>
    </div>
  </section>;
}
