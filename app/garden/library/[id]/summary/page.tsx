import type { Metadata } from 'next';
import SummaryEditorContent from '@/components/garden/SummaryEditorContent';

export const metadata: Metadata = { title: 'Özet yaz' };

export default async function BookSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SummaryEditorContent id={id} />;
}
