'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { EMAIL, MAP_URL, PHONE, SOCIALS } from '@/lib/site';
import './site-footer.css';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const ICONS = { instagram: Instagram, linkedin: Linkedin, facebook: Facebook } as const;
const EXPLORE = [['Expertise', 'services'], ['Selected work', 'projects'], ['How we work', 'approach'], ['The studio', 'about']] as const;
const SERVICES = [['Steel detailing', 'Steel detailing', 'steel'], ['Architectural drafting', 'Architectural drafting', 'architecture'], ['Combined projects', 'Both services', null]] as const;

type Star = { x: number; y: number; r: number; z: number; a: number; tw: number; ph: number; c: string };
type Meteor = { x: number; y: number; vx: number; vy: number; len: number; born: number; life: number };
const TINTS = ['255,255,255', '255,255,255', '255,255,255', '196,226,255', '242,222,196'];

/**
 * The night sky behind the footer: layered, twinkling stars that drift a
 * little with the pointer, and the occasional shooting star. It only runs
 * while the footer is on screen; with reduced motion it is a still sky.
 */
function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const host = canvas.parentElement!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, stars: Star[] = [], meteors: Meteor[] = [];
    let raf = 0, visible = false, nextMeteor = 0, mx = 0, my = 0, px = 0, py = 0;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.round(w * h / 2400) }, () => {
        const z = Math.random();
        return { x: Math.random() * w, y: Math.random() * h, r: .25 + z * z * 1.2, z, a: .2 + Math.random() * .65, tw: .4 + Math.random() * 1.8, ph: Math.random() * 6.28, c: TINTS[Math.random() * TINTS.length | 0] };
      });
      if (reduced || !visible) draw(performance.now());
    };

    const spawn = (t: number) => {
      const dir = Math.random() < .5 ? -1 : 1;
      const angle = (16 + Math.random() * 18) * Math.PI / 180;
      const speed = 620 + Math.random() * 520;
      meteors.push({ x: w * (dir > 0 ? .05 + Math.random() * .55 : .4 + Math.random() * .55), y: h * Math.random() * .4, vx: Math.cos(angle) * speed * dir, vy: Math.sin(angle) * speed, len: 120 + Math.random() * 160, born: t, life: 700 + Math.random() * 600 });
      nextMeteor = t + 2200 + Math.random() * 4200;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      px += (mx - px) * .04; py += (my - py) * .04;
      for (const s of stars) {
        const alpha = reduced ? s.a : s.a * (.6 + .4 * Math.sin(t / 1000 * s.tw + s.ph));
        const x = s.x - px * s.z * 14, y = s.y - py * s.z * 8;
        ctx.fillStyle = `rgba(${s.c},${alpha.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283); ctx.fill();
        if (s.r > 1.05) { ctx.fillStyle = `rgba(${s.c},${(alpha * .1).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, s.r * 4, 0, 6.283); ctx.fill(); }
      }
      if (reduced) return;
      if (t > nextMeteor) spawn(t);
      meteors = meteors.filter(m => t - m.born < m.life);
      for (const m of meteors) {
        const k = (t - m.born) / m.life;
        const fade = Math.sin(k * Math.PI);
        const hx = m.x + m.vx * (t - m.born) / 1000, hy = m.y + m.vy * (t - m.born) / 1000;
        const sp = Math.hypot(m.vx, m.vy);
        const tx = hx - m.vx / sp * m.len, ty = hy - m.vy / sp * m.len;
        const g = ctx.createLinearGradient(hx, hy, tx, ty);
        g.addColorStop(0, `rgba(255,255,255,${(.9 * fade).toFixed(3)})`);
        g.addColorStop(.25, `rgba(196,226,255,${(.35 * fade).toFixed(3)})`);
        g.addColorStop(1, 'rgba(196,226,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${(.25 * fade).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(hx, hy, 3, 0, 6.283); ctx.fill();
      }
    };

    const loop = (t: number) => { draw(t); raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) { nextMeteor = performance.now() + 900; raf = requestAnimationFrame(loop); }
    });
    const ro = new ResizeObserver(build);
    const move = (event: globalThis.PointerEvent) => {
      const rect = host.getBoundingClientRect();
      mx = (event.clientX - rect.left) / rect.width - .5; my = (event.clientY - rect.top) / rect.height - .5;
    };
    build(); ro.observe(canvas); io.observe(canvas);
    host.addEventListener('pointermove', move);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); host.removeEventListener('pointermove', move); };
  }, []);

  return <canvas ref={ref} className="sf-sky" aria-hidden="true"/>;
}

