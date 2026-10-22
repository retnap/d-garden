import type { Metadata } from 'next';
import TreeStageDemo from '@/components/garden/TreeStageDemo';

// Geçici tasarım aracı: navigasyonda yer almaz, arama motorlarına kapalı.
export const metadata: Metadata = { title: 'Ağaç aşamaları (demo)', robots: { index: false, follow: false } };

export default function TreeDemoPage() {
  return <TreeStageDemo />;
}
