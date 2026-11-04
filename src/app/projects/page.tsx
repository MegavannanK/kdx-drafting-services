import type { Metadata } from 'next';
import Archive from '@/components/archive';

export const metadata: Metadata = {
  title: 'Steel projects — KDX Drafting Service',
  description: 'Completed steel detailing projects by KDX: residential frames, sheds and industrial structures, shown from our original project models.',
};

export default function ProjectsPage() {
  return <Archive kind="steel"/>;
}
