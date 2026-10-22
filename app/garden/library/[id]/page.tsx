import type { Metadata } from 'next';
import BookDetailContent from '@/components/garden/BookDetailContent';

export const metadata: Metadata = { title: 'Kitap detayı' };

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookDetailContent id={id} />;
}