/** Saturn, drawn in the footer sky: banded globe, rings in front and behind, lit from the upper left. */
function Saturn() {
  const ring = (clip: string) => <g clipPath={`url(#${clip})`}>
    <ellipse cx="100" cy="60" rx="58" ry="13.5" fill="none" stroke="#cdb58c" strokeOpacity=".3" strokeWidth="5"/>
    <ellipse cx="100" cy="60" rx="70" ry="16.3" fill="none" stroke="url(#sat-ring)" strokeWidth="11"/>
    <ellipse cx="100" cy="60" rx="83" ry="19.4" fill="none" stroke="url(#sat-ring)" strokeOpacity=".7" strokeWidth="7"/>
    <ellipse cx="100" cy="60" rx="88" ry="20.5" fill="none" stroke="#e9d6b4" strokeOpacity=".22" strokeWidth="1"/>
  </g>;
  return <svg className="sf-saturn" viewBox="0 0 200 120" aria-hidden="true">
    <defs>
      <linearGradient id="sat-bands" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#b9a17c"/><stop offset=".14" stopColor="#e7d3ad"/><stop offset=".24" stopColor="#d2b182"/>
        <stop offset=".34" stopColor="#efdfbf"/><stop offset=".44" stopColor="#c9a26e"/><stop offset=".5" stopColor="#e9d5ae"/>
        <stop offset=".6" stopColor="#d8b989"/><stop offset=".7" stopColor="#f0e2c4"/><stop offset=".82" stopColor="#c6a173"/><stop offset="1" stopColor="#a88d68"/>
      </linearGradient>
      <radialGradient id="sat-shade" cx=".34" cy=".3" r=".8">
        <stop offset="0" stopColor="#fff" stopOpacity=".28"/><stop offset=".35" stopColor="#fff" stopOpacity="0"/>
        <stop offset=".62" stopColor="#050a12" stopOpacity=".35"/><stop offset=".9" stopColor="#050a12" stopOpacity=".92"/>
      </radialGradient>
      <linearGradient id="sat-ring" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#e9d6b4" stopOpacity=".55"/><stop offset=".45" stopColor="#f3e6cc" stopOpacity=".9"/>
        <stop offset=".8" stopColor="#8f7a5c" stopOpacity=".45"/><stop offset="1" stopColor="#3b3328" stopOpacity=".35"/>
      </linearGradient>
      <clipPath id="sat-back"><rect x="0" y="0" width="200" height="60"/></clipPath>
      <clipPath id="sat-front"><rect x="0" y="60" width="200" height="60"/></clipPath>
      <clipPath id="sat-globe"><circle cx="100" cy="60" r="34"/></clipPath>
    </defs>
    <g transform="rotate(-18 100 60)">
      {ring('sat-back')}
      <g clipPath="url(#sat-globe)">
        <rect x="66" y="26" width="68" height="68" fill="url(#sat-bands)"/>
        <ellipse cx="100" cy="71" rx="44" ry="5" fill="#0a0f18" fillOpacity=".35"/>
        <rect x="66" y="26" width="68" height="68" fill="url(#sat-shade)"/>
      </g>
      {ring('sat-front')}
    </g>
  </svg>;
}

