'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowUp, Facebook, Instagram, Linkedin } from 'lucide-react';
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
    let raf = 0, visible = false, nextMeteor = 0, mx = 0, my = 0, px = 0, py = 0, moved = -1e9, fx = 0, fy = 0;

    // A soft glow sprite: real stars bloom with a smooth falloff, not a ring.
    const glow = document.createElement('canvas');
    glow.width = glow.height = 64;
    const gx = glow.getContext('2d')!, gg = gx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gg.addColorStop(0, 'rgba(255,255,255,1)'); gg.addColorStop(.12, 'rgba(255,255,255,.55)');
    gg.addColorStop(.35, 'rgba(255,255,255,.12)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
    gx.fillStyle = gg; gx.fillRect(0, 0, 64, 64);

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Many faint stars, very few bright ones, as in a real sky.
      stars = Array.from({ length: Math.round(w * h / 2200) }, () => {
        const z = Math.random();
        return { x: Math.random() * w, y: Math.random() * h, r: .22 + z * z * z * 1.5, z, a: .18 + Math.random() * .6, tw: .3 + Math.random() * 1.4, ph: Math.random() * 6.28, c: TINTS[Math.random() * TINTS.length | 0] };
      });
      if (reduced || !visible) draw(performance.now());
    };

    const spawn = (t: number) => {
      const dir = Math.random() < .5 ? -1 : 1;
      const angle = (16 + Math.random() * 18) * Math.PI / 180;
      const speed = 620 + Math.random() * 520;
      meteors.push({ x: w * (dir > 0 ? .05 + Math.random() * .55 : .4 + Math.random() * .55), y: h * Math.random() * .4, vx: Math.cos(angle) * speed * dir, vy: Math.sin(angle) * speed, len: 120 + Math.random() * 160, born: t, life: 700 + Math.random() * 600 });
      nextMeteor = t + 2600 + Math.random() * 5200;
    };

    // The sky turns slowly: nearer stars drift a touch faster (a few px a second).
    const pos = (s: Star, t: number) => {
      const drift = reduced ? 0 : t / 1000 * (1.2 + s.z * 4.5);
      const wrap = (v: number, m: number) => ((v % m) + m) % m - 10;
      return [wrap(s.x + drift - px * s.z * 14, w + 20), wrap(s.y - drift * .18 - py * s.z * 8, h + 20)] as const;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      px += (mx - px) * .04; py += (my - py) * .04;
      const sec = t / 1000;
      for (const s of stars) {
        // Scintillation: two out-of-step waves, so twinkle never looks metronomic.
        const flick = reduced ? 1 : .62 + .26 * Math.sin(sec * s.tw + s.ph) + .12 * Math.sin(sec * s.tw * 2.7 + s.ph * 1.7);
        const alpha = s.a * flick;
        const [x, y] = pos(s, t);
        if (s.r > .95) {
          const g = s.r * 7 * (.85 + .15 * flick);
          ctx.globalAlpha = alpha * .28;
          ctx.drawImage(glow, x - g, y - g, g * 2, g * 2);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = `rgba(${s.c},${alpha.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283); ctx.fill();
      }
      if (reduced) return;

      // Constellations: bright stars near a focus link up like a network.
      // The focus is the pointer; left alone, it drifts slowly on its own.
      const live = t - moved < 2500;
      const tx = live ? (mx + .5) * w : w * (.5 + .36 * Math.sin(t / 9000)), ty = live ? (my + .5) * h : h * (.42 + .22 * Math.cos(t / 7000));
      fx += (tx - fx) * .05; fy += (ty - fy) * .05;
      const R = Math.min(240, w * .3), near: [number, number, number][] = [];
      for (const s of stars) {
        if (s.r < .7) continue;
        const [x, y] = pos(s, t), d = Math.hypot(x - fx, y - fy);
        if (d < R) near.push([x, y, 1 - d / R]);
      }
      ctx.lineWidth = .6;
      for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) {
        const [x1, y1, k1] = near[i], [x2, y2, k2] = near[j], d = Math.hypot(x1 - x2, y1 - y2);
        if (d > 110) continue;
        const a = (1 - d / 110) * Math.min(k1, k2) * .2;
        ctx.strokeStyle = `rgba(200,220,240,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      for (const [x, y, k] of near) {
        ctx.fillStyle = `rgba(220,232,245,${(k * .22).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, .9 + k * .6, 0, 6.283); ctx.fill();
      }

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
      if (event.pointerType === 'mouse') moved = performance.now();
    };
    build(); ro.observe(canvas); io.observe(canvas);
    host.addEventListener('pointermove', move);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); host.removeEventListener('pointermove', move); };
  }, []);

  return <canvas ref={ref} className="sf-sky" aria-hidden="true"/>;
}

/**
 * Site footer, shared by every page: a night sky to close the scroll.
 * One calm row of links, a quiet base row, and the wordmark resting at
 * the very end, its lower half dissolving into space.
 */
export default function SiteFooter({ home = true, onEnquire }: { home?: boolean; onEnquire?: (service: string) => void }) {
  const root = useRef<HTMLElement>(null);

  function toTop() {
    const instant = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: instant ? 'instant' : 'smooth' });
  }
  const to = (id: string) => home ? `#${id}` : `/#${id}`;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.classList.add('is-in'); io.disconnect(); } }, { threshold: .15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const internal = (href: string, children: React.ReactNode) => home ? <a href={href}>{children}</a> : <Link href={href}>{children}</Link>;

  return <footer ref={root} className="sf" data-tone="dark">
    <Starfield/>
    <div className="sf-nebula" aria-hidden="true"/>
    <div className="sf-aurora" aria-hidden="true"><i/><i/><i/></div>

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

      <p className="sf-copy">
        <span>© {new Date().getFullYear()} KDX Drafting Service</span>
        <span>Nowra, NSW · Drafting Australia‑wide</span>
      </p>

      <div className="sf-links">
        <nav aria-label="Explore">
          <span className="sf-kicker">Explore</span>
          <ul>
            {EXPLORE.map(([label, id]) => <li key={id}>{internal(to(id), label)}</li>)}
            <li><Link href="/projects/">Steel projects</Link></li>
            <li><Link href="/architecture/">Architectural projects</Link></li>
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

    <div className="sf-end">
      <div className="sf-meta">
        <button type="button" className="sf-up" onClick={toTop}>
          <span className="sf-up-label">Back to top</span>
          <span className="sf-up-ring" aria-hidden="true"><span><ArrowUp size={16} strokeWidth={1.6}/><ArrowUp size={16} strokeWidth={1.6}/></span></span>
        </button>
      </div>
      <p className="sf-mark" aria-hidden="true"><span>KDX Drafting</span></p>
    </div>
  </footer>;
}
