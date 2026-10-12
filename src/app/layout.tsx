import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/brand/kdx-emblem.png` }, title: 'KDX — Architecture, Interiors & Steel Structures', description: 'Architecture, interiors, steel detailing and coordinated 3D design. A complete vision for residential and commercial spaces across Australia.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en-AU" data-scroll-behavior="smooth"><body>{children}</body></html>; }
