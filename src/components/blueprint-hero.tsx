'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, RotateCcw } from 'lucide-react';
import { DURATION, PHASES, REVEAL_AT, clamp01, duskAt, phaseAt } from './blueprint-timeline';
import './blueprint-hero.css';

const BlueprintScene = dynamic(() => import('./blueprint-scene'), { ssr: false });
const SEEN_KEY = 'kdx-intro-seen';
const readSeen = () => { try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; } };
const writeSeen = () => { try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* storage unavailable */ } };

/**
 * Landing film. First visit: the building is the only thing on screen while it
 * is drawn, framed and built; then it steps aside and the page UI arrives.
 * Any scroll, key or tap (or "Skip") fast-forwards. Later visits in the same
 * session start with the UI in place and a quicker build.
 */
export default function BlueprintHero({ onReveal }: { onReveal?: () => void }) {
  const host = useRef<HTMLElement>(null);
  const clock = useRef(0);
  const speed = useRef(1);
  const revealedRef = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  const bar = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef(-1);
  const doneRef = useRef(false);
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [frozen, setFrozen] = useState(false);
  const [revision, setRevision] = useState(0);

  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
    writeSeen();
    onReveal?.();
  }, [onReveal]);

  const skip = useCallback(() => {
    if (clock.current < DURATION) speed.current = 5;
    reveal();
  }, [reveal]);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const query = new URLSearchParams(window.location.search);
    const frozenAt = Number(query.get('frame')); // QA hook: ?frame=6.5 freezes the film at that second.
    if (frozenAt > 0) {
      clock.current = Math.min(DURATION, frozenAt);
      setFrozen(true);
      if (frozenAt >= REVEAL_AT) reveal();
    } else if (motion.matches) {
      clock.current = DURATION;
      setReduced(true);
      reveal();
    } else if (readSeen() && query.get('intro') !== '1') {
      speed.current = 1.6;
      reveal();
    }

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .02 });
    if (host.current) observer.observe(host.current);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const value = clamp01(window.scrollY / Math.max(1, window.innerHeight));
        scroll.current = value;
        host.current?.style.setProperty('--scroll', value.toFixed(4));
      });
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointer.current = { x: event.clientX / window.innerWidth * 2 - 1, y: event.clientY / window.innerHeight * 2 - 1 };
    };
    // Intent to move on during the intro fast-forwards the film rather than fighting it.
    const onIntent = () => { if (!revealedRef.current) skip(); };
    const onKey = (event: KeyboardEvent) => { if (!event.metaKey && !event.ctrlKey && !event.altKey) onIntent(); };
    // If WebGL is slow to start, never hold the page hostage.
    const fallback = window.setTimeout(() => { if (clock.current === 0) reveal(); }, 4500);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('wheel', onIntent, { passive: true });
    window.addEventListener('touchmove', onIntent, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('wheel', onIntent);
      window.removeEventListener('touchmove', onIntent);
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(fallback);
      cancelAnimationFrame(frame);
    };
  }, [reveal, skip]);

  useEffect(() => { if (failed) reveal(); }, [failed, reveal]);

  // Called every rendered frame by the scene; writes straight to the DOM to avoid re-renders.
  const onTick = useCallback((time: number) => {
    if (bar.current) bar.current.style.transform = `scaleX(${clamp01(time / REVEAL_AT).toFixed(3)})`;
    host.current?.style.setProperty('--dusk', duskAt(time).toFixed(3));
    const next = phaseAt(time);
    if (next !== phaseRef.current) { phaseRef.current = next; setPhase(next); }
    if (time >= REVEAL_AT) reveal();
    const finished = time >= DURATION;
    if (finished !== doneRef.current) {
      doneRef.current = finished; setDone(finished);
      if (finished) { setReplaying(false); speed.current = 1; }
    }
  }, [reveal]);

  function replay() {
    clock.current = 0;
    speed.current = 1;
    setReplaying(true);
    setRevision(v => v + 1);
  }

  const running = !frozen && inView && tabVisible && (!reduced || replaying);
  const state = [ready && 'is-ready', revealed && 'is-revealed', failed && 'is-failed'].filter(Boolean).join(' ');

  return <section id="top" ref={host} className={`bp-hero ${state}`} aria-label="KDX Drafting Service">
    <div className="bp-stage" aria-hidden="true">
      {!failed && <BlueprintScene clock={clock} speed={speed} revealed={revealedRef} pointer={pointer} scroll={scroll} running={running} reduced={reduced} revision={revision} onTick={onTick} onReady={() => setReady(true)} onFailure={() => setFailed(true)}/>}
    </div>
    <div className="bp-shade" aria-hidden="true"/>

    <div className="bp-loader" aria-hidden="true"><span/></div>

    <div className="bp-intro" aria-hidden={revealed}>
      <span className="bp-intro-phase" key={phase}><small>0{phase + 1}</small>{PHASES[phase].name}</span>
      <span className="bp-intro-bar"><span ref={bar}/></span>
      <button type="button" className="bp-skip" onClick={skip} tabIndex={revealed ? -1 : 0}>Skip intro</button>
    </div>

    <div className="bp-content" aria-hidden={!revealed}>
      <p className="bp-eyebrow">Steel detailing <i/> Architecture design and drafting</p>
      <h1 className="bp-title">
        <span className="bp-line"><span>Drawn to be</span></span>
        <span className="bp-line"><span><em>built.</em></span></span>
      </h1>
      <p className="bp-lede">Precise drawings for homes, sheds and commercial projects — from Nowra to anywhere in Australia.</p>
      <div className="bp-actions">
        <a className="bp-button" href="#contact" tabIndex={revealed ? 0 : -1}>Start a project <span className="bp-button-icon"><ArrowUpRight size={16}/></span></a>
        <a className="bp-link" href="#projects" tabIndex={revealed ? 0 : -1}>See our work <ArrowRight size={16}/></a>
      </div>
    </div>

    <div className="bp-meta">
      <a href="#services" className="bp-scroll" tabIndex={revealed ? 0 : -1}><span aria-hidden="true"/>Scroll</a>
      <div className="bp-meta-end">
        <span>Illustrative concept</span>
        {!failed && <button type="button" className="bp-replay" onClick={replay} aria-label="Replay the build" disabled={!done} tabIndex={done ? 0 : -1}><RotateCcw size={14}/></button>}
      </div>
    </div>
  </section>;
}
