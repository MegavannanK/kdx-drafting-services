'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import './expertise.css';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

export type ServiceChoice = 'Steel detailing' | 'Architectural drafting' | 'Both services';

const DISCIPLINES = [
  {
    key: 'steel', index: '01', title: 'Steel detailing', enquiry: 'Steel detailing' as const,
    audience: 'Fabricators · Builders · Engineers',
    intro: 'Every member and connection, resolved for fabrication.',
    image: '/images/steel-pavilion.jpg', caption: 'Illustrative concept',
    deliverables: ['3D steel modelling', 'Shop drawings', 'NC & DXF outputs', 'Tender sets'],
    cta: 'Start a steel project',
  },
  {
    key: 'architecture', index: '02', title: 'Architectural drafting', enquiry: 'Architectural drafting' as const,
    audience: 'Homeowners · Builders · Designers',
    intro: 'Considered spaces, clearly communicated.',
    image: '/images/architecture-hero.jpg', caption: 'Illustrative concept',
    deliverables: ['Plans & elevations', 'Homes & additions', 'Commercial sets', '3D views'],
    cta: 'Start a design project',
  },
] as const;

type Key = typeof DISCIPLINES[number]['key'];

/**
 * Second fold. Continues the hero's night palette and fits one screen on
 * desktop: one discipline leads, the other waits a click away. On phones the
 * two become a swipeable pair of cards. Clients who need both get their own
 * path at the foot.
 */
export default function Expertise({ onEnquire }: { onEnquire: (service: ServiceChoice) => void }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Key>('steel');
  const [stacked, setStacked] = useState(false);
  const [slide, setSlide] = useState(0);
  const [sweep, setSweep] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const narrow = matchMedia('(max-width: 899px)');
    const onNarrow = () => setStacked(narrow.matches);
    onNarrow();
    narrow.addEventListener('change', onNarrow);

    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    }), { threshold: .12 });
    el.querySelectorAll('[data-reveal]').forEach(node => io.observe(node));

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        el.style.setProperty('--p', Math.min(1, Math.max(0, progress)).toFixed(4));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      narrow.removeEventListener('change', onNarrow);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  function choose(key: Key) {
    if (key === active) return;
    setActive(key);
    setSweep(v => v + 1);
  }

  function spotlight(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }

  function onTrackScroll() {
    const el = track.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth));
    if (next !== slide) setSlide(next);
  }

  function goTo(i: number) {
    const card = track.current?.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  return <section ref={root} className="xp" id="services" data-tone="dark" aria-labelledby="xp-title">
    <div className="xp-head">
      <p className="xp-eyebrow" data-reveal><span>01</span>Our expertise</p>
      <h2 id="xp-title" className="xp-title" data-reveal>
        <span className="xp-line"><span>Two disciplines.</span></span>{' '}
        <span className="xp-line"><span><em>One eye for detail.</em></span></span>
      </h2>
    </div>

    <div className="xp-split" data-reveal ref={track} onScroll={stacked ? onTrackScroll : undefined}>
      {DISCIPLINES.map(item => {
        const open = stacked || active === item.key;
        return <article key={item.key} className={`xp-panel is-${item.key}${open ? ' is-open' : ''}`} onPointerMove={spotlight} aria-label={item.title}>
          <div className="xp-media" aria-hidden="true">
            <img src={`${base}${item.image}`} alt="" loading="lazy" decoding="async"/>
          </div>
          <div className="xp-scrim" aria-hidden="true"/>
          {open && !stacked && <span className="xp-sweep" key={sweep} aria-hidden="true"/>}

          <header className="xp-top">
            <span className="xp-index"><i/>{item.index}<small>{item.audience}</small></span>
            <span className="xp-caption">{item.caption}</span>
          </header>

          <div className="xp-body">
            <h3>{item.title}</h3>
            <p className="xp-intro">{item.intro}</p>
            <div className="xp-more" id={`xp-more-${item.key}`} inert={!open}>
              <div>
                <ul className="xp-list" aria-label="Deliverables">
                  {item.deliverables.map((name, i) => <li key={name} style={{ '--i': i } as React.CSSProperties}><span>0{i + 1}</span>{name}</li>)}
                </ul>
                <a href="#contact" className="xp-button" onClick={() => onEnquire(item.enquiry)}>{item.cta}<span><ArrowUpRight size={16}/></span></a>
              </div>
            </div>
          </div>

          {!stacked && <button type="button" className="xp-hit" onClick={() => choose(item.key)} aria-expanded={open} aria-controls={`xp-more-${item.key}`} tabIndex={open ? -1 : 0} aria-label={`Explore ${item.title}`}>
            <span className="xp-explore">Explore <Plus size={16}/></span>
          </button>}
        </article>;
      })}
    </div>

    {stacked && <div className="xp-dots" role="group" aria-label="Choose a service">
      {DISCIPLINES.map((item, i) => <button key={item.key} type="button" aria-label={`Show ${item.title}`} aria-current={slide === i} onClick={() => goTo(i)}/>)}
    </div>}

    <div className="xp-both" data-reveal>
      <p><strong>Need both?</strong> <span>One studio, coordinated from the start.</span></p>
      <a href="#contact" className="xp-button is-ghost" onClick={() => onEnquire('Both services')}><em>Need both?</em>Plan a combined project<span><ArrowUpRight size={16}/></span></a>
    </div>
  </section>;
}