/** A small satellite crossing the sky, solar panels out, beacon blinking. */
function Satellite() {
  return <svg className="sf-satellite" viewBox="0 0 64 28" aria-hidden="true">
    <g fill="#6f8db0" stroke="#a9c3dd" strokeWidth=".6">
      <rect x="1" y="9" width="20" height="10" rx="1"/><rect x="43" y="9" width="20" height="10" rx="1"/>
    </g>
    <path d="M6 9v10M11 9v10M16 9v10M48 9v10M53 9v10M58 9v10M1 14h20M43 14h20" stroke="#a9c3dd" strokeWidth=".4" strokeOpacity=".7"/>
    <path d="M21 14h4M39 14h4" stroke="#cfd8e0" strokeWidth="1"/>
    <rect x="25" y="8" width="14" height="12" rx="2" fill="#d9c79f" stroke="#f2e6c8" strokeWidth=".6"/>
    <path d="M32 8V3" stroke="#cfd8e0" strokeWidth=".8"/><circle cx="32" cy="2.5" r="1.4" className="sf-beacon"/>
  </svg>;
}

const easeInOut = (t: number) => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const IGNITION = 420, FLIGHT = 1700;

/**
 * Back to top as a launch: the rocket ignites on the Earth, lifts off and
 * climbs out of the top of the screen while the page rises with it,
 * leaving a glowing trail, then flares where it reaches the top.
 */
function RocketLaunch({ from, onDone }: { from: { x: number; y: number }; onDone: () => void }) {
  const rocket = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLDivElement>(null);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const start = performance.now(), scrollFrom = window.scrollY;
    const ROCKET_H = 64;
    let raf = 0, finished = false;
    const frame = (now: number) => {
      const t = now - start;
      const r = rocket.current!, tr = trail.current!;
      if (t < IGNITION) {
        const shake = Math.sin(t / 18) * 1.2 * (t / IGNITION);
        r.style.transform = `translate(${from.x - 13 + shake}px, ${from.y - ROCKET_H}px)`;
      } else {
        const k = Math.min(1, (t - IGNITION) / FLIGHT);
        const climb = k ** 2.2;
        const y = from.y - ROCKET_H - climb * (from.y + ROCKET_H + 80);
        r.style.transform = `translate(${from.x - 13}px, ${y}px)`;
        const top = Math.max(y + ROCKET_H - 6, 0);
        tr.style.transform = `translate(${from.x - 1.5}px, ${top}px)`;
        tr.style.height = `${Math.max(0, from.y - top)}px`;
        tr.style.opacity = String(1 - Math.max(0, k - .55) / .45);
        window.scrollTo({ top: scrollFrom * (1 - easeInOut(k)), behavior: 'instant' });
        if (k === 1 && !finished) { finished = true; setArrived(true); setTimeout(onDone, 900); return; }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [from, onDone]);

  return <div className="rk" aria-hidden="true">
    <div className="rk-smoke" style={{ left: from.x, top: from.y }}>{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties}/>)}</div>
    <div ref={trail} className="rk-trail"/>
    <div ref={rocket} className="rk-rocket" style={{ transform: `translate(${from.x - 13}px, ${from.y - 64}px)` }}>
      <svg viewBox="0 0 26 50" width="26" height="50">
        <defs>
          <linearGradient id="rk-body" x1="0" x2="1"><stop offset="0" stopColor="#ffffff"/><stop offset=".55" stopColor="#e4e9ee"/><stop offset="1" stopColor="#9fb0bb"/></linearGradient>
        </defs>
        <path d="M6 30 1 42l5-2zM20 30l5 12-5-2z" fill="#e9c79c"/>
        <path d="M13 1c6 7 7.5 16 7.5 27v12h-15V28C5.5 17 7 8 13 1z" fill="url(#rk-body)"/>
        <path d="M13 1c2.6 3 4.4 6.4 5.6 10.2H7.4C8.6 7.4 10.4 4 13 1z" fill="#8ec9ff"/>
        <circle cx="13" cy="19" r="3.4" fill="#0d1a24" stroke="#8ec9ff" strokeWidth="1.2"/>
        <path d="M13 30v10" stroke="#9fb0bb" strokeWidth=".8"/>
        <rect x="9" y="40" width="8" height="3.5" rx="1" fill="#62788a"/>
      </svg>
      <span className="rk-flame"/>
    </div>
    {arrived && <div className="rk-flare" style={{ left: from.x }}/>}
  </div>;
}

/**
 * Site footer, shared by every page: a night sky to close the scroll.
 * One calm row of links, then the KDX wordmark set along a planet's
 * horizon, with a satellite on a drafted orbit around it.
 */
