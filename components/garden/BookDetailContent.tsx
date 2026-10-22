'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookX, NotebookPen, PenLine, Trash2 } from 'lucide-react';
import { READING_STATUS_LABELS, READING_STATUS_ORDER, WORK_STATUS_LABELS, WORK_TYPE_LABELS } from '@/lib/garden/constants';
import { isVerified } from '@/lib/garden/selectors';
import { removeBook, restoreBook, setReadingStatus, updateBook, useGarden } from '@/lib/garden/store';
import type { LibraryBook, ReadingStatus } from '@/lib/garden/types';
import { EditBookButton } from './AddBookForm';
import BookCover from './BookCover';
import { ConfirmDialog } from './Modal';
import ReadingProgress from './ReadingProgress';
import SummaryPanel from './SummaryEvaluation';
import { useToast } from './Toast';
import {
  DemoBadge,
  EmptyState,
  PageContainer,
  Panel,
  ReadingStatusBadge,
  buttonStyles,
  cn,
  formatDate,
  inputStyles,
} from './ui';

export function BookNotFound() {
  return (
    <PageContainer>
      <EmptyState
        icon={BookX}
        title="Bu kitap bulunamadı"
        description="Kitap kaldırılmış ya da bağlantı hatalı olabilir. Kitapların yalnızca bu tarayıcıda saklandığını unutma."
        action={
          <Link href="/garden/library" className={buttonStyles()}>
            Kitaplığıma dön
          </Link>
        }
      />
    </PageContainer>
  );
}

function StatusSwitcher({ book }: { book: LibraryBook }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, setPending] = useState<ReadingStatus | null>(null);

  function apply(status: ReadingStatus) {
    setReadingStatus(book.id, status);
    setPending(null);
    if (status === 'completed') {
      toast({ title: 'Kitap tamamlandı', description: 'Ağacının büyümesi için özetini yaz.' });
      router.push(`/garden/library/${book.id}/summary`);
    } else {
      toast({ title: 'Okuma durumu güncellendi', description: READING_STATUS_LABELS[status] });
    }
  }

  return (
    <>
      <div role="group" aria-label="Okuma durumu" className="grid grid-cols-3 gap-1 rounded-2xl bg-mist p-1">
        {READING_STATUS_ORDER.map((s) => {
          const active = book.status === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              onClick={() => {
                if (active) return;
                // Doğrulanmış kitap tamamlanandan çıkarsa ağaçtaki katkısı geri alınır: önce onay iste
                if (isVerified(book) || s === 'completed') setPending(s);
                else apply(s);
              }}
              className={cn(
                'min-h-11 rounded-xl px-2 text-xs font-semibold transition-colors sm:text-sm',
                active ? 'bg-white text-forest shadow-sm' : 'text-ink-light hover:text-forest',
              )}
            >
              {READING_STATUS_LABELS[s]}
            </button>
          );
        })}
      </div>
      <ConfirmDialog
        open={pending !== null}
        tone={pending === 'completed' ? 'primary' : 'danger'}
        title={pending === 'completed' ? 'Kitabı tamamladın mı?' : 'Durum değiştirilsin mi?'}
        description={
          pending === 'completed'
            ? 'Kitap tamamlananlara taşınacak ve özet yazma ekranına geçeceksin. Özetin doğrulanana kadar ağacın büyümez.'
            : 'Bu kitabın özeti doğrulanmış. Kitabı tamamlananlardan çıkarırsan ağacındaki katkısı da geri alınır; özetin silinmez.'
        }
        confirmLabel={pending === 'completed' ? 'Tamamla ve özet yaz' : 'Yine de değiştir'}
        onCancel={() => setPending(null)}
        onConfirm={() => pending && apply(pending)}
      />
    </>
  );
}

function NotesEditor({ book }: { book: LibraryBook }) {
  const toast = useToast();
  const [notes, setNotes] = useState(book.notes ?? '');
  const dirty = notes !== (book.notes ?? '');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        updateBook(book.id, { notes: notes.trim() || undefined });
        toast({ title: 'Notların kaydedildi' });
      }}
    >
      <label htmlFor={`notes-${book.id}`} className="sr-only">
        Kişisel notlar
      </label>
      <textarea
        id={`notes-${book.id}`}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        maxLength={4000}
        placeholder="Altını çizdiğin cümleler, aklına takılan sorular…"
        className={cn(inputStyles, 'resize-y leading-6')}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-ink-light" aria-live="polite">
          {dirty ? 'Kaydedilmemiş değişiklik var' : ''}
        </span>
        <button type="submit" disabled={!dirty} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
          Notu kaydet
        </button>
      </div>
    </form>
  );
}

