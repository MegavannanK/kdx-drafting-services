'use client';
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Maximize2, RotateCcw, X } from 'lucide-react';
import { embedUrl, shareUrl, type Project } from '@/lib/projects';

export default function ProjectViewer({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [reload, setReload] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [fullScreenError, setFullScreenError] = useState(false);
  const src = embedUrl(project);
  useEffect(() => { const previousFocus = document.activeElement as HTMLElement | null; dialog.current?.showModal(); const oldOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = oldOverflow; previousFocus?.focus(); }; }, []);
  useEffect(() => { setLoaded(false); setSlow(false); const timer = setTimeout(() => setSlow(true), 15000); return () => clearTimeout(timer); }, [project.id, reload]);
  return <dialog className="project-dialog" ref={dialog} onCancel={onClose} aria-labelledby="viewer-title" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="viewer-heading"><div><span className="eyebrow">{project.id} / PROJECT MODEL</span><h2 id="viewer-title">{project.name}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close project viewer"><X /></button></div>
    <div className="viewer-toolbar"><span><span className="live-dot" /> TRIMBLE CONNECT · 3D VIEW</span><div><button onClick={() => setReload(x => x + 1)} aria-label="Reload model"><RotateCcw size={16} /><span>Reload</span></button><button onClick={async () => { try { await frame.current?.requestFullscreen(); } catch { setFullScreenError(true); } }} aria-label="Full screen model"><Maximize2 size={16} /><span>Full screen</span></button><a href={shareUrl(project)} target="_blank" rel="noopener noreferrer">Open in Trimble <ExternalLink size={15} /></a></div></div>
    <div className="iframe-container"><iframe key={`${project.id}-${reload}`} ref={frame} src={src} title={`${project.name} interactive 3D model`} allow="fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoaded(true)} />{!loaded && !slow && <div className="iframe-loading"><span className="loader" /><p>Opening {project.name}…</p><small>Connecting to the shared Trimble model</small></div>}</div>
    <div className="viewer-note" role="status"><span>{fullScreenError ? 'Full screen is unavailable here. Use Open in Trimble for a larger view.' : slow ? 'If the model is blank or Trimble reports an error, try Reload or Open in Trimble. Availability is managed by Trimble.' : 'Rotate, pan, and explore the original project model using the viewer controls.'}</span><span>Shared project model</span></div>
  </dialog>;
}
