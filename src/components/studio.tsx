'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import StudioSheet from './studio-sheet';
import './studio.css';

type Kind = 'steel' | 'arch' | 'both';

// Clockwise from top-left: architecture on the left, steel on the right,
// builders (both) bridging the top.
const AUDIENCES: readonly { title: string; body: string; service: string; tag: string; kind: Kind }[] = [
  { title: 'Homeowners', body: 'Clear plans for a new home, extension or addition.', service: 'Architectural drafting', tag: 'Architectural drafting', kind: 'arch' },
  { title: 'Builders', body: 'Buildable drawings, steel and architecture from one desk.', service: 'Both services', tag: 'Steel + architecture', kind: 'both' },
  { title: 'Fabricators', body: 'Shop drawings and NC/DXF data, ready for the workshop.', service: 'Steel detailing', tag: 'Steel detailing', kind: 'steel' },
  { title: 'Design teams', body: 'Extra drafting capacity, to your standards and deadlines.', service: 'Architectural drafting', tag: 'Architectural drafting', kind: 'arch' },
];

const pad = (n: number) => String(n).padStart(2, '0');
type Pt = { x: number; y: number };

/**
 * A drafting leader from the hub to a node: out of the sheet's side,
 * one rounded right-angle turn, then straight in. Stacked layouts get a
 * straight drop down the spine.
 */
function wire(h: Pt, n: Pt, half: number) {
  const dx = n.x - h.x, dy = n.y - h.y;
  if (Math.abs(dx) < Math.abs(dy) * .6) return `M${h.x} ${h.y}L${n.x} ${n.y}`;
  const s = Math.sign(dx), v = Math.sign(dy) || 1;
  const mx = h.x + s * (half + (Math.abs(dx) - half) * .3);
  const r = Math.min(16, Math.abs(dy) / 2);
  return `M${h.x} ${h.y}H${mx - s * r}Q${mx} ${h.y} ${mx} ${h.y + v * r}V${n.y - v * r}Q${mx} ${n.y} ${mx + s * r} ${n.y}H${n.x}`;
}

/**
 * Fifth fold, on paper: who we work with, drawn as a connection diagram.
 * KDX is the hub; four audiences are wired to it, coloured by the service
 * they draw on. One node is open at a time; its wire draws itself in as
 * the timer, then the next one takes over. Hover holds, click enquires.
 */