export default function BookDetailContent({ id }: { id: string }) {
  const { books, works } = useGarden();
  const router = useRouter();
  const toast = useToast();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const book = books.find((b) => b.id === id);

  // Kaldırıldıktan sonra yönlendirme tamamlanana kadar "bulunamadı" ekranı gösterme
  if (!book) return removing ? null : <BookNotFound />;

  const related = works.filter((w) => w.relatedBookId === book.id);

  function remove() {
    setConfirmRemove(false);
    setRemoving(true);
    const removed = removeBook(book!.id);
    router.push('/garden/library');
    if (removed)
      toast({
        title: 'Kitap kaldırıldı',
        description: `“${removed.book.title}” kitaplığından çıkarıldı.`,
        action: { label: 'Geri al', onClick: () => restoreBook(removed.book, removed.index) },
      });
  }

  const facts = [
    { label: 'Kategori', value: book.category },
    { label: 'Sayfa', value: book.pageCount ? String(book.pageCount) : '—' },
    { label: 'Eklendi', value: formatDate(book.addedAt) },
    { label: 'Başladın', value: formatDate(book.startedAt) },
    { label: 'Bitirdin', value: formatDate(book.completedAt) },
  ];

  return (
    <PageContainer>
      <Link
        href="/garden/library"
        className="inline-flex items-center gap-2 rounded-lg text-sm text-ink-light transition-colors hover:text-forest"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Kitaplığıma dön
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
        <div className="space-y-4">
          <BookCover book={book} size="lg" className="mx-auto w-full max-w-[240px] lg:max-w-none" />
          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            <EditBookButton book={book} />
            <button type="button" onClick={() => setConfirmRemove(true)} className={buttonStyles({ variant: 'ghost' })}>
              <Trash2 size={16} aria-hidden="true" />
              Kaldır
            </button>
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <header>
            <div className="flex flex-wrap gap-2">
              <ReadingStatusBadge status={book.status} />
              {book.isDemo && <DemoBadge />}
            </div>
            <h1 className="mt-3 break-words font-display text-3xl leading-tight sm:text-4xl">{book.title}</h1>
            <p className="mt-2 text-lg text-ink-light">{book.author}</p>
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line py-4 text-sm sm:grid-cols-5">
              {facts.map((f) => (
                <div key={f.label} className="min-w-0">
                  <dt className="text-xs text-ink-light">{f.label}</dt>
                  <dd className="mt-0.5 truncate font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </header>

          <Panel aria-labelledby="status-title" className="space-y-4">
            <h2 id="status-title" className="font-display text-xl">
              Okuma durumu
            </h2>
            <StatusSwitcher book={book} />
            {book.status === 'reading' && <ReadingProgress key={book.currentPage} book={book} />}
          </Panel>

          <Panel aria-labelledby="summary-title">
            <h2 id="summary-title" className="mb-4 font-display text-xl">
              Özetin
            </h2>
            <SummaryPanel book={book} />
          </Panel>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Panel aria-labelledby="notes-title">
              <h2 id="notes-title" className="mb-1 flex items-center gap-2 font-display text-xl">
                <NotebookPen size={19} aria-hidden="true" className="text-forest" />
                Kişisel notlar
              </h2>
              <p className="mb-4 text-xs text-ink-light">Notlar özetten bağımsızdır ve değerlendirilmez.</p>
              <NotesEditor key={book.id} book={book} />
            </Panel>

            <Panel aria-labelledby="related-title">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="related-title" className="font-display text-xl">
                  İlgili yazıların
                </h2>
              </div>
              {related.length === 0 ? (
                <p className="text-sm leading-6 text-ink-light">Bu kitapla ilişkilendirdiğin bir yazı yok.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {related.map((w) => (
                    <li key={w.id}>
                      <Link href={`/garden/works/${w.id}`} className="block py-2.5 hover:text-forest">
                        <span className="block truncate text-sm font-semibold">{w.title || 'Başlıksız yazı'}</span>
                        <span className="text-xs text-ink-light">
                          {WORK_TYPE_LABELS[w.type]} · {WORK_STATUS_LABELS[w.status]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link href={`/garden/works/new?book=${book.id}`} className={buttonStyles({ variant: 'secondary', size: 'sm', className: 'mt-4' })}>
                <PenLine size={15} aria-hidden="true" />
                Bu kitap hakkında yaz
              </Link>
            </Panel>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmRemove}
        title="Kitap kaldırılsın mı?"
        description={
          <>
            “{book.title}” kitaplığından{book.summary ? ', özeti ve değerlendirmesiyle birlikte,' : ''} kaldırılacak.
            {isVerified(book) && ' Ağacındaki katkısı da geri alınır.'} İlgili yazıların silinmez.
          </>
        }
        confirmLabel="Kitabı kaldır"
        onCancel={() => setConfirmRemove(false)}
        onConfirm={remove}
      />
    </PageContainer>
  );
}
