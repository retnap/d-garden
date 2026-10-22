import type { Metadata } from 'next';
import WorkDetailContent from '@/components/garden/WorkDetailContent';

export const metadata: Metadata = { title: 'Yazı' };

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkDetailContent id={id} />;
}
