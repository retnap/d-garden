import type { ReactNode } from 'react';
import GardenShell from '@/components/garden/GardenShell';

type GardenLayoutProps = {
  children: ReactNode;
};

export default function GardenLayout({
  children,
}: GardenLayoutProps) {
  return <GardenShell>{children}</GardenShell>;
}
