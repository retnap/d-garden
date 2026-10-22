'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, CircleCheckBig, FilePenLine, FileX, Pencil, Trash2, Undo2 } from 'lucide-react';
import { sanitizeRichText } from '@/components/write/editorExtensions';
import { WORK_STATUS_LABELS, WORK_TYPE_LABELS } from '@/lib/garden/constants';
import { countWords, htmlToText } from '@/lib/garden/selectors';
import { removeWork, restoreWork, updateWork, useGarden } from '@/lib/garden/store';
import { ConfirmDialog } from './Modal';
import { useToast } from './Toast';
import WorkEditor from './WorkEditor';
import { Badge, DemoBadge, EmptyState, PageContainer, PageHeader, buttonStyles, formatDate } from './ui';

export function WorkNotFound() {
  return (
    <PageContainer>
      <EmptyState
        icon={FileX}
        title="Bu yazı bulunamadı"
        description="Yazı silinmiş ya da bağlantı hatalı olabilir."
        action={
          <Link href="/garden/works" className={buttonStyles()}>
            Yazılarıma dön
          </Link>
        }
      />
    </PageContainer>
  );
}

export function WorkEditContent({ id }: { id: string }) {
  const { works } = useGarden();
  const work = works.find((w) => w.id === id);
  if (!work) return <WorkNotFound />;
  return (
    <PageContainer>
      <PageHeader
        back={{ href: `/garden/works/${work.id}`, label: 'Yazıya dön' }}
        eyebrow="Düzenle"
        title={work.title || 'Başlıksız yazı'}
        description="Yazıların yalnızca bu tarayıcıda saklanır. Herkese açık yayınlama ileride eklenecek."
      />
      <WorkEditor key={work.id} work={work} />
    </PageContainer>
  );
}

export function NewWorkContent({ bookId }: { bookId?: string }) {
  return (
    <PageContainer>
      <PageHeader
        back={{ href: '/garden/works', label: 'Yazılarıma dön' }}
        eyebrow="Yeni yazı"
        title="Düşüncelerini yazıya dök"
        description="Yazıların yalnızca bu tarayıcıda saklanır. Herkese açık yayınlama ileride eklenecek."
      />
      <WorkEditor defaultBookId={bookId} />
    </PageContainer>
  );
}

export default function WorkDetailContent({ id }: { id: string }) {
  const { works, books } = useGarden();
  const router = useRouter();
  const toast = useToast();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const work = works.find((w) => w.id === id);
  if (!work) return removing ? null : <WorkNotFound />;

  const book = books.find((b) => b.id === work.relatedBookId);
  const words = countWords(htmlToText(work.content));
  const html = sanitizeRichText(work.content);

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        back={{ href: '/garden/works', label: 'Yazılarıma dön' }}
        title={work.title || 'Başlıksız yazı'}
        actions={
          <>
            <Link href={`/garden/works/${work.id}/edit`} className={buttonStyles({ variant: 'secondary' })}>
              <Pencil size={16} aria-hidden="true" />
              Düzenle
            </Link>
            {work.status === 'draft' ? (
              <button
                type="button"
                disabled={!work.title.trim() || words === 0}
                title={!work.title.trim() || words === 0 ? 'Tamamlamak için başlık ve içerik gerekli' : undefined}
                onClick={() => {
                  updateWork(work.id, { status: 'completed' });
                  toast({ title: 'Yazı tamamlandı' });
                }}
                className={buttonStyles()}
              >
                <CircleCheckBig size={17} aria-hidden="true" />
                Tamamla
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  updateWork(work.id, { status: 'draft' });
                  toast({ title: 'Yazı taslaklara alındı' });
                }}
                className={buttonStyles({ variant: 'ghost' })}
              >
                <Undo2 size={16} aria-hidden="true" />
                Taslağa al
              </button>
            )}
            <button type="button" onClick={() => setConfirmRemove(true)} className={buttonStyles({ variant: 'ghost' })}>
              <Trash2 size={16} aria-hidden="true" />
              Sil
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-light">
        <Badge tone={work.status === 'completed' ? 'green' : 'neutral'} icon={work.status === 'completed' ? CircleCheckBig : FilePenLine}>
          {WORK_STATUS_LABELS[work.status]}
        </Badge>
        <Badge>{WORK_TYPE_LABELS[work.type]}</Badge>
        {work.isDemo && <DemoBadge />}
        <span>
          {words} kelime · {formatDate(work.updatedAt)} güncellendi
        </span>
      </div>

      {(book || work.tags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {book && (
            <Link
              href={`/garden/library/${book.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-sm text-forest hover:border-sage"
            >
              <BookOpen size={15} aria-hidden="true" />
              {book.title}
            </Link>
          )}
          {work.tags.map((t) => (
            <span key={t} className="rounded-full bg-mint px-2.5 py-1 text-xs text-forest">
              #{t}
            </span>
          ))}
        </div>
      )}

      <article className="rounded-3xl border border-line bg-white px-5 py-7 sm:px-10 sm:py-10">
        {html ? (
          // İçerik editör şemasından geçirilerek temizlenmiştir (sanitizeRichText)
          <div className="rich-text-preview" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-sm text-ink-light">Bu yazının henüz içeriği yok.</p>
        )}
      </article>

      <ConfirmDialog
        open={confirmRemove}
        title="Yazı silinsin mi?"
        description={`“${work.title || 'Başlıksız yazı'}” silinecek. Hemen ardından geri alabilirsin.`}
        confirmLabel="Yazıyı sil"
        onCancel={() => setConfirmRemove(false)}
        onConfirm={() => {
          setConfirmRemove(false);
          setRemoving(true);
          const removed = removeWork(work.id);
          router.push('/garden/works');
          if (removed)
            toast({
              title: 'Yazı silindi',
              action: { label: 'Geri al', onClick: () => restoreWork(removed.work, removed.index) },
            });
        }}
      />
    </PageContainer>
  );
}
