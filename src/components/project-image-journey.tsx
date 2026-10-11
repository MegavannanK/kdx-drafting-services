'use client';

import { ArrowDown, ArrowUpRight, MoveDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './scroll-journey.css';
import './project-image-journey.css';

// Images appear in the same order as the original KDX Projects section.
const images = Array.from({ length: 7 }, (_, index) => ({
  src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/projects/project-0${index + 1}.jpg`,
  label: `Project study ${String(index + 1).padStart(2, '0')}`,
}));

export default function ProjectImageJourney() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const progressBar = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!section.current || !stage.current) return;
      const travel = section.current.offsetHeight - stage.current.offsetHeight;
      const progress = Math.max(0, Math.min(1, -section.current.getBoundingClientRect().top / Math.max(1, travel)));
      const position = reduced ? current : Math.min(images.length - 0.001, progress * images.length);
      if (!reduced) setCurrent(Math.min(images.length - 1, Math.floor(position)));
      panels.current.forEach((panel, index) => {
        if (!panel) return;
        const incoming = Math.max(0, Math.min(1, (position - index + 0.25) / 0.25));
        const outgoing = index === images.length - 1 ? 1 : Math.max(0, Math.min(1, (index + 1 - position) / 0.25));
        const opacity = reduced ? Number(index === current) : incoming * outgoing;
        panel.style.opacity = String(opacity);
        panel.style.visibility = opacity > 0 ? 'visible' : 'hidden';
        panel.style.transform = reduced ? 'none' : `translateY(${(1 - incoming) * 32 - (1 - outgoing) * 20}px) scale(${1.025 - Math.max(0, Math.min(1, position - index)) * 0.025})`;
      });
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${reduced ? (current + 1) / images.length : progress})`;
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    const resize = new ResizeObserver(requestUpdate);
    if (stage.current) resize.observe(stage.current);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      resize.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduced, current]);

  function goToImage(index: number) {
    if (reduced) { setCurrent(index); return; }
    if (!section.current || !stage.current) return;
    const top = window.scrollY + section.current.getBoundingClientRect().top;
    const travel = section.current.offsetHeight - stage.current.offsetHeight;
    window.scrollTo({ top: top + travel * ((index + 0.3) / images.length), behavior: 'smooth' });
  }

  return <section className="scroll-journey project-image-journey" ref={section} data-reduced-motion={reduced} aria-label="Scroll through KDX project images">
    <div className="journey-sticky project-image-stage" ref={stage}>
      <div className="journey-top"><span className="eyebrow"><span className="orange-dot" /> A CLOSER LOOK AT OUR WORK</span><a href="#project-models">Skip gallery <ArrowDown size={13} /></a></div>
      <div className="journey-atmosphere" aria-hidden="true" />
      <div className="project-image-visual">
        <div className="project-image-frame">
          {images.map((image, index) => <figure key={image.src} ref={el => { panels.current[index] = el; }} className="project-image-panel" style={{ opacity: index === 0 ? 1 : 0 }} aria-hidden={current !== index}>
            <img src={image.src} alt={`KDX structural steel model — project archive image ${index + 1}`} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
          </figure>)}
          <span className="project-image-corner corner-top" aria-hidden="true" /><span className="project-image-corner corner-bottom" aria-hidden="true" />
        </div>
      </div>
      <div className="journey-copy project-image-copy" key={current}>
        <span className="journey-chapter-count">0{current + 1}<span>/ 07</span></span>
        <h2>The whole structure.<br />Every detail.</h2>
        <p>From the first column to the final connection. Explore the steel models behind our work.</p>
        <div className="journey-output"><span className="output-cross">+</span>KDX PROJECT ARCHIVE / STUDY 0{current + 1}</div>
        <a className="journey-cta" href="#project-models">Explore our 3D models <ArrowUpRight size={15} /></a>
      </div>
      <div className="journey-annotation project-image-annotation"><span /><div>{images[current].label.toUpperCase()}<small>STEEL DETAILING / 3D MODELLING</small></div></div>
      <div className="journey-bottom">
        <div className="journey-scroll-hint"><MoveDown size={17} /><span>{reduced ? 'SELECT AN IMAGE TO EXPLORE' : 'SCROLL TO EXPLORE THE DETAILS'}</span></div>
        <div className="journey-chapters project-image-controls" role="group" aria-label="Choose a project image">{images.map((image, index) => <button key={image.src} className={current === index ? 'current' : current > index ? 'completed' : ''} aria-label={`View ${image.label.toLowerCase()}`} aria-pressed={current === index} onClick={() => goToImage(index)}><span>0{index + 1}</span>Study<i /></button>)}</div>
        <div className="journey-progress"><div ref={progressBar} /></div>
        <span className="journey-disclaimer">ORIGINAL KDX PROJECT IMAGES / ARCHIVE ORDER</span>
      </div>
    </div>
  </section>;
}
