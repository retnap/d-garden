import type { Metadata } from 'next';
import CompletedContent from '@/components/garden/CompletedContent';

export const metadata: Metadata = { title: 'Tamamlananlar' };

export default function CompletedPage() {
  return <CompletedContent />;
}
