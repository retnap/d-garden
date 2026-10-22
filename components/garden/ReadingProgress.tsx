'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookCheck } from 'lucide-react';
import { getReadingProgress } from '@/lib/garden/selectors';
import { setReadingStatus, updateProgress } from '@/lib/garden/store';
import type { LibraryBook } from '@/lib/garden/types';
import { ConfirmDialog } from './Modal';
import { useToast } from './Toast';
import { ProgressBar, buttonStyles, cn, inputStyles } from './ui';

/** Kitabı bitirir ve kullanıcıyı özet yazma akışına götürür. Kitap doğrulanmış sayılmaz. */
export function FinishBookButton({ book, className }: { book: LibraryBook; className?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setConfirming(true)} className={buttonStyles({ className })}>
        <BookCheck size={17} aria-hidden="true" />
        Bitirdim
      </button>
      <ConfirmDialog
        open={confirming}
        tone="primary"
        title="Kitabı tamamladın mı?"
        description={
          <>
            “{book.title}” tamamlananlara taşınacak. Ağacının büyümesi için ardından özetini yazıp değerlendirmeye
            göndermen gerekiyor.
          </>
        }
        confirmLabel="Tamamla ve özet yaz"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          setReadingStatus(book.id, 'completed');
          toast({ title: 'Tebrikler, kitabı bitirdin!', description: 'Şimdi öğrendiklerini kendi cümlelerinle özetle.' });
          router.push(`/garden/library/${book.id}/summary`);
        }}
      />
    </>
  );
}

export default function ReadingProgress({ book, compact = false }: { book: LibraryBook; compact?: boolean }) {
  const toast = useToast();
  const [page, setPage] = useState(String(book.currentPage ?? 0));
  const [error, setError] = useState('');
  const progress = getReadingProgress(book);
  const inputId = `progress-${book.id}`;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const n = Number(page);
    if (page.trim() === '' || !Number.isInteger(n) || n < 0) {
      setError('Geçerli bir sayfa numarası gir.');
      return;
    }
    if (book.pageCount && n > book.pageCount) {
      setError(`Kitap ${book.pageCount} sayfa.`);
      return;
    }
    setError('');
    updateProgress(book.id, n);
    toast({ title: 'İlerleme kaydedildi', description: book.pageCount ? `${n} / ${book.pageCount} sayfa` : `${n}. sayfa` });
  }

  return (
    <div className="space-y-3">
      {progress !== null ? (
        <ProgressBar value={progress} label={`${book.currentPage ?? 0} / ${book.pageCount} sayfa · %${Math.round(progress * 100)}`} />
      ) : (
        <p className="text-xs text-ink-light">
          {book.currentPage ? `${book.currentPage}. sayfadasın. ` : ''}Yüzdeyi görmek için kitaba sayfa sayısı ekle.
        </p>
      )}
      <form noValidate onSubmit={submit} className={cn('flex flex-wrap items-end gap-2', compact && 'gap-2')}>
        <div className="min-w-0 flex-1 basis-32">
          <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-ink-light">
            Kaldığın sayfa
          </label>
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={0}
            max={book.pageCount}
            value={page}
            onChange={(e) => setPage(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(inputStyles, 'py-2')}
          />
        </div>
        <button type="submit" className={buttonStyles({ variant: 'secondary', size: 'sm', className: 'min-h-10' })}>
          Kaydet
        </button>
        <FinishBookButton book={book} className="min-h-10 px-4" />
      </form>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs font-medium text-[#A23B2C]">
          {error}
        </p>
      )}
    </div>
  );
}
