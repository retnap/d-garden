import type { Metadata } from 'next';
import AchievementsContent from '@/components/garden/AchievementsContent';

export const metadata: Metadata = { title: 'Başarılar' };

export default function AchievementsPage() {
  return <AchievementsContent />;
}
