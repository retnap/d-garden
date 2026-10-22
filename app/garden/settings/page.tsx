import type { Metadata } from 'next';
import SettingsContent from '@/components/garden/SettingsContent';

export const metadata: Metadata = { title: 'Ayarlar' };

export default function SettingsPage() {
  return <SettingsContent />;
}
