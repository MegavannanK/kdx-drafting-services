'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

const LINKS = [['Expertise', 'services'], ['Selected work', 'projects'], ['Our process', 'approach'], ['The studio', 'about']] as const;

export function Logo({ home = true }: { home?: boolean }) {
  const img = <img src={`${base}/images/brand/kdx-logo.png`} width="1200" height="527" alt="KDX Drafting Service"/>;
  return home
    ? <a className="brand" href="#top" aria-label="KDX Drafting Service home">{img}</a>
    : <Link className="brand" href="/" aria-label="KDX Drafting Service home">{img}</Link>;
}

/**
 * Floating header: logo, pill nav and CTA, no bar. It inverts over dark
 * sections (`data-tone="dark"` or the hero) and fades a soft veil in once
 * the page has scrolled. Off the home page, links point back into it.
 */
export default function SiteHeader({ home = true, introDone = true }: { home?: boolean; introDone?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [overDark, setOverDark] = useState(home);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const href = (id: string) => home ? `#${id}` : `/#${id}`;

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > (home ? window.innerHeight * .6 : 8));
      setOverDark(Array.from(document.querySelectorAll('[data-tone="dark"], #top')).some(el => {
        const rect = el.getBoundingClientRect();
        return rect.top <= 44 && rect.bottom >= 44;
      }));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [home]);

  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenu(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menu]);

  const navLink = (id: string, children: React.ReactNode, className?: string) => home
    ? <a href={href(id)} key={id} className={className} onClick={() => setMenu(false)}>{children}</a>
    : <Link href={href(id)} key={id} className={className} onClick={() => setMenu(false)}>{children}</Link>;

  return <header className={`site-header${overDark && !menu ? ' is-over-hero' : ' is-solid'}${introDone ? '' : ' is-intro'}${scrolled ? ' is-scrolled' : ''}`}>
    <Logo home={home}/>
    <nav aria-label="Main navigation" id="main-menu" className={menu ? 'nav-open' : ''}>
      {LINKS.map(([label, id]) => navLink(id, label))}
      {navLink('contact', <>Start a project <ArrowUpRight size={16}/></>, 'mobile-contact')}
    </nav>
    {navLink('contact', <>Let’s talk <span><ArrowUpRight size={15}/></span></>, 'header-cta')}
    <button ref={menuButton} className="menu-toggle" onClick={() => setMenu(!menu)} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="main-menu">{menu ? <X/> : <Menu/>}</button>
  </header>;
}
