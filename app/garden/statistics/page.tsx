import type { Metadata } from 'next';
import StatisticsContent from '@/components/garden/StatisticsContent';

export const metadata: Metadata = { title: 'İstatistikler' };

export default function StatisticsPage() {
  return <StatisticsContent />;
}
