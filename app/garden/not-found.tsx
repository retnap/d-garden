import Link from 'next/link';
import { Sprout } from 'lucide-react';
import { EmptyState, PageContainer, buttonStyles } from '@/components/garden/ui';

export default function GardenNotFound() {
  return (
    <PageContainer>
      <EmptyState
        icon={Sprout}
        title="Bu köşede henüz bir şey yetişmedi"
        description="Aradığın sayfa bahçende bulunamadı."
        action={
          <Link href="/garden" className={buttonStyles()}>
            Bahçeme dön
          </Link>
        }
      />
    </PageContainer>
  );
}
