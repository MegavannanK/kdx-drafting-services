import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'KDX — Precision in every connection', description: 'Steel detailing, 3D modelling and fabrication-ready drafting services across Australia. Built with precision. Delivered with confidence.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en-AU" data-scroll-behavior="smooth"><body>{children}</body></html>; }
