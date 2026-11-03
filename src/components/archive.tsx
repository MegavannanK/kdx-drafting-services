'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { portfolio, projectSrc } from '@/lib/portfolio';
import ProjectLightbox from './project-lightbox';
import SiteFooter from './site-footer';
import SiteHeader from './site-header';
import './archive.css';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const FILTERS = ['All projects', 'Residential', 'Sheds & commercial', 'Industrial'] as const;
type Filter = typeof FILTERS[number];
const pad = (n: number) => String(n).padStart(2, '0');

// Editorial rhythm on a 12-column grid: a wide pair, then a row of three.
function span(i: number, total: number) {
  if (total <= 2) return 6;
  return [7, 5, 4, 4, 4][i % 5];
}

/** /projects: the full archive, filterable, opening into the lightbox. */
export default function Archive() {
  const [filter, setFilter] = useState<Filter>('All projects');
  const [open, setOpen] = useState<number | null>(null);
  const group = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const list = portfolio.filter(p => filter === 'All projects' || p.category === filter);
  const countOf = (f: Filter) => f === 'All projects' ? portfolio.length : portfolio.filter(p => p.category === f).length;

  // Slide the filter's highlight under the active pill.
  useLayoutEffect(() => {
    const el = group.current;
    const place = () => {
      const btn = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!el || !btn) return;
      el.style.setProperty('--x', `${btn.offsetLeft}px`);
      el.style.setProperty('--w', `${btn.offsetWidth}px`);
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [filter]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    }), { threshold: .08, rootMargin: '0px 0px -6% 0px' });
    el.querySelectorAll('[data-reveal]:not(.is-in)').forEach(node => io.observe(node));
    return () => io.disconnect();
  }, [filter]);

  function spotlight(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader home={false}/>
    <main id="main" ref={root} className="ar">
      <section className="ar-hero" aria-labelledby="ar-title">
        <nav className="ar-crumb" aria-label="Breadcrumb" data-reveal><Link href="/"><ArrowLeft size={13}/>Home</Link><i/><span aria-current="page">Project archive</span></nav>
        <div className="ar-hero-row">
          <h1 id="ar-title" className="ar-title" data-reveal>
            <span className="ar-line"><span>Every frame,</span></span>{' '}
            <span className="ar-line"><span><em>resolved.</em></span></span>
          </h1>
          <p className="ar-lede" data-reveal>Completed steel detailing for homes, sheds and industrial structures, captured from our original project models.</p>
        </div>
      </section>

      <div className="ar-bar" data-reveal>
        <div className="ar-filters" role="group" aria-label="Filter projects" ref={group}>
          {FILTERS.map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}<small>{pad(countOf(f))}</small></button>)}
        </div>
        <span className="ar-count" aria-live="polite">Showing {pad(list.length)} / {pad(portfolio.length)}</span>
      </div>

      <ul className="ar-grid" key={filter}>
        {list.map((project, i) => <li key={project.id} style={{ '--span': span(i, list.length), '--i': i % 5 } as React.CSSProperties} data-reveal>
          <button type="button" className="ar-card" onClick={() => setOpen(i)} onPointerMove={spotlight} aria-label={`View ${project.name}`}>
            <span className="ar-img">
              <img src={projectSrc(project, 'sm')} data-hd={project.hd || undefined} alt="" loading={i < 2 ? 'eager' : 'lazy'} decoding="async"/>
              <small>{project.id}</small>
              <span className="ar-open" aria-hidden="true"><ArrowUpRight size={18}/></span>
            </span>
            <span className="ar-copy">
              <span className="ar-meta">{project.category}<i/>{project.location}</span>
              <strong>{project.name}</strong>
              <span className="ar-num" aria-hidden="true">{pad(i + 1)}</span>
            </span>
          </button>
        </li>)}
      </ul>

      <section className="ar-cta" data-tone="dark" aria-labelledby="ar-cta-title">
        <div data-reveal>
          <p className="ar-cta-eyebrow"><i/>Your project next</p>
          <h2 id="ar-cta-title">Have a similar project? <em>Let’s talk.</em></h2>
        </div>
        <div className="ar-cta-actions" data-reveal>
          <a href={`${base}/?service=steel#contact`} className="ar-button">Start a project<span><ArrowUpRight size={16}/></span></a>
          <Link href="/" className="ar-back"><ArrowLeft size={15}/>Back to home</Link>
        </div>
      </section>
    </main>
    <SiteFooter home={false}/>

    <ProjectLightbox projects={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} enquire={{ href: `${base}/?service=steel#contact` }}/>
  </>;
}
