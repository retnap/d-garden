import type { Metadata } from 'next';
import ReadingContent from '@/components/garden/ReadingContent';

export const metadata: Metadata = { title: 'Okuyorum' };

export default function ReadingPage() {
  return <ReadingContent />;
}
