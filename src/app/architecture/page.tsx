import type { Metadata } from 'next';
import Archive from '@/components/archive';

export const metadata: Metadata = {
  title: 'Architectural projects — KDX Drafting Service',
  description: 'Architectural design and documentation by KDX: new homes, additions and alterations, and modular builds across Australia.',
};

export default function ArchitecturePage() {
  return <Archive kind="arch"/>;
}
