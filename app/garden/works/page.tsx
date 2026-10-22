import type { Metadata } from 'next';
import WorksContent from '@/components/garden/WorksContent';

export const metadata: Metadata = { title: 'Yazılarım' };

export default function WorksPage() {
  return <WorksContent />;
}