export default function Studio({ onEnquire }: { onEnquire: (service: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const graph = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const [inView, setInView] = useState(false);
  const [hand, setHand] = useState<{ from: number; to: number; key: number } | null>(null);
  const prev = useRef(0);
  const [geo, setGeo] = useState<{ w: number; h: number; hub: Pt; half: number; nodes: Pt[] } | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    }), { threshold: .15 });
    el.querySelectorAll('[data-reveal]').forEach(node => io.observe(node));
    const seen = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio > .45), { threshold: [0, .45, 1] });
    seen.observe(graph.current!);
    return () => { io.disconnect(); seen.disconnect(); };
  }, []);

  // Wires follow the layout: measure the hub and each node's dot.
  useLayoutEffect(() => {
    const g = graph.current, h = hub.current;
    if (!g || !h) return;
    // Layout offsets, not client rects, so reveal transforms don't skew wires.
    const centre = (el: HTMLElement): Pt => {
      let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n: HTMLElement | null = el;
      while (n && n !== g) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
      return { x: Math.round(x), y: Math.round(y) };
    };
    const measure = () => setGeo({ w: g.offsetWidth, h: g.offsetHeight, hub: centre(h), half: h.offsetWidth / 2, nodes: dots.current.map(d => d ? centre(d) : { x: 0, y: 0 }) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(g);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  // A handoff pulse runs back along the old wire, through the hub, out to the new node.
  useEffect(() => {
    if (prev.current === active) return;
    setHand(h => ({ from: prev.current, to: active, key: (h?.key ?? 0) + 1 }));
    prev.current = active;
  }, [active]);

  // The drafting-table lamp: the grid shows a little stronger under the pointer.
  const lamp = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const playing = inView && !hold;
  const next = () => setActive(a => (a + 1) % AUDIENCES.length);
  const current = AUDIENCES[active];

  return <section ref={root} className="st" id="about" aria-labelledby="st-title" onPointerMove={lamp}>
    <div className="st-light" aria-hidden="true"/>
    <header className="st-head">
      <div>
        <p className="st-eyebrow" data-reveal><span>04</span>The studio</p>
        <h2 id="st-title" className="st-title" data-reveal>
          <span className="st-line"><span>Your project.</span></span>{' '}
          <span className="st-line"><span><em>Our full attention.</em></span></span>
        </h2>
      </div>
      <p className="st-lede" data-reveal>One desk in Nowra for steel and architecture, Australia-wide. A small addition gets the same care as a complex structure.</p>
    </header>

    <div ref={graph} className="st-graph" data-reveal data-playing={playing} data-kind={current.kind}
      onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)}>
      <p className="st-label"><span>Who we work with</span><span className="st-count"><b key={active}>{pad(active + 1)}</b> / {pad(AUDIENCES.length)}</span></p>

      {geo && <svg className="st-wires" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true">
        <defs>
          {geo.nodes.map((n, i) => <linearGradient key={i} id={`st-both-${i}`} gradientUnits="userSpaceOnUse" x1={geo.hub.x} y1={geo.hub.y} x2={n.x} y2={n.y}>
            <stop offset="0" stopColor="#2167a3"/><stop offset="1" stopColor="#b07a3a"/>
          </linearGradient>)}
        </defs>
        {geo.half > 90 && <g className="st-grid">
          <path d={`M${geo.hub.x} 64V${geo.h - 48}M28 ${geo.hub.y}H${geo.w - 28}`}/>
          <circle cx={geo.hub.x} cy={52} r="11"/><text x={geo.hub.x} y={55.5}>B</text>
          <circle cx={14} cy={geo.hub.y} r="11"/><text x={14} y={geo.hub.y + 3.5}>2</text>
          <circle cx={geo.w - 14} cy={geo.hub.y} r="11"/><text x={geo.w - 14} y={geo.hub.y + 3.5}>2</text>
        </g>}
        {AUDIENCES.map((item, i) => {
          const d = wire(geo.hub, geo.nodes[i], geo.half);
          const on = i === active;
          return <g key={item.title} className={`st-wire st-${item.kind}${on ? ' is-active' : ''}`} style={{ '--i': i, ...(item.kind === 'both' ? { '--c': `url(#st-both-${i})` } : {}) } as React.CSSProperties}>
            <path className="st-wire-base" d={d}/>
            <path className="st-wire-in" d={d} pathLength={1}/>
            {on && <path key={active} className="st-wire-run" d={d} pathLength={1} onAnimationEnd={next}/>}
            {hand?.from === i && <path key={`b${hand.key}`} className="st-comet is-back" d={d} pathLength={1}/>}
            {hand?.to === i && <path key={`f${hand.key}`} className="st-comet is-fwd" d={d} pathLength={1}/>}
            <circle className="st-spark" r={on ? 3.5 : 2.2}>
              <animateMotion dur={on ? '1.8s' : '3.6s'} repeatCount="indefinite" begin={`${i * .9}s`} path={d}/>
            </circle>
          </g>;
        })}
      </svg>}

      <span className="st-pool" aria-hidden="true"/>
      <div ref={hub} className="st-hub">
        {hand && <span key={hand.key} className="st-hub-flash" aria-hidden="true"/>}
        <StudioSheet index={active}/>
        <span className="st-coords">Nowra, NSW · 34.88° S 150.60° E</span>
      </div>

      <ul className="st-nodes">
        {AUDIENCES.map((item, i) => <li key={item.title} className={`st-node st-${item.kind}${i === active ? ' is-active' : ''}`} style={{ '--i': i } as React.CSSProperties}>
          <a href="#contact" onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => onEnquire(item.service)}>
            <span className="st-dot" ref={el => { dots.current[i] = el; }} aria-hidden="true">{pad(i + 1)}</span>
            <span className="st-node-text">
              <span className="st-tag">{item.tag}</span>
              <span className="st-name">{item.title}<ArrowUpRight className="st-go" size={20} aria-hidden="true"/></span>
              <span className="st-detail"><span className="st-body">{item.body}</span></span>
            </span>
          </a>
        </li>)}
      </ul>

      <p className="st-legend" aria-hidden="true"><span className="st-steel">Steel detailing</span><span className="st-arch">Architectural drafting</span></p>
    </div>
  </section>;
}
