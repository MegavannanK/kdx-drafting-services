'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import ProjectShowcase from './project-showcase';
import ScrollJourney from './scroll-journey';
import './detail-explorer.css';

export default function DetailExplorer({ onExploreProject }: { onExploreProject: () => void }) {
  const [study, setStudy] = useState<'walkway' | 'steel'>('walkway');
  const detailTitle = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const title = detailTitle.current;
    if (!title) return;
    if (!('IntersectionObserver' in window)) {
      title.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      title.classList.toggle('is-visible', entry.isIntersecting);
    }, { threshold: 0.35 });
    observer.observe(title);
    return () => observer.disconnect();
  }, []);
  return <section id="approach" className="detail-explorer" aria-labelledby="detail-explorer-title">
    <div className="detail-intro section-wrap">
      <div className="section-label"><span>03 / A CLOSER LOOK</span><span>SCROLL THROUGH THE DETAILS</span></div>
      <div className="section-heading title-reveal detail-title-reveal" ref={detailTitle}><h2 id="detail-explorer-title" className="word-reveal" aria-label="From the frame. To the everyday."><span className="reveal-word detail-word-dark" aria-hidden="true">From</span>{' '}<span className="reveal-word detail-word-muted" aria-hidden="true">the</span>{' '}<span className="reveal-word detail-word-muted" aria-hidden="true">frame.</span><br/><span className="reveal-word detail-word-muted" aria-hidden="true">To</span>{' '}<span className="reveal-word detail-word-muted" aria-hidden="true">the</span>{' '}<span className="reveal-word detail-word-muted" aria-hidden="true">everyday.</span></h2><p>Stairs, landings, connections. Explore how the individual details come together in three dimensions.</p></div>
      <div className="detail-study-tabs" role="group" aria-label="Choose a 3D study">
        <button aria-pressed={study === 'walkway'} onClick={() => setStudy('walkway')} aria-controls="detail-study"><span><small>STUDY 01</small>Stairs & walkway</span><ArrowUpRight size={20}/></button>
        <button aria-pressed={study === 'steel'} onClick={() => setStudy('steel')} aria-controls="detail-study"><span><small>STUDY 02</small>Steel frame & connections</span><ArrowUpRight size={20}/></button>
      </div>
    </div>
    <div id="detail-study">{study === 'walkway' ? <ProjectShowcase/> : <ScrollJourney onExploreProject={onExploreProject}/>}</div>
  </section>;
}

