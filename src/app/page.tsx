'use client';

import { useCallback, useEffect, useState } from 'react';
import BlueprintHero from '@/components/blueprint-hero';
import Contact from '@/components/contact';
import Expertise from '@/components/expertise';
import Process from '@/components/process';
import ProjectLightbox from '@/components/project-lightbox';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import Studio from '@/components/studio';
import Work from '@/components/work';
import { portfolio, type PortfolioProject } from '@/lib/portfolio';

// The process model is drawn from this project.
const WESTON = Math.max(0, portfolio.findIndex(p => p.image === 'weston-shed'));

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  const revealPage = useCallback(() => setIntroDone(true), []);
  const [lightbox, setLightbox] = useState<{ list: readonly PortfolioProject[]; index: number } | null>(null);
  const [enquiryService, setEnquiryService] = useState('');
  const open = useCallback((list: readonly PortfolioProject[], index: number) => setLightbox({ list, index }), []);
  useEffect(() => {
    // Links from /projects arrive as /?service=steel#contact.
    const service = new URLSearchParams(window.location.search).get('service');
    if (service === 'steel') setEnquiryService('Steel detailing');
    if (service === 'architecture') setEnquiryService('Architectural drafting');
  }, []);

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader introDone={introDone}/>
    <main id="main">
      <BlueprintHero onReveal={revealPage}/>
      <Expertise onEnquire={setEnquiryService}/>
      <Work onOpen={open}/>
      <Process onExploreProject={() => open(portfolio, WESTON)}/>
      <Studio onEnquire={setEnquiryService}/>
      <Contact service={enquiryService} onService={setEnquiryService}/>
    </main>
    <SiteFooter onEnquire={setEnquiryService}/>
    <ProjectLightbox projects={lightbox?.list ?? portfolio} index={lightbox?.index ?? null}
      onIndex={index => setLightbox(current => current && { ...current, index })} onClose={() => setLightbox(null)}
      enquire={{ href: '#contact', onClick: () => setEnquiryService('Steel detailing') }}/>
  </>;
}
