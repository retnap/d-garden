'use client';

import { BookCheck, BookMarked, BookOpen, Library, Sprout } from 'lucide-react';
import { getGardenMetrics } from '@/lib/garden/selectors';
import { useGarden } from '@/lib/garden/store';
import AddBookForm from './AddBookForm';
import LibraryCollection from './LibraryCollection';
import { EmptyState, PageContainer, PageHeader, StatCard } from './ui';

export default function LibraryPageContent() {
  const data = useGarden();
  const metrics = getGardenMetrics(data);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Kişisel kütüphanen"
        title="Kitaplığım"
        description="Her kitap, bahçende açan yeni bir sayfa. Okuduklarını keşfet, düşüncelerini biriktir."
        actions={<AddBookForm />}
      />

      <section aria-label="Kitaplık özeti" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Toplam kitap" value={metrics.totalBooks} icon={BookOpen} />
        <StatCard label="Okuyorum" value={metrics.reading} icon={BookMarked} href="/garden/reading" />
        <StatCard label="Tamamlanan" value={metrics.completed} icon={BookCheck} href="/garden/completed" />
        <StatCard
          label="Doğrulanmış özet"
          value={metrics.verified}
          icon={Sprout}
          href="/garden/completed"
          hint="Ağacını yalnızca bunlar büyütür"
        />
      </section>

      <LibraryCollection
        books={data.books}
        title="Kitap koleksiyonum"
        description="Eklediğin bütün kitaplar burada bir araya gelir."
        showStatusFilter
        empty={
          <EmptyState
            icon={Library}
            title="Kitaplığın henüz boş"
            description="İlk kitabını ekleyerek bahçeni başlat. Okuduğun kitapları özetlediğinde ağacın büyür."
            action={<AddBookForm label="İlk kitabını ekle" />}
          />
        }
      />
    </PageContainer>
  );
}
