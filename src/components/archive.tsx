'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { architecture, ARCHIVE_HREF, DISCIPLINE, portfolio, projectSrc, projectSrcSet, type Discipline } from '@/lib/portfolio';
import ProjectLightbox from './project-lightbox';
import SiteFooter from './site-footer';
import SiteHeader from './site-header';
import './archive.css';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const pad = (n: number) => String(n).padStart(2, '0');
// Which ends of the sideways pill row still have more to scroll to.
const edges = (el: HTMLElement) => {
  el.dataset.start = String(el.scrollLeft <= 4);
  el.dataset.end = String(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
};

// One archive per discipline: /projects for steel, /architecture for architecture.
const PAGES = {
  steel: {
    list: portfolio, filters: ['All projects', 'Residential', 'Commercial', 'Industrial'], crumb: 'Steel projects',
    title: ['Every frame,', 'resolved.'], service: 'steel',
    lede: 'Completed steel detailing for homes, sheds and industrial structures, captured from our original project models.',
  },
  arch: {
    list: architecture, filters: ['All projects', 'New build', 'Addition & alteration', 'Design & documentation'], crumb: 'Architectural projects',
    title: ['Every space,', 'considered.'], service: 'architecture',
    lede: 'Architectural design and documentation for new homes, additions and modular builds, from first concept to DA and BA sets.',
  },
} as const;

// Editorial rhythm on a 12-column grid. Steel: a wide pair, then a row of
// three. Architecture's photographs stay wide: 7/5, then 5/7, and a project
// left alone on its row takes the full width.
function span(i: number, total: number, kind: Discipline) {
  if (kind === 'arch') return i === total - 1 && i % 2 === 0 ? 12 : [7, 5, 5, 7][i % 4];
  if (total <= 2) return 6;
  return [7, 5, 4, 4, 4][i % 5];
}

/** The full archive for one discipline, filterable, opening into the lightbox. */
export default function Archive({ kind = 'steel' }: { kind?: Discipline }) {
  const page = PAGES[kind];
  const all = page.list;
  const [filter, setFilter] = useState<string>('All projects');
  const [open, setOpen] = useState<number | null>(null);
  const group = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const list = all.filter(p => filter === 'All projects' || p.category === filter);
  const countOf = (f: string) => f === 'All projects' ? all.length : all.filter(p => p.category === f).length;

  // Slide the filter's highlight under the active pill.
  useLayoutEffect(() => {
    const el = group.current;
    const place = () => {
      const btn = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!el || !btn) return;
      el.style.setProperty('--x', `${btn.offsetLeft}px`);
      el.style.setProperty('--w', `${btn.offsetWidth}px`);
      // On phones the pills scroll sideways: centre the chosen one, clear of the edge fades.
      if (el.scrollWidth > el.clientWidth) el.scrollTo({ left: btn.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2, behavior: 'smooth' });
      edges(el);
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

  // The filter bar sticks under the header; once it does, a paper wash
  // behind both keeps cards from showing through as they scroll past.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const hdr = () => parseFloat(getComputedStyle(root.current!).getPropertyValue('--hdr')) || 88;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < hdr()), { rootMargin: `-${hdr()}px 0px 0px 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Changing the filter from deep in the grid returns you to its top,
  // so a shorter list never leaves you staring at empty page.
  function choose(f: string) {
    setFilter(f);
    const el = sentinel.current;
    if (!el) return;
    const hdr = parseFloat(getComputedStyle(root.current!).getPropertyValue('--hdr')) || 88;
    const top = el.getBoundingClientRect().top + window.scrollY - hdr + 4;
    if (window.scrollY > top) window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function spotlight(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader home={false}/>
    <main id="main" ref={root} className={`ar is-${kind}`}>
      <section className="ar-hero" aria-labelledby="ar-title">
        <div className="ar-top" data-reveal>
          <nav className="ar-crumb" aria-label="Breadcrumb"><Link href="/"><ArrowLeft size={13}/>Home</Link><i/><span aria-current="page">{page.crumb}</span></nav>
          <nav className="ar-switch" aria-label="Project type">
            {(['steel', 'arch'] as const).map(k => <Link key={k} href={ARCHIVE_HREF[k]} className={`is-${k}`} aria-current={k === kind ? 'page' : undefined}><i aria-hidden="true"/>{DISCIPLINE[k]}</Link>)}
          </nav>
        </div>
        <div className="ar-hero-row">
          <h1 id="ar-title" className="ar-title" data-reveal>
            <span className="ar-line"><span>{page.title[0]}</span></span>{' '}
            <span className="ar-line"><span><em>{page.title[1]}</em></span></span>
          </h1>
          <p className="ar-lede" data-reveal>{page.lede}</p>
        </div>
      </section>

      <div ref={sentinel} aria-hidden="true"/>
      <div className="ar-bar" data-reveal data-stuck={stuck || undefined}>
        <div className="ar-filters" role="group" aria-label="Filter projects" ref={group}
          onScroll={e => edges(e.currentTarget)}>
          {page.filters.map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => choose(f)}>{f}<small>{pad(countOf(f))}</small></button>)}
        </div>
        <span className="ar-count" aria-live="polite">Showing {pad(list.length)} / {pad(all.length)}</span>
      </div>

      <ul className="ar-grid" key={filter}>
        {list.map((project, i) => {
          const full = span(i, list.length, kind) === 12;
          // A lone architectural project reads as a feature: the render at its own
          // proportions beside its story, never stretched across the page.
          const feature = full && kind === 'arch';
          return <li key={project.id} className={full ? 'is-full' : undefined} data-reveal
            style={{ '--span': span(i, list.length, kind), '--i': i % 5, ...(project.ratio ? { '--ratio': project.ratio } : {}), ...(project.focus ? { '--focus': project.focus } : {}) } as React.CSSProperties}>
          <button type="button" className={`ar-card${feature ? ' is-feature' : ''}`} onClick={() => setOpen(i)} onPointerMove={spotlight} aria-label={`View ${project.name}`}>
            <span className="ar-img">
              <img src={projectSrc(project, 'sm')} srcSet={projectSrcSet(project)} data-hd={project.hd || undefined} alt="" loading={i < 2 ? 'eager' : 'lazy'} decoding="async"
                sizes={feature ? '(max-width: 899px) 92vw, 64vw' : full ? '92vw' : '(max-width: 640px) 92vw, (max-width: 1100px) 46vw, 58vw'}/>
              <small>{project.id}</small>
              {project.views && <span className="ar-views">{pad(project.views.length)} views</span>}
              <span className="ar-open" aria-hidden="true"><ArrowUpRight size={18}/></span>
            </span>
            <span className="ar-copy">
              <span className="ar-meta">{project.category}<i/>{project.location}</span>
              <strong>{project.name}</strong>
              <span className="ar-num" aria-hidden="true">{pad(i + 1)}</span>
              {feature && <>
                <span className="ar-detail">{project.detail}</span>
                {project.views && <span className="ar-thumbs" aria-hidden="true">
                  {project.views.map(v => <img key={v.image} src={projectSrc(project, 'sm', v.image)} alt="" loading="lazy" decoding="async"/>)}
                </span>}
                <span className="ar-feature-go" aria-hidden="true">View project<ArrowUpRight size={15}/></span>
              </>}
            </span>
          </button>
        </li>;
        })}
      </ul>

      <section className="ar-cta" data-tone="dark" aria-labelledby="ar-cta-title">
        <div data-reveal>
          <p className="ar-cta-eyebrow"><i/>Your project next</p>
          <h2 id="ar-cta-title">Have a similar project? <em>Let’s talk.</em></h2>
        </div>
        <div className="ar-cta-actions" data-reveal>
          <a href={`${base}/?service=${page.service}#contact`} className="ar-button">Start a project<span><ArrowUpRight size={16}/></span></a>
          <Link href="/" className="ar-back"><ArrowLeft size={15}/>Back to home</Link>
        </div>
      </section>
    </main>
    <SiteFooter home={false}/>

    <ProjectLightbox projects={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} enquire={{ href: `${base}/?service=${page.service}#contact` }}/>
  </>;
}
