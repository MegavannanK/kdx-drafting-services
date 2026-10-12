'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const updatePreference = () => {
      setEnabled(!motion.matches && !connection?.saveData);
      setPaused(false);
    };
    updatePreference();
    motion.addEventListener('change', updatePreference);
    return () => motion.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let inView = true;
    const syncPlayback = () => {
      if (enabled && !paused && inView && !document.hidden) {
        // Browsers may block autoplay; keep the poster and manual play control.
        void video.play().catch(() => setPlaying(false));
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.01 });
    observer.observe(video);
    document.addEventListener('visibilitychange', syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      video.pause();
    };
  }, [enabled, paused]);

  return <>
    <div className="hero-image" style={{ backgroundImage: `url(${basePath}/images/architecture-video-poster.jpg)` }} aria-hidden="true" />
    <video
      ref={videoRef}
      className={`hero-video ${ready && !failed ? 'hero-video-ready' : ''}`}
      src={enabled ? `${basePath}/videos/architecture-hero.mp4` : undefined}
      poster={`${basePath}/images/architecture-video-poster.jpg`}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlaying={() => { setReady(true); setPlaying(true); }}
      onPause={() => setPlaying(false)}
      onError={() => { setFailed(true); setPlaying(false); }}
    />
    {!failed && <button
      type="button"
      className="hero-video-control"
      aria-label={playing ? 'Pause background video' : 'Play background video'}
      onClick={() => {
        setEnabled(true);
        setPaused(playing);
        if (!playing) void videoRef.current?.play().catch(() => setPlaying(false));
      }}
    >
      {playing ? <Pause size={14} /> : <Play size={14} />}
      <span>{playing ? 'Pause film' : 'Play film'}</span>
    </button>}
  </>;
}
