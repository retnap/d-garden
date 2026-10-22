import type { Metadata } from 'next';
import DashboardContent from '@/components/garden/DashboardContent';

export const metadata: Metadata = { title: 'Bahçem' };

export default function GardenPage() {
  return <DashboardContent />;
}
