'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { architecture, ARCHIVE_HREF, DISCIPLINE, portfolio, projectSrc, type PortfolioProject } from '@/lib/portfolio';
import './work.css';

// Steel and architecture take turns: odd slides steel (a shed, a home, an
// industrial frame), even slides architectural. The rest live in the archive.
const STEEL_IDS = ['PRJ2652', 'PRJ2669', 'PRJ2635'];
export const FEATURED: readonly PortfolioProject[] = STEEL_IDS.flatMap((id, i) => [portfolio.find(p => p.id === id)!, architecture[i]]);

/** Corner badge naming the discipline: blue for steel, warm for architecture. */
/** The two archives, steel and architecture, as one split pill. */
const ArchiveLinks = ({ className, reveal, short }: { className: string; reveal?: boolean; short?: boolean }) =>
  <nav className={`wk-links ${className}`} aria-label="All projects" data-reveal={reveal || undefined}>
    {(['steel', 'arch'] as const).map(k => {
      const label = k === 'steel' ? 'Steel projects' : 'Architectural projects';
      return <Link key={k} href={ARCHIVE_HREF[k]} className={`wk-link is-${k}`} aria-label={short ? label : undefined}>
        <i aria-hidden="true"/><span>{short ? (k === 'steel' ? 'Steel' : 'Architecture') : label}</span><b aria-hidden="true"><ArrowUpRight size={15}/></b>
      </Link>;
    })}
  </nav>;

const Kind = ({ item, className = '' }: { item: PortfolioProject; className?: string }) =>
  <span className={`wk-kind is-${item.kind} ${className}`}><i aria-hidden="true"/>{DISCIPLINE[item.kind]}</span>;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Third fold. One project at a time on a wide drafting sheet: the model
 * drifts slowly while its name holds the corner, then the next wipes in.
 * A quiet numbered rail replaces the old index, so only one name is ever
 * read at a time. The full sets live on /projects (steel) and /architecture. Phones get a swipe rail.
 */
