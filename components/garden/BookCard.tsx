'use client';

import Link from 'next/link';
import { BookOpenText, FilePenLine, Play, RotateCcw } from 'lucide-react';
import { getReadingProgress, getSummaryState } from '@/lib/garden/selectors';
import { runEvaluation, setReadingStatus } from '@/lib/garden/store';
import type { LibraryBook } from '@/lib/garden/types';
import BookCover from './BookCover';
import { useToast } from './Toast';
import { DemoBadge, ProgressBar, ReadingStatusBadge, SummaryStatusBadge, buttonStyles } from './ui';

/** Kitabın o anki durumuna göre en anlamlı tek aksiyon */
export function BookQuickAction({ book }: { book: LibraryBook }) {
  const toast = useToast();
  const summaryState = getSummaryState(book);
  const cls = buttonStyles({ variant: 'secondary', size: 'sm', className: 'w-full' });

  if (book.status === 'reading-list') {
    return (
      <button
        type="button"
        className={cls}
        onClick={() => {
          setReadingStatus(book.id, 'reading');
          toast({ title: 'Okumaya başladın', description: `“${book.title}” Okuyorum listene taşındı.` });
        }}
      >
        <Play size={15} aria-hidden="true" />
        Okumaya başla
      </button>
    );
  }
  if (book.status === 'reading') {
    return (
      <Link href={`/garden/library/${book.id}`} className={cls}>
        <BookOpenText size={15} aria-hidden="true" />
        Okumaya devam et
      </Link>
    );
  }
  if (summaryState === 'failed') {
    return (
      <button type="button" className={cls} onClick={() => void runEvaluation(book.id)}>
        <RotateCcw size={15} aria-hidden="true" />
        Yeniden dene
      </button>
    );
  }
  if (summaryState === 'none' || summaryState === 'draft' || summaryState === 'needs-improvement') {
    return (
      <Link href={`/garden/library/${book.id}/summary`} className={cls}>
        <FilePenLine size={15} aria-hidden="true" />
        {summaryState === 'none' ? 'Özet yaz' : summaryState === 'draft' ? 'Özete devam et' : 'Özeti geliştir'}
      </Link>
    );
  }
  return null;
}

export default function BookCard({ book }: { book: LibraryBook }) {
  const progress = getReadingProgress(book);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#193128]/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative">
        <BookCover book={book} />
        <div className="absolute left-3 right-3 top-3 flex flex-wrap justify-end gap-1">
          {book.isDemo && <DemoBadge className="bg-white/95" />}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-lg leading-snug text-ink">
          <Link
            href={`/garden/library/${book.id}`}
            className="rounded after:absolute after:inset-0 after:content-[''] hover:text-forest"
          >
            {book.title}
          </Link>
        </h3>
        <p className="mt-1 truncate text-sm text-ink-light">{book.author}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <ReadingStatusBadge status={book.status} />
          {book.status === 'completed' && <SummaryStatusBadge state={getSummaryState(book)} />}
        </div>

        {book.status === 'reading' && progress !== null && (
          <ProgressBar
            className="mt-3"
            value={progress}
            label={`${book.currentPage} / ${book.pageCount} sayfa`}
          />
        )}

        <p className="mt-3 text-xs text-ink-light">{book.category}</p>

        {/* Kartın tamamı detaya gider; aksiyon butonu üstte kalır */}
        <div className="relative z-10 mt-auto pt-4 empty:hidden">
          <BookQuickAction book={book} />
        </div>
      </div>
    </article>
  );
}
