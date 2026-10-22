'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ErrorState, PageContainer, buttonStyles } from '@/components/garden/ui';

export default function GardenError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <ErrorState
        title="Bu sayfa yüklenemedi"
        description="Beklenmeyen bir hata oluştu. Verilerin tarayıcında duruyor; sayfayı yeniden denemek çoğu zaman sorunu çözer."
        onRetry={retry}
        action={
          <Link href="/garden" className={buttonStyles({ variant: 'secondary' })}>
            Bahçeme dön
          </Link>
        }
      />
    </PageContainer>
  );
}
