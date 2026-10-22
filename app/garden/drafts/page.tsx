import type { Metadata } from 'next';
import DraftsContent from '@/components/garden/DraftsContent';

export const metadata: Metadata = { title: 'Taslaklar' };

export default function DraftsPage() {
  return <DraftsContent />;
}
