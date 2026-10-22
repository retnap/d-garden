import type { Metadata } from 'next';
import { NewWorkContent } from '@/components/garden/WorkDetailContent';

export const metadata: Metadata = { title: 'Yeni yazı' };

export default async function NewWorkPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { book } = await searchParams;
  return <NewWorkContent bookId={typeof book === 'string' ? book : undefined} />;
}
