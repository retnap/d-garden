import type { Metadata } from 'next';
import ReadingListContent from '@/components/garden/ReadingListContent';

export const metadata: Metadata = { title: 'Okuma Listem' };

export default function ReadingListPage() {
  return <ReadingListContent />;
}
