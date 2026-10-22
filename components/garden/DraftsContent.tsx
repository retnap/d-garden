'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleCheckBig, FilePenLine, FileText, PenLine, Trash2 } from 'lucide-react';
import { WORK_TYPE_LABELS } from '@/lib/garden/constants';
import { countWords, getWorkExcerpt, htmlToText } from '@/lib/garden/selectors';
import {
  discardSummaryDraft,
  findBook,
  removeWork,
  restoreSummary,
  restoreWork,
  updateWork,
  useGarden,
} from '@/lib/garden/store';
import BookCover from './BookCover';
import { ConfirmDialog } from './Modal';
import { useToast } from './Toast';
import { DemoBadge, EmptyState, PageContainer, PageHeader, Panel, buttonStyles, formatRelative } from './ui';

type PendingDelete = { kind: 'summary' | 'work'; id: string; title: string } | null;

export default function DraftsContent() {
  const { books, works } = useGarden();
  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);

  const summaryDrafts = books
    .filter((b) => b.summary?.status === 'draft')
    .sort((a, b) => (b.summary?.updatedAt ?? '').localeCompare(a.summary?.updatedAt ?? ''));
  const workDrafts = works.filter((w) => w.status === 'draft').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const bookTitle = (id?: string) => (id ? books.find((b) => b.id === id)?.title : undefined);

  function confirmDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'summary') {
      const summary = findBook(pendingDelete.id)?.summary;
      const bookId = pendingDelete.id;
      discardSummaryDraft(bookId);
      toast({
        title: 'Özet taslağı silindi',
        action: summary ? { label: 'Geri al', onClick: () => restoreSummary(bookId, summary) } : undefined,
      });
    } else {
      const removed = removeWork(pendingDelete.id);
      toast({
        title: 'Yazı taslağı silindi',
        action: removed ? { label: 'Geri al', onClick: () => restoreWork(removed.work, removed.index) } : undefined,
      });
    }
    setPendingDelete(null);
  }

  const total = summaryDrafts.length + workDrafts.length;

  return (
    <PageContainer>
      <PageHeader
        back={{ href: '/garden', label: 'Bahçene dön' }}
        eyebrow="Yarım kalanlar"
        title="Taslaklar"
        description="Yarım kalan özetlerin ve yazıların. Kaldığın yerden devam et, tamamla ya da vazgeç."
        actions={
          <Link href="/garden/works/new" className={buttonStyles()}>
            <PenLine size={17} aria-hidden="true" />
            Yeni yazı
          </Link>
        }
      />

      {total === 0 ? (
        <EmptyState
          icon={FileText}
          title="Hiç taslağın yok"
          description="Bir özeti ya da yazıyı bitirmeden kaydettiğinde burada görünür."
          action={
            <Link href="/garden/completed" className={buttonStyles({ variant: 'secondary' })}>
              Tamamlanan kitaplarım
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel aria-labelledby="summary-drafts-title">
            <h2 id="summary-drafts-title" className="font-display text-xl">
              Özet taslakları <span className="text-base text-ink-light">({summaryDrafts.length})</span>
            </h2>
            <p className="mt-1 text-sm text-ink-light">Değerlendirmeye gönderilmemiş kitap özetleri.</p>
            {summaryDrafts.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-mist p-4 text-sm text-ink-light">Bekleyen özet taslağın yok.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {summaryDrafts.map((b) => (
                  <li key={b.id} className="rounded-2xl border border-line p-4">
                    <div className="flex gap-3">
                      <BookCover book={b} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{b.title}</p>
                        <p className="text-xs text-ink-light">
                          {b.summary!.text.trim().length} karakter · {formatRelative(b.summary!.updatedAt)} düzenlendi
                        </p>
                        {b.isDemo && <DemoBadge className="mt-1.5" />}
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-light">{b.summary!.text}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/garden/library/${b.id}/summary`} className={buttonStyles({ size: 'sm' })}>
                        <FilePenLine size={15} aria-hidden="true" />
                        Devam et
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete({ kind: 'summary', id: b.id, title: b.title })}
                        className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        Sil
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel aria-labelledby="work-drafts-title">
            <h2 id="work-drafts-title" className="font-display text-xl">
              Yazı taslakları <span className="text-base text-ink-light">({workDrafts.length})</span>
            </h2>
            <p className="mt-1 text-sm text-ink-light">Henüz tamamlamadığın özgün yazıların.</p>
            {workDrafts.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-mist p-4 text-sm text-ink-light">Bekleyen yazı taslağın yok.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {workDrafts.map((w) => {
                  const words = countWords(htmlToText(w.content));
                  const related = bookTitle(w.relatedBookId);
                  return (
                    <li key={w.id} className="rounded-2xl border border-line p-4">
                      <p className="font-semibold">{w.title || 'Başlıksız yazı'}</p>
                      <p className="mt-0.5 text-xs text-ink-light">
                        {WORK_TYPE_LABELS[w.type]} · {words} kelime · {formatRelative(w.updatedAt)} düzenlendi
                        {related && ` · ${related}`}
                      </p>
                      {w.isDemo && <DemoBadge className="mt-1.5" />}
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-light">{getWorkExcerpt(w) || 'Henüz içerik yok.'}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/garden/works/${w.id}/edit`} className={buttonStyles({ size: 'sm' })}>
                          <FilePenLine size={15} aria-hidden="true" />
                          Devam et
                        </Link>
                        <button
                          type="button"
                          disabled={!w.title.trim() || words === 0}
                          title={!w.title.trim() || words === 0 ? 'Tamamlamak için başlık ve içerik gerekli' : undefined}
                          onClick={() => {
                            updateWork(w.id, { status: 'completed' });
                            toast({ title: 'Yazı tamamlandı', description: `“${w.title}” Yazılarım'a taşındı.` });
                          }}
                          className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                        >
                          <CircleCheckBig size={15} aria-hidden="true" />
                          Tamamla
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete({ kind: 'work', id: w.id, title: w.title || 'Başlıksız yazı' })}
                          className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                          Sil
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Taslak silinsin mi?"
        description={
          pendingDelete?.kind === 'summary'
            ? `“${pendingDelete.title}” için yazdığın özet taslağı silinecek. Kitap kitaplığında kalır.`
            : `“${pendingDelete?.title}” taslağı silinecek.`
        }
        confirmLabel="Taslağı sil"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </PageContainer>
  );
}
