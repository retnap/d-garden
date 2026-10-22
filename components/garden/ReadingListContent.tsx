'use client';

import { ListTodo } from 'lucide-react';
import { useGarden } from '@/lib/garden/store';
import AddBookForm from './AddBookForm';
import LibraryCollection from './LibraryCollection';
import { EmptyState, PageContainer, PageHeader } from './ui';

export default function ReadingListContent() {
  const { books } = useGarden();
  const list = books.filter((b) => b.status === 'reading-list');

  return (
    <PageContainer>
      <PageHeader
        back={{ href: '/garden', label: 'Bahçene dön' }}
        eyebrow="Sırada bekleyenler"
        title="Okuma Listem"
        description="Okumak istediğin ama henüz başlamadığın kitaplar. Hazır olduğunda bir kitapla okumaya başla."
        actions={<AddBookForm label="Listeye ekle" defaultStatus="reading-list" />}
      />
      <LibraryCollection
        books={list}
        empty={
          <EmptyState
            icon={ListTodo}
            title="Okuma listen boş"
            description="Merak ettiğin kitapları listene ekle; sırası geldiğinde tek dokunuşla okumaya başlarsın."
            action={<AddBookForm label="Listeye kitap ekle" defaultStatus="reading-list" />}
          />
        }
      />
    </PageContainer>
  );
}
