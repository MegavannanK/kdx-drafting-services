'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, ArrowRight, Plus, Minus, Menu, X, Mail, MapPin, Phone, MoveUpRight } from 'lucide-react';
import ConstructionHero from '@/components/construction-hero';
import DetailExplorer from '@/components/detail-explorer';
import { portfolio, type PortfolioProject } from '@/lib/portfolio';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const disciplines = {
  steel: {
    title: 'Steel detailing', kicker: 'FROM ENGINEERING TO FABRICATION',
    intro: 'Every member. Every connection. A clearer path to fabrication.',
    body: 'We translate engineering information into coordinated steel models and practical drawings for fabricators, builders and project teams.',
    image: '/images/projects/weston-shed.jpg', alt: 'Steel framing in the completed Weston Shed project model', caption: 'WESTON SHED / ACTUAL PROJECT MODEL',
    services: [
      ['3D steel modelling', 'Coordinated Tekla models that bring columns, beams, bracing and connections into a complete structural view.'],
      ['Shop & fabrication drawings', 'Assembly and part drawings that communicate member geometry, connection details and fabrication information.'],
      ['NC, DXF & model outputs', 'Digital fabrication data and model deliverables to support the next stage of production.'],
      ['Tender sets & coordination', 'Clear steel scope for estimating, model review and coordination with your wider project team.'],
    ],
    tags: ['RESIDENTIAL STEEL', 'SHEDS & COMMERCIAL', 'INDUSTRIAL'],
  },
  architecture: {
    title: 'Architectural drafting', kicker: 'FROM YOUR BRIEF TO CLEAR DRAWINGS',
    intro: 'Considered spaces. Clearly communicated.',
    body: 'From a small home to a commercial space, we help turn your ideas and design information into a coherent set of architectural drawings.',
    image: '/images/residential-concept.jpg', alt: 'Illustrative courtyard home cutaway showing the floor plan and steel frame', caption: 'RESIDENTIAL CONCEPT / ILLUSTRATIVE VISUAL',
    services: [
      ['Plans, elevations & sections', 'Drawings that explain the layout, external form and key relationships within your building.'],
      ['Homes, additions & alterations', 'Drafting support for new homes and changes to existing spaces, shaped around your project brief.'],
      ['Commercial documentation', 'Architectural drawing packages for commercial spaces, with the level of detail agreed for your project.'],
      ['3D views & design coordination', 'Spatial views and coordinated drawing updates that help you and your team understand the design.'],
    ],
    tags: ['NEW HOMES', 'ADDITIONS & ALTERATIONS', 'COMMERCIAL SPACES'],
  },
};
type Discipline = keyof typeof disciplines;
function Logo() { return <a className="brand" href="#top" aria-label="KDX Drafting Service home"><img src={`${base}/images/brand/kdx-logo.png`} width="1200" height="527" alt="KDX Drafting Service" /></a>; }

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [discipline, setDiscipline] = useState<Discipline>('steel');
  const [openDetail, setOpenDetail] = useState<number | null>(null);
  const [filter, setFilter] = useState('All projects');
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<PortfolioProject | null>(null);
  const [emailReady, setEmailReady] = useState(false);
  const [enquiryService, setEnquiryService] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const projectTitle = useRef<HTMLDivElement>(null);
  const expertiseTitle = useRef<HTMLDivElement>(null);
  const service = disciplines[discipline];
  const filtered = portfolio.filter(p => filter === 'All projects' || p.category === filter);
  const visible = expanded ? filtered : filtered.slice(0, 3);

  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenu(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menu]);
  useEffect(() => {
    const title = projectTitle.current;
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
  useEffect(() => {
    const title = expertiseTitle.current;
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
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>([
      '#services > .section-label', '#services > .section-heading', '#services > .discipline-tabs', '#services > .service-panel',
      '#projects > .section-label', '#projects > .section-heading', '#projects > .project-filter-row', '#projects > .project-grid', '#projects > .portfolio-bottom',
      '#approach .detail-intro > .section-label', '#approach .detail-intro > .section-heading', '#approach .detail-study-tabs',
      '#about > .section-label', '#about > .studio-grid', '#about > .process-strip',
      '#contact > .contact-copy', '#contact > .contact-form',
    ].join(','));
    if (!targets.length) return;
    targets.forEach((target, index) => {
      target.classList.add('scroll-section-item');
      target.style.setProperty('--scroll-item-delay', `${(index % 3) * 90}ms`);
      target.style.setProperty('--scroll-enter-x', index % 2 ? '32px' : '-32px');
    });
    if (!('IntersectionObserver' in window)) {
      targets.forEach(target => target.classList.add('is-in-view'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const el = dialog.current;
    if (selected && el && !el.open) el.showModal();
    if (!selected && el?.open) el.close();
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [selected]);
  function chooseService(next: Discipline) { setDiscipline(next); setOpenDetail(null); }
  function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = `Hello KDX,\n\n${data.get('message')}\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nService: ${data.get('service')}\nProject location: ${data.get('location') || 'Not provided'}\n`;
    window.location.href = `mailto:kdxdrafting@outlook.com.au?subject=${encodeURIComponent(`Project enquiry — ${data.get('service')}`)}&body=${encodeURIComponent(body)}`;
    setEmailReady(true);
  }
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <Logo />
      <nav aria-label="Main navigation" id="main-menu" className={menu ? 'nav-open' : ''}>
        {[['Expertise','services'],['Selected work','projects'],['Our process','approach'],['The studio','about']].map(([label,id]) => <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>{label}</a>)}
        <a href="#contact" className="mobile-contact" onClick={() => setMenu(false)}>Start a project <ArrowUpRight size={16}/></a>
      </nav>
      <a href="#contact" className="header-cta">Let’s talk <ArrowUpRight size={17}/></a>
      <button ref={menuButton} className="menu-toggle" onClick={() => setMenu(!menu)} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="main-menu">{menu ? <X/> : <Menu/>}</button>
    </header>
    <main id="main">
      <ConstructionHero/>

      <section className="expertise section-wrap" id="services">
        <div className="section-label"><span>01 / OUR EXPERTISE</span><span>TWO SPECIALIST SERVICES</span></div>
        <div className="section-heading title-reveal" ref={expertiseTitle}><h2 className="word-reveal" aria-label="Two disciplines. One eye for detail."><span className="reveal-word" aria-hidden="true">Two</span>{' '}<span className="reveal-word" aria-hidden="true">disciplines.</span><br/><span className="reveal-word accent-word" aria-hidden="true">One</span>{' '}<span className="reveal-word accent-word" aria-hidden="true">eye</span>{' '}<span className="reveal-word accent-word" aria-hidden="true">for</span>{' '}<span className="reveal-word accent-word" aria-hidden="true">detail.</span></h2><p>Choose the expertise your project needs.<br/>The same care and clarity, whichever way you build.</p></div>
        <div className="discipline-tabs" role="group" aria-label="Choose a service">
          <button onClick={() => chooseService('steel')} aria-pressed={discipline === 'steel'}><small>01</small><span>Steel detailing</span><ArrowUpRight/></button>
          <button onClick={() => chooseService('architecture')} aria-pressed={discipline === 'architecture'}><small>02</small><span>Architectural drafting</span><ArrowUpRight/></button>
        </div>
        <div className={`service-panel service-${discipline}`}>
          <figure className="service-art"><div className="art-top"><span>{service.kicker}</span><span className="elevation-tag">ELEVATION / {discipline === 'steel' ? '01' : '02'}</span></div><img key={discipline} src={`${base}${service.image}`} alt={service.alt} loading="lazy"/><figcaption>{service.caption}</figcaption><div className="service-tags">{service.tags.map(tag => <span key={tag}>{tag}</span>)}</div></figure>
          <div className="service-content"><h3>{service.intro}</h3><p>{service.body}</p><div className="service-list">{service.services.map(([title,body],i) => <article key={`${discipline}-${title}`} onMouseEnter={() => setOpenDetail(i)} onMouseLeave={() => setOpenDetail(null)}><button aria-expanded={openDetail === i} aria-controls={`service-detail-${i}`}><span>{title}</span>{openDetail === i ? <Minus size={17}/> : <Plus size={17}/>}</button><div id={`service-detail-${i}`}><p>{body}</p></div></article>)}</div><a href="#contact" className="text-link" onClick={() => setEnquiryService(service.title)}>Discuss your {discipline === 'steel' ? 'steel' : 'architectural'} project <ArrowUpRight size={17}/></a></div>
        </div>
      </section>

      <section className="project-section section-wrap" id="projects">
        <div className="section-label"><span>02 / SELECTED WORK</span><span>REAL PROJECTS. RESOLVED IN DETAIL.</span></div>
        <div className="section-heading title-reveal" ref={projectTitle}><h2 className="word-reveal" aria-label="Small homes. Big possibilities."><span className="reveal-word" aria-hidden="true">Small</span>{' '}<span className="reveal-word" aria-hidden="true">homes.</span><br/><span className="reveal-word" aria-hidden="true">Big</span>{' '}<span className="reveal-word" aria-hidden="true">possibilities.</span></h2><p>Residential frames, sheds and industrial structures. A closer look at the steel detailing behind our clients’ projects.</p></div>
        <div className="project-filter-row"><div className="project-filters" role="group" aria-label="Filter completed projects">{['All projects','Residential','Sheds & commercial','Industrial'].map((label,i) => <button key={label} data-index={`0${i+1}`} aria-pressed={filter === label} onClick={() => {setFilter(label); setExpanded(false);}}>{label}{label === 'All projects' && <small>10</small>}</button>)}</div><span className="project-count" aria-live="polite">{String(filtered.length).padStart(2,'0')} PROJECTS</span></div>
        <div className="project-grid">{visible.map((project,i) => <button className="project-card" key={project.id} onClick={() => setSelected(project)} aria-label={`View ${project.name} project`}><div className="project-image"><span className="project-id">{project.id}</span><img src={`${base}/images/projects/${project.image}.jpg`} alt={`${project.name} — original KDX steel model`} loading="lazy"/><span className="project-open"><MoveUpRight size={23}/></span></div><div className="project-caption"><div><small>{project.category} / {project.location}</small><h3>{project.name}</h3></div><span>{String(i+1).padStart(2,'0')}</span></div></button>)}</div>
        <div className="portfolio-bottom"><p>Images from our original project models.</p>{filtered.length > 3 && <button className="text-link" onClick={() => setExpanded(!expanded)}>{expanded ? 'Show selected projects' : `Explore all ${filtered.length} projects`}{expanded ? <Minus size={17}/> : <Plus size={17}/>}</button>}</div>
      </section>

      <DetailExplorer onExploreProject={() => setSelected(portfolio[1])}/>

      <section className="studio section-wrap" id="about"><div className="section-label"><span>04 / THE STUDIO</span><span>LOCAL ROOTS. AUSTRALIA-WIDE REACH.</span></div><div className="studio-grid"><div><span className="studio-cross" aria-hidden="true">+</span><h2>Your project.<br/><span>Our full attention.</span></h2></div><div className="studio-copy"><p className="lead">A small addition deserves the same care as a complex structure.</p><p>Based in Nowra, KDX provides steel detailing and architectural drafting for projects across Australia. We work with homeowners, builders, fabricators and design teams to turn project information into clear, useful drawings.</p><p>Two distinct services. A practical, collaborative approach. And an eye for the details that help everyone see the next step.</p><a className="text-link" href="#contact">Meet your next drafting partner <ArrowUpRight size={18}/></a></div></div><div className="process-strip">{[['Share the brief','Tell us about your project, drawings and time frame.'],['Define the scope','We agree the service, deliverables and next steps.'],['Develop & coordinate','Review the drawings and resolve the details together.'],['Deliver with clarity','Receive the agreed package for your project’s next stage.']].map(([title,body],i) => <article key={title}><span>0{i+1}<ArrowRight size={17}/></span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

      <section className="contact-section section-wrap" id="contact"><div className="contact-copy"><span className="eyebrow">05 / LET’S BUILD SOMETHING CLEAR</span><h2>Big plans.<br/>Small additions.<br/><em>Let’s talk.</em></h2><p>Tell us what you’re working on.<br/>We’ll help you find the right starting point.</p><a href="mailto:kdxdrafting@outlook.com.au"><Mail size={17}/>kdxdrafting@outlook.com.au</a><a href="tel:+61402415169"><Phone size={17}/>0402 415 169</a><a href="https://www.google.com/maps/search/?api=1&query=Nowra%20NSW%202541%20Australia" target="_blank" rel="noopener noreferrer"><MapPin size={17}/>Nowra, NSW 2541 <ArrowUpRight size={14}/></a></div><form className="contact-form" onSubmit={submitEnquiry}><span className="form-title">A FEW DETAILS TO GET US STARTED <ArrowUpRight size={19}/></span><div className="form-row"><label>Your name<input name="name" autoComplete="name" placeholder="Full name" required maxLength={100}/></label><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@company.com" required maxLength={254}/></label></div><label>What can we help with?<select name="service" required value={enquiryService} onChange={e => setEnquiryService(e.target.value)}><option value="" disabled>Select your service</option><option>Steel detailing</option><option>Architectural drafting</option><option>Both services</option><option>I’d like to discuss my project</option></select></label><label>Project location <small>(optional)</small><input name="location" placeholder="Suburb or town" autoComplete="address-level2" maxLength={150}/></label><label>A little about your project<textarea name="message" rows={3} placeholder="A new home, an extension, a steel frame… Tell us what you have in mind." required maxLength={5000}/></label><button className="button" type="submit">Prepare my enquiry <ArrowUpRight size={19}/></button><p className="form-note">Opens a draft in your email app for you to review and send.</p>{emailReady && <p className="form-status" role="status">Your email draft is ready to open. If no email app opens, contact us at kdxdrafting@outlook.com.au.</p>}</form></section>
    </main>
    <footer className="site-footer"><div className="footer-top"><Logo/><p>Considered drawings.<br/>Better beginnings.</p><a className="text-link" href="#top">Back to top <ArrowUpRight size={18}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} KDX Drafting Service</span><span>STEEL DETAILING + ARCHITECTURAL DRAFTING</span><span>NOWRA, AUSTRALIA</span></div></footer>
    <dialog ref={dialog} className="project-dialog" aria-labelledby="project-dialog-title" onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={e => {if(e.target === e.currentTarget) setSelected(null);}}>{selected && <div className="dialog-inner"><div className="dialog-top"><span>{selected.id} / {selected.category}</span><button autoFocus onClick={() => setSelected(null)} aria-label="Close project"><X size={22}/></button></div><img src={`${base}/images/projects/${selected.image}.jpg`} alt={`${selected.name} — original project model, enlarged`}/><div className="dialog-copy"><span className="eyebrow">{selected.location}</span><h2 id="project-dialog-title">{selected.name}</h2><p>{selected.detail}</p><small>Original KDX steel model · Completed project archive</small><a href="#contact" className="text-link" onClick={() => {setSelected(null);setEnquiryService('Steel detailing');}}>Have a similar project? <ArrowUpRight size={17}/></a></div></div>}</dialog>
  </>;
}

