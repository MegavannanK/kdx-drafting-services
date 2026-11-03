'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Copy, Mail, MapPin, Phone } from 'lucide-react';
import { EMAIL, MAP_URL, PHONE } from '@/lib/site';
import './contact.css';

const SERVICES = [
  ['Steel detailing', 'Steel detailing'],
  ['Architectural drafting', 'Architectural drafting'],
  ['Both services', 'Both services'],
  ['I’d like to discuss my project', 'Not sure yet'],
] as const;

/**
 * Closing fold: the enquiry, on one night-blue screen.
 * Services are pills rather than a dropdown, so a pre-selected choice
 * (from a service card, a project or /projects) is visible at a glance.
 * Submitting prepares a draft in the visitor's email app.
 */
export default function Contact({ service, onService }: { service: string; onService: (service: string) => void }) {
  const root = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    }), { threshold: .12 });
    el.querySelectorAll('[data-reveal]').forEach(node => io.observe(node));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = `Hello KDX,\n\n${data.get('message')}\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nService: ${data.get('service')}\nProject location: ${data.get('location') || 'Not provided'}\n`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Project enquiry — ${data.get('service')}`)}&body=${encodeURIComponent(body)}`;
    setReady(true);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(EMAIL); setCopied(true); } catch { window.location.href = `mailto:${EMAIL}`; }
  }

  return <section ref={root} className="ct" id="contact" data-tone="dark" aria-labelledby="ct-title">
    <div className="ct-main">
      <div className="ct-copy">
        <p className="ct-eyebrow" data-reveal><span>05</span>Start a project</p>
        <h2 id="ct-title" className="ct-title" data-reveal>
          <span className="ct-line"><span>Big plans.</span></span>{' '}
          <span className="ct-line"><span>Small additions.</span></span>{' '}
          <span className="ct-line"><span><em>Let’s talk.</em></span></span>
        </h2>
        <p className="ct-sub" data-reveal>Tell us what you’re working on. We’ll help you find the right starting point.</p>

        <ul className="ct-ways" data-reveal>
          <li>
            <a href={`mailto:${EMAIL}`}><span><Mail size={17}/></span>{EMAIL}</a>
            <button type="button" className="ct-copy-btn" onClick={copy} aria-label={copied ? 'Email copied' : 'Copy email address'}>{copied ? <Check size={15}/> : <Copy size={15}/>}</button>
          </li>
          <li><a href={PHONE.href}><span><Phone size={17}/></span>{PHONE.label}</a></li>
          <li><a href={MAP_URL} target="_blank" rel="noopener noreferrer"><span><MapPin size={17}/></span>Nowra, NSW 2541<ArrowUpRight size={14} className="ct-ext"/></a></li>
        </ul>
        <p className="ct-live" role="status">{copied ? 'Email address copied' : ''}</p>
      </div>

      <form className="ct-form" onSubmit={submit} data-reveal>
        <div className="ct-form-top"><span>Project enquiry</span><span>Helpful to include: drawings or sketches, location, timeframe</span></div>
        <div className="ct-row">
          <label className="ct-field"><span>Your name</span><input name="name" autoComplete="name" placeholder="Full name" required maxLength={100}/></label>
          <label className="ct-field"><span>Email address</span><input name="email" type="email" autoComplete="email" placeholder="you@company.com" required maxLength={254}/></label>
        </div>
        <fieldset className="ct-services">
          <legend>What can we help with?</legend>
          <div>
            {SERVICES.map(([value, label]) => <label key={value} className="ct-chip">
              <input type="radio" name="service" value={value} required checked={service === value} onChange={() => onService(value)}/>
              <span><Check size={14}/>{label}</span>
            </label>)}
          </div>
        </fieldset>
        <label className="ct-field"><span>Project location <small>(optional)</small></span><input name="location" placeholder="Suburb or town" autoComplete="address-level2" maxLength={150}/></label>
        <label className="ct-field"><span>A little about your project</span><textarea name="message" rows={3} placeholder="A new home, an extension, a steel frame… Tell us what you have in mind." required maxLength={5000}/></label>
        <div className="ct-submit">
          <button className="ct-button" type="submit">Prepare my enquiry<span><ArrowUpRight size={17}/></span></button>
          <p>{ready ? <span role="status">Draft ready. If no email app opened, write to {EMAIL}.</span> : 'Opens a draft in your email app to review and send.'}</p>
        </div>
      </form>
    </div>

  </section>;
}
