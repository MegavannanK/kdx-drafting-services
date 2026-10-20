'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Pause, Play, RotateCcw } from 'lucide-react';
import './construction-hero.css';

const ConstructionScene = dynamic(() => import('./construction-scene'), { ssr: false });
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const BUILD_DURATION = 28;
export const buildChapters = [
  { name: 'Foundations', start: 0, cue: 2, text: 'A clear plan. A considered beginning.' },
  { name: 'Steel frame', start: 5, cue: 9, text: 'Every member, precisely connected.' },
  { name: 'Architecture', start: 12, cue: 17, text: 'Structure gives way to spaces.' },
  { name: 'The full picture', start: 21, cue: 26, text: 'Every detail. Working together.' },
];

export default function ConstructionHero() {
  const host = useRef<HTMLElement>(null);
  const clock = useRef(0);
  const progress = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [finished, setFinished] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReduced(preference.matches);
      if (preference.matches) {
        clock.current = BUILD_DURATION;
        setChapter(3);
        setFinished(true);
        setPlaying(false);
      } else setPlaying(true);
      setRevision(value => value + 1);
    };
    update();
    preference.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: .05 });
    if (host.current) observer.observe(host.current);
    const visibility = () => setVisible(!document.hidden);
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => { preference.removeEventListener('change', update); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  function seek(index: number) {
    clock.current = buildChapters[index].cue;
    setChapter(index);
    setPlaying(false);
    setFinished(false);
    setRevision(value => value + 1);
  }
  function replay() {
    clock.current = 0;
    setChapter(0);
    setFinished(false);
    setPlaying(true);
    setRevision(value => value + 1);
  }
  return <section id="top" ref={host} className="construction-hero" aria-label="A courtyard house, from foundations to finished architecture">
    <div className="construction-overline"><span className="eyebrow"><i/> STEEL DETAILING + ARCHITECTURAL DRAFTING</span><span>NOWRA, NSW / AUSTRALIA</span></div>
    <div className="construction-film" aria-label="High-angle animated architectural concept">
      <img aria-hidden={ready && !failed} className={`construction-poster ${ready && !failed ? 'poster-hidden' : ''}`} src={`${base}/images/residential-concept.jpg`} alt="Illustrative courtyard home with exposed steel framing and finished living spaces" fetchPriority="high" width="1536" height="1024"/>
      {!failed && <ConstructionScene clock={clock} progress={progress} running={playing && active && visible} reduced={reduced} revision={revision} onReady={() => setReady(true)} onFailure={() => { setFailed(true); setPlaying(false); }} onChapter={setChapter} onComplete={() => {setPlaying(false);setFinished(true);}}/>}
    </div>
    <div className="construction-copy"><div className="film-kicker"><span/> THE MAKING OF A PLACE</div><h1>From the first line.<br/>To the <em>final detail.</em></h1><p>See structure become space. Steel detailing and architectural drafting for homes, additions and projects of every scale.</p><div className="construction-actions"><a className="button" href="#services">Explore our expertise <ArrowUpRight size={18}/></a><a href="#projects">Our completed work <ArrowRight size={17}/></a></div><div className="construction-copy-note"><span>DESIGNED IN DETAIL.</span><span>DRAWN WITH PURPOSE.</span></div></div>
    <div className="film-caption"><span className="film-location">COURTYARD HOUSE / CONCEPT 01</span><span className="film-live"><i/>{failed ? 'ARCHITECTURAL CONCEPT' : ready ? 'A BUILDING IN FOUR ACTS' : 'PREPARING THE 3D STUDY'}</span></div>
    {!failed && <div className="construction-playback"><span className="construction-stage-caption"><small>0{chapter + 1} / 04</small>{buildChapters[chapter].text}</span><div className="film-controls"><button onClick={() => finished ? replay() : setPlaying(value => !value)} aria-label={playing ? 'Pause construction film' : finished ? 'Replay construction film' : 'Play construction film'}>{playing ? <Pause size={16}/> : <Play size={16}/>}<span>{playing ? 'Pause' : finished ? 'Replay' : 'Play'}</span></button><button onClick={replay} aria-label="Restart construction film"><RotateCcw size={16}/></button></div></div>}
    <div className="construction-bottom">{!failed && <><div className="construction-timeline" role="group" aria-label="Construction film chapters">{buildChapters.map((item,index) => <button key={item.name} onClick={() => seek(index)} aria-pressed={chapter === index}><small>0{index+1}</small><span>{item.name}</span><i/></button>)}</div><div className="construction-progress"><div ref={progress}/></div></>}<div className="construction-footer"><a href="#services"><ArrowDown size={14}/> SCROLL TO EXPLORE</a><span>ILLUSTRATIVE 3D CONCEPT · NOT A COMPLETED KDX PROJECT</span><span>HOMES. SHEDS. COMMERCIAL SPACES.</span></div></div>
  </section>;
}
