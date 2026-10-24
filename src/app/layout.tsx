import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/brand/kdx-emblem.png` }, title: 'KDX — Steel Detailing & Architectural Drafting', description: 'Steel detailing and architectural drafting for homes, additions, sheds, commercial spaces and industrial structures. Based in Nowra, working across Australia.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en-AU" data-scroll-behavior="smooth"><body>{children}</body></html>; }
