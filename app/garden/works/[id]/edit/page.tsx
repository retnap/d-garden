import type { Metadata } from 'next';
import { WorkEditContent } from '@/components/garden/WorkDetailContent';

export const metadata: Metadata = { title: 'Yazıyı düzenle' };

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkEditContent id={id} />;
}
