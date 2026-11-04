'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { projectSrc, type PortfolioProject } from '@/lib/portfolio';
import './project-lightbox.css';

/**
 * Full-screen project view. Steps through whichever list it was opened from
 * (arrows, ← → keys, swipe on touch). `index` null means closed.
 */
export default function ProjectLightbox({ projects, index, onIndex, onClose, enquire }: {
  projects: readonly PortfolioProject[];
  index: number | null;
  onIndex: (index: number) => void;
  onClose: () => void;
  enquire: { href: string; onClick?: () => void };
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<number | null>(null);
  const project = index === null ? null : projects[index];
  const count = projects.length;
  const step = (delta: number) => { if (index !== null) onIndex((index + delta + count) % count); };
  // Architectural projects carry several views; each project opens on its cover.
  const [view, setView] = useState(0);
  useEffect(() => setView(0), [project?.id]);
  const views = project?.views ?? [];
  const shown = views[view]?.image ?? project?.image;

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (project && !el.open) el.showModal();
    if (!project && el.open) el.close();
    if (!project) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [project]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return <dialog ref={dialog} className="lb" aria-labelledby="lb-title" onCancel={onClose} onClose={onClose}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    {project && <div className="lb-inner">
      <figure className="lb-stage" data-kind={project.kind}
        onTouchStart={event => { touch.current = event.touches[0].clientX; }}
        onTouchEnd={event => {
          if (touch.current === null) return;
          const dx = event.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touch.current = null;
        }}>
        <img key={`${project.id}-${shown}`} src={projectSrc(project, 'lg', shown)} data-hd={project.hd || undefined} data-kind={project.kind}
          alt={`${project.name}, ${project.kind === 'arch' ? `KDX architectural project${views[view] ? `, ${views[view].label.toLowerCase()}` : ''}` : 'original KDX steel model'}`}/>
        <span className="lb-tag">{project.id}</span>
        {views.length > 1 && <div className="lb-views" role="group" aria-label="Project views">
          {views.map((v, i) => <button key={v.image} type="button" aria-pressed={i === view} aria-label={v.label} title={v.label} onClick={() => setView(i)}>
            <img src={projectSrc(project, 'sm', v.image)} alt="" loading="lazy" decoding="async"/>
          </button>)}
          <span className="lb-view-label" key={view}>{views[view].label}</span>
        </div>}
        {count > 1 && <div className="lb-arrows">
          <button type="button" onClick={() => step(-1)} aria-label="Previous project"><ArrowLeft size={18}/></button>
          <button type="button" onClick={() => step(1)} aria-label="Next project"><ArrowRight size={18}/></button>
        </div>}
      </figure>
      <div className="lb-copy" key={project.id}>
        <div className="lb-top">
          <span>{String(index! + 1).padStart(2, '0')} <i>/ {String(count).padStart(2, '0')}</i></span>
          <button type="button" className="lb-close" autoFocus onClick={onClose} aria-label="Close project"><X size={18}/></button>
        </div>
        <p className="lb-eyebrow">{project.category}<i/>{project.location}</p>
        <h2 id="lb-title">{project.name}</h2>
        <p className="lb-detail">{project.detail}</p>
        <p className="lb-note">{project.kind === 'arch' ? 'KDX architectural drafting · Client project' : 'Original KDX steel model · Completed project'}</p>
        <a className="lb-cta" href={enquire.href} onClick={() => { enquire.onClick?.(); onClose(); }}>Have a similar project?<span><ArrowUpRight size={16}/></span></a>
      </div>
    </div>}
  </dialog>;
}
