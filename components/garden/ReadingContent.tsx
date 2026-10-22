'use client';

import Link from 'next/link';
import { BookMarked, Clock } from 'lucide-react';
import { useGarden } from '@/lib/garden/store';
import type { LibraryBook } from '@/lib/garden/types';
import AddBookForm from './AddBookForm';
import BookCover from './BookCover';
import LibraryCollection from './LibraryCollection';
import ReadingProgress from './ReadingProgress';
import { DemoBadge, EmptyState, PageContainer, PageHeader, buttonStyles, formatRelative } from './ui';

function ReadingItem({ book }: { book: LibraryBook }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:p-5">
      <Link href={`/garden/library/${book.id}`} className="flex min-w-0 gap-4 sm:w-64 sm:shrink-0">
        <BookCover book={book} size="sm" className="w-16 sm:w-20" />
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-display text-lg leading-snug hover:text-forest">{book.title}</h3>
          <p className="mt-1 truncate text-sm text-ink-light">{book.author}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-light">
            <Clock size={13} aria-hidden="true" />
            {book.startedAt ? `${formatRelative(book.startedAt)} başladın` : 'Yeni başladın'}
          </p>
          {book.isDemo && <DemoBadge className="mt-2" />}
        </div>
      </Link>
      <div className="min-w-0 flex-1 sm:border-l sm:border-line sm:pl-5">
        <ReadingProgress book={book} />
      </div>
    </article>
  );
}

export default function ReadingContent() {
  const { books } = useGarden();
  const reading = books.filter((b) => b.status === 'reading');

  return (
    <PageContainer>
      <PageHeader
        back={{ href: '/garden', label: 'Bahçene dön' }}
        eyebrow="Devam eden okumalar"
        title="Okuyorum"
        description="Kaldığın sayfayı kaydet. Kitabı bitirdiğinde özetini yazarak bahçeni büyütebilirsin."
        actions={<AddBookForm label="Okumaya başladığım kitap" defaultStatus="reading" />}
      />
      <LibraryCollection
        books={reading}
        layout="list"
        renderItem={(book) => <ReadingItem book={book} />}
        empty={
          <EmptyState
            icon={BookMarked}
            title="Şu an okuduğun bir kitap yok"
            description="Okuma listendeki bir kitapla başlayabilir ya da yeni bir kitap ekleyebilirsin."
            action={
              <>
                <Link href="/garden/reading-list" className={buttonStyles({ variant: 'secondary' })}>
                  Okuma listeme git
                </Link>
                <AddBookForm label="Kitap ekle" defaultStatus="reading" />
              </>
            }
          />
        }
      />
    </PageContainer>
  );
}
