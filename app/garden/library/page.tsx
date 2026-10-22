import type { Metadata } from 'next';
import LibraryPageContent from '@/components/garden/LibraryPageContent';

export const metadata: Metadata = {
  title: 'Kitaplığım',
};

export default function LibraryPage() {
  return <LibraryPageContent />;
}