export default function SiteFooter({ home = true, onEnquire }: { home?: boolean; onEnquire?: (service: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const arc = useRef<SVGSVGElement>(null);
  const [launch, setLaunch] = useState<{ x: number; y: number } | null>(null);

  function liftOff(event: React.MouseEvent<HTMLButtonElement>) {
    if (launch) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { window.scrollTo({ top: 0, behavior: 'instant' }); return; }
    const orb = event.currentTarget.querySelector('.sf-up-orb')!.getBoundingClientRect();
    setLaunch({ x: orb.left + orb.width / 2, y: orb.top + 4 });
  }
  const to = (id: string) => home ? `#${id}` : `/#${id}`;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.classList.add('is-in'); io.disconnect(); } }, { threshold: .15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A warm light on the wordmark: it follows the mouse, and drifts along
  // the word on its own when the mouse is elsewhere.
  useEffect(() => {
    const svg = arc.current;
    const light = svg?.querySelector('#sf-lit-mask');
    if (!svg || !light || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, x = 400, y = 250, target: [number, number] | null = null;
    const loop = (t: number) => {
      const [tx, ty] = target ?? [800 + Math.sin(t / 2600) * 420, 255 + Math.cos(t / 3100) * 25];
      x += (tx - x) * .08; y += (ty - y) * .08;
      light.setAttribute('cx', x.toFixed(1)); light.setAttribute('cy', y.toFixed(1));
      raf = requestAnimationFrame(loop);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM()?.inverse());
      target = [point.x, point.y];
    };
    const leave = () => { target = null; };
    const io = new IntersectionObserver(([entry]) => { cancelAnimationFrame(raf); if (entry.isIntersecting) raf = requestAnimationFrame(loop); });
    io.observe(svg);
    svg.addEventListener('pointermove', move); svg.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); io.disconnect(); svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerleave', leave); };
  }, []);

  const internal = (href: string, children: React.ReactNode) => home ? <a href={href}>{children}</a> : <Link href={href}>{children}</Link>;

  return <footer ref={root} className="sf" data-tone="dark">
    <Starfield/>
    <div className="sf-nebula" aria-hidden="true"/>
    <div className="sf-sat-track" aria-hidden="true"><Satellite/></div>

    <div className="sf-top">
      <div className="sf-lead">
        <p className="sf-statement">Considered drawings.<br/><em>Better beginnings.</em></p>
        <div className="sf-social">
          <span>Follow the work</span>
          <ul>
            {SOCIALS.map(({ key, label, href }) => {
              const Icon = ICONS[key];
              return <li key={key}>{href
                ? <a href={href} target="_blank" rel="noopener noreferrer" className="sf-orb" aria-label={label} data-tip={label}><Icon size={17} strokeWidth={1.6}/></a>
                : <span className="sf-orb is-soon" aria-label={`${label} (coming soon)`} role="img" data-tip={`${label} · soon`}><Icon size={17} strokeWidth={1.6}/></span>}</li>;
            })}
          </ul>
        </div>
      </div>

      <div className="sf-links">
        <nav aria-label="Explore">
          <span className="sf-kicker">Explore</span>
          <ul>
            {EXPLORE.map(([label, id]) => <li key={id}>{internal(to(id), label)}</li>)}
            <li><Link href="/projects/">All projects</Link></li>
          </ul>
        </nav>
        <nav aria-label="Services">
          <span className="sf-kicker">Services</span>
          <ul>
            {SERVICES.map(([label, value, param]) => <li key={label}>{home
              ? <a href="#contact" onClick={() => onEnquire?.(value)}>{label}</a>
              : <a href={`${base}/${param ? `?service=${param}` : ''}#contact`}>{label}</a>}</li>)}
          </ul>
        </nav>
        <div>
          <span className="sf-kicker">Contact</span>
          <ul>
            <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
            <li><a href={PHONE.href}>{PHONE.label}</a></li>
            <li><a href={MAP_URL} target="_blank" rel="noopener noreferrer">Nowra, NSW</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div className="sf-arc">
      <div className="sf-saturn-wrap"><Saturn/></div>
      <svg ref={arc} viewBox="0 110 1600 370" aria-hidden="true">
        <defs>
          <linearGradient id="sf-fill" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="400">
            <stop offset=".18" stopColor="#f7f5ef"/><stop offset=".52" stopColor="#cfe5fb"/><stop offset=".82" stopColor="#8ec9ff" stopOpacity=".4"/><stop offset="1" stopColor="#8ec9ff" stopOpacity=".1"/>
          </linearGradient>
          <linearGradient id="sf-lit-fill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff"/><stop offset="1" stopColor="#e9c79c"/></linearGradient>
          <radialGradient id="sf-lit-mask" gradientUnits="userSpaceOnUse" cx="400" cy="250" r="230">
            <stop offset="0" stopColor="#fff"/><stop offset=".4" stopColor="#fff" stopOpacity=".4"/><stop offset=".72" stopColor="#fff" stopOpacity="0"/>
          </radialGradient>
          <mask id="sf-lit" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="600"><rect width="1600" height="600" fill="url(#sf-lit-mask)"/></mask>
          <radialGradient id="sf-body" cx=".5" cy="0" r=".6">
            <stop offset="0" stopColor="#12263a"/><stop offset=".35" stopColor="#070d14"/><stop offset="1" stopColor="#04070c"/>
          </radialGradient>
          <radialGradient id="sf-dawn"><stop offset="0" stopColor="#e9c79c" stopOpacity=".25"/><stop offset=".38" stopColor="#8ec9ff" stopOpacity=".15"/><stop offset="1" stopColor="#8ec9ff" stopOpacity="0"/></radialGradient>
          <filter id="sf-blur" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
          <filter id="sf-soft" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
          <path id="sf-word-path" d="M-708 1500A1508 1188 0 0 1 2308 1500"/>
          <path id="sf-orbit-path" d="M150 250a650 104 0 1 0 1300 0a650 104 0 1 0-1300 0"/>
        </defs>

        <g transform="rotate(-3 800 250)">
          <use href="#sf-orbit-path" className="sf-orbit"/>
          <circle r="3.4" className="sf-sat"><animateMotion dur="28s" repeatCount="indefinite"><mpath href="#sf-orbit-path"/></animateMotion></circle>
        </g>
        <ellipse className="sf-dawn" cx="800" cy="320" rx="560" ry="150" fill="url(#sf-dawn)"/>

        <g className="sf-word">
          <text className="sf-glyphs" fill="url(#sf-fill)"><textPath href="#sf-word-path" startOffset="50%" textAnchor="middle">KDX <tspan>Drafting</tspan></textPath></text>
          <text className="sf-glyphs" fill="url(#sf-lit-fill)" mask="url(#sf-lit)"><textPath href="#sf-word-path" startOffset="50%" textAnchor="middle">KDX <tspan>Drafting</tspan></textPath></text>
        </g>

        <ellipse cx="800" cy="1500" rx="1500" ry="1180" fill="none" stroke="#8ec9ff" strokeOpacity=".3" strokeWidth="44" filter="url(#sf-blur)"/>
        <ellipse cx="800" cy="1500" rx="1500" ry="1180" fill="url(#sf-body)"/>
        <ellipse cx="800" cy="1500" rx="1500" ry="1180" fill="none" stroke="#8ec9ff" strokeOpacity=".45" strokeWidth="5" filter="url(#sf-soft)"/>
        <ellipse cx="800" cy="1500" rx="1500" ry="1180" fill="none" stroke="#8ec9ff" strokeOpacity=".4" strokeWidth="1"/>
      </svg>
      <div className="sf-base">
        <span>© {new Date().getFullYear()} KDX Drafting Service</span>
        <i aria-hidden="true"/>
        <span>Nowra, NSW · Drafting Australia-wide</span>
      </div>
      <button type="button" className="sf-up" data-flying={!!launch} onClick={liftOff}><span className="sf-up-label">Back to top</span><span className="sf-up-orb"><span className="sf-earth" aria-hidden="true"/></span></button>
      {launch && createPortal(<RocketLaunch from={launch} onDone={() => setLaunch(null)}/>, document.body)}
    </div>
  </footer>;
}