export default function Work({ onOpen }: { onOpen: (list: readonly PortfolioProject[], index: number) => void }) {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hold, setHold] = useState(false);
  const [inView, setInView] = useState(false);
  const [slide, setSlide] = useState(0);
  const project = FEATURED[active];
  const count = FEATURED.length;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    }), { threshold: .12 });
    el.querySelectorAll('[data-reveal]').forEach(node => io.observe(node));
    const seen = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio > .55), { threshold: [0, .55, 1] });
    seen.observe(el);
    return () => { io.disconnect(); seen.disconnect(); };
  }, []);

  function show(next: number) {
    if (next === active) return;
    setPrev(active);
    setActive(next);
  }
  const step = (delta: number) => show((active + delta + count) % count);

  function tilt(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--tx', ((event.clientX - rect.left) / rect.width - .5).toFixed(3));
    event.currentTarget.style.setProperty('--ty', ((event.clientY - rect.top) / rect.height - .5).toFixed(3));
  }

  function onRail() {
    const el = rail.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    const width = card ? card.offsetWidth + 12 : el.clientWidth;
    const next = Math.min(count - 1, Math.round(el.scrollLeft / width));
    if (next !== slide) setSlide(next);
  }
  const goTo = (i: number) => (rail.current?.children[i] as HTMLElement | undefined)?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });

  const paused = !inView || hold;

  return <section ref={root} className="wk" id="projects" aria-labelledby="wk-title">
    <div className="wk-head">
      <div>
        <p className="wk-eyebrow" data-reveal><span>02</span>Selected work</p>
        <h2 id="wk-title" className="wk-title" data-reveal>
          <span className="wk-line"><span>Real projects.</span></span>{' '}
          <span className="wk-line"><span><em>Resolved.</em></span></span>
        </h2>
      </div>
      <ArchiveLinks className="wk-head-cta" reveal/>
    </div>

    {/* Desktop and tablets: the stage */}
    <div className="wk-stage-wrap" data-reveal>
    <figure className="wk-stage" data-paused={paused} onPointerMove={tilt}
      onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)}>
      <button type="button" className="wk-stage-hit" onClick={() => onOpen(FEATURED, active)} aria-label={`Enlarge ${project.name}`}/>

      {FEATURED.map((item, i) => <div key={item.id} className={`wk-shot is-${item.kind}${i === active ? ' is-active' : ''}${i === prev ? ' is-prev' : ''}`} aria-hidden={i !== active}>
        <div className="wk-drift" key={i === active ? `on-${active}` : 'off'}>
          <img src={projectSrc(item)} data-hd={item.hd || undefined} alt={i === active ? `${item.name}, ${item.kind === 'arch' ? 'KDX architectural project' : 'original KDX steel model'}` : ''}
            loading={i < 2 ? 'eager' : 'lazy'} decoding="async"/>
        </div>
      </div>)}
      <span className="wk-scan" key={`scan-${active}`} aria-hidden="true"/>
      <Kind key={`kind-${active}`} item={project} className="wk-kind-stage"/>

      <figcaption className="wk-cap" key={`cap-${active}`}>
        <span className="wk-cap-meta"><b>{project.id}</b><i/>{project.category}</span>
        <span className="wk-cap-name"><span>{project.name}</span></span>
        <span className="wk-cap-loc">{project.location}</span>
      </figcaption>

      <div className="wk-rail-bar">
        <div className="wk-segs" role="group" aria-label="Featured projects">
          {FEATURED.map((item, i) => <button key={item.id} type="button" className={i === active ? 'is-active' : i < active ? 'is-done' : ''}
            aria-current={i === active} aria-label={`Show ${item.name}`} onClick={() => show(i)}>
            <span className="wk-seg-label"><i className={`wk-seg-kind is-${item.kind}`} aria-hidden="true"/><b>{pad(i + 1)}</b><span>{item.name}</span></span>
            <span className="wk-seg-bar">{i === active && <i key={`t-${active}`} onAnimationEnd={() => step(1)}/>}</span>
          </button>)}
        </div>
        <div className="wk-controls">
          <button type="button" onClick={() => step(-1)} aria-label="Previous project"><ArrowLeft size={17}/></button>
          <button type="button" onClick={() => step(1)} aria-label="Next project"><ArrowRight size={17}/></button>
        </div>
      </div>
    </figure>
    </div>

    {/* Phones: swipeable rail */}
    <div className="wk-rail" ref={rail} onScroll={onRail} data-reveal>
      {FEATURED.map((item, i) => <button type="button" key={item.id} className={`wk-card is-${item.kind}`} onClick={() => onOpen(FEATURED, i)} aria-label={`View ${item.name}`}>
        <span className="wk-card-img">
          {/* Wide renders show whole on a tall card; a blurred copy fills the rest. */}
          {item.kind === 'arch' && <img className="wk-card-blur" src={projectSrc(item, 'sm')} alt="" aria-hidden="true" loading="lazy" decoding="async"/>}
          <img src={projectSrc(item, 'sm')} data-hd={item.hd || undefined} alt="" loading="lazy" decoding="async"/><Kind item={item}/>
        </span>
        <span className="wk-card-copy"><span className="wk-meta">{item.category}<i/>{item.location}</span><strong>{item.name}</strong></span>
      </button>)}
    </div>
    <div className="wk-dots" role="group" aria-label="Choose a project">
      {FEATURED.map((item, i) => <button key={item.id} type="button" aria-label={`Show ${item.name}`} aria-current={slide === i} onClick={() => goTo(i)}/>)}
    </div>
    {/* Phones and tablets: a caption over two compact pills, sized to their words. */}
    <div className="wk-mobile-cta">
      <span className="wk-mobile-kicker">All projects</span>
      <ArchiveLinks className="wk-links-compact" short/>
    </div>
  </section>;
}
