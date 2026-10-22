'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookCheck, FilePenLine, LoaderCircle, RotateCcw, Save, Send, Sprout } from 'lucide-react';
import { getStage } from '@/lib/garden-tree';
import { SUMMARY_MAX_LENGTH, SUMMARY_MIN_LENGTH, SUMMARY_STATUS_DESCRIPTIONS } from '@/lib/garden/constants';
import { countWords, getSummaryState, isVerified } from '@/lib/garden/selectors';
import { runEvaluation, saveSummaryDraft, setReadingStatus, submitSummary, useGarden } from '@/lib/garden/store';
import type { LibraryBook } from '@/lib/garden/types';
import { BookNotFound } from './BookDetailContent';
import BookCover from './BookCover';
import { ConfirmDialog } from './Modal';
import { EvaluationResult, SummarySteps } from './SummaryEvaluation';
import { useToast } from './Toast';
import { Notice, PageContainer, PageHeader, Panel, SummaryStatusBadge, buttonStyles, cn, formatRelative, inputStyles } from './ui';

function WritingGuide() {
  return (
    <Panel as="div" className="p-5">
      <h2 className="font-display text-lg">İyi bir özet nasıl olur?</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-ink-light marker:text-forest">
        <li>Kitabın temel fikrini ya da ana çatışmasını anlat.</li>
        <li>Önemli olayları veya argümanları kendi sıranla kapsa.</li>
        <li>Başı, gelişmesi ve sonu birbirine bağlı olsun.</li>
        <li>Alıntı yerine kendi cümlelerini kullan.</li>
        <li>Kitabın sende bıraktığı düşünceyi ekle.</li>
      </ul>
      <p className="mt-4 rounded-xl bg-mist p-3 text-xs leading-5 text-ink-light">
        En az {SUMMARY_MIN_LENGTH} karakter sınırı yalnızca form kontrolüdür; değerlendirmeden geçmeyi garanti etmez.
      </p>
    </Panel>
  );
}

function Editor({ book }: { book: LibraryBook }) {
  const toast = useToast();
  const state = getSummaryState(book);
  const saved = book.summary?.text ?? '';
  const [text, setText] = useState(saved);
  const [editingVerified, setEditingVerified] = useState(false);
  const [confirmEdit, setConfirmEdit] = useState(false);
  const [error, setError] = useState('');

  const trimmed = text.trim();
  const dirty = text !== saved;
  const length = trimmed.length;
  const ready = length >= SUMMARY_MIN_LENGTH;
  const locked = state === 'evaluating' || (state === 'verified' && !editingVerified);

  // Kaydedilmemiş değişiklik varken sekmeyi kapatmadan önce uyar
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  function saveDraft() {
    if (!trimmed) {
      setError('Kaydetmek için bir şeyler yaz.');
      return;
    }
    setError('');
    saveSummaryDraft(book.id, trimmed);
    setText(trimmed);
    setEditingVerified(false);
    toast({ title: 'Taslak kaydedildi', description: 'Taslaklar sayfasından da devam edebilirsin.' });
  }

  function submit() {
    if (!ready) {
      setError(`Göndermek için en az ${SUMMARY_MIN_LENGTH} karakter yazmalısın (şu an ${length}).`);
      return;
    }
    setError('');
    setText(trimmed);
    setEditingVerified(false);
    submitSummary(book.id, trimmed);
  }

  const statusLine = dirty
    ? ready
      ? 'Gönderilmeye hazır · kaydedilmemiş değişiklik var'
      : 'Özet yazılıyor · kaydedilmemiş değişiklik var'
    : book.summary
      ? `Son kayıt ${formatRelative(book.summary.updatedAt)}`
      : 'Henüz kaydedilmedi';

  return (
    <Panel aria-labelledby="editor-title" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="editor-title" className="font-display text-xl">
          Özetin
        </h2>
        <SummaryStatusBadge state={state} className="w-fit" />
      </div>
      <SummarySteps book={book} />
      <p className="text-sm leading-6 text-ink-light">{SUMMARY_STATUS_DESCRIPTIONS[state]}</p>

      {state === 'evaluating' && (
        <div role="status" className="flex items-center gap-3 rounded-2xl border border-[#C9D9E6] bg-[#EEF4F9] p-4 text-sm">
          <LoaderCircle size={20} aria-hidden="true" className="animate-spin text-[#2D5470] motion-reduce:animate-none" />
          Özetin değerlendiriliyor (demo). Değerlendirme bitene kadar metin düzenlenemez.
        </div>
      )}

      {state === 'failed' && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-[#F0D3CE] bg-[#FDF5F3] p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[#A23B2C]">{book.summary?.error ?? 'Değerlendirme tamamlanamadı.'} Özetin kaybolmadı.</span>
          <button type="button" onClick={() => void runEvaluation(book.id)} className={buttonStyles({ size: 'sm' })}>
            <RotateCcw size={15} aria-hidden="true" />
            Yeniden dene
          </button>
        </div>
      )}

      {state === 'verified' && !editingVerified && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#BFDCCB] bg-[#EAF5EE] p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <Sprout size={18} aria-hidden="true" className="shrink-0 text-forest" />
            Bu özet doğrulandı ve ağacına katkı sağlıyor.
          </span>
          <button type="button" onClick={() => setConfirmEdit(true)} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
            <FilePenLine size={15} aria-hidden="true" />
            Özeti düzenle
          </button>
        </div>
      )}

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="summary-text" className="text-sm font-medium">
            {book.title} özeti
          </label>
          <span className={cn('text-xs tabular-nums', ready ? 'text-forest' : 'text-ink-light')}>
            {length} karakter · {countWords(trimmed)} kelime
          </span>
        </div>
        <textarea
          id="summary-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          readOnly={locked}
          aria-readonly={locked || undefined}
          rows={14}
          maxLength={SUMMARY_MAX_LENGTH}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'summary-error' : 'summary-hint'}
          placeholder="Kitabın ana fikrini, önemli olaylarını ve sende bıraktığı düşünceleri kendi cümlelerinle anlat…"
          className={cn(inputStyles, 'min-h-64 resize-y leading-7', locked && 'bg-mist text-ink-light')}
        />
        {error ? (
          <p id="summary-error" role="alert" className="mt-2 text-xs font-medium text-[#A23B2C]">
            {error}
          </p>
        ) : (
          <p id="summary-hint" className="mt-2 text-xs text-ink-light" aria-live="polite">
            {ready ? statusLine : `${statusLine} · Göndermek için ${SUMMARY_MIN_LENGTH - length} karakter daha`}
          </p>
        )}
      </div>

      {!locked && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {editingVerified && (
            <button
              type="button"
              onClick={() => {
                setText(saved);
                setEditingVerified(false);
                setError('');
              }}
              className={buttonStyles({ variant: 'ghost' })}
            >
              Düzenlemeden vazgeç
            </button>
          )}
          <button type="button" onClick={saveDraft} disabled={!dirty && state === 'draft'} className={buttonStyles({ variant: 'secondary' })}>
            <Save size={17} aria-hidden="true" />
            Taslak kaydet
          </button>
          <button type="button" onClick={submit} aria-disabled={!ready || undefined} className={buttonStyles({ className: !ready ? 'opacity-60' : '' })}>
            <Send size={17} aria-hidden="true" />
            {state === 'needs-improvement' || state === 'failed' ? 'Yeniden değerlendirmeye gönder' : 'Değerlendirmeye gönder'}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmEdit}
        tone="primary"
        title="Doğrulanmış özet düzenlensin mi?"
        description="Düzenlediğin özeti kaydedersen ya da gönderirsen yeniden değerlendirilmesi gerekir. O zamana kadar bu kitap ağacına sayılmaz. Vazgeçersen hiçbir şey değişmez."
        confirmLabel="Düzenlemeye başla"
        onCancel={() => setConfirmEdit(false)}
        onConfirm={() => {
          setConfirmEdit(false);
          setEditingVerified(true);
          requestAnimationFrame(() => document.getElementById('summary-text')?.focus());
        }}
      />
    </Panel>
  );
}

export default function SummaryEditorContent({ id }: { id: string }) {
  const { books } = useGarden();
  const toast = useToast();
  const book = books.find((b) => b.id === id);
  if (!book) return <BookNotFound />;

  const state = getSummaryState(book);
  const verifiedCount = books.filter(isVerified).length;
  const stage = getStage(verifiedCount);

  return (
    <PageContainer>
      <PageHeader
        back={{ href: `/garden/library/${book.id}`, label: 'Kitaba dön' }}
        eyebrow="Oku → Düşün → Üret"
        title="Kitabını özetle"
        description="Öğrendiklerini kendi cümlelerinle anlat. Doğrulanan özet ağacına yeni bir parça ekler."
      />

      <Notice tone="demo" title="Değerlendirme şimdilik simüle ediliyor">
        Gerçek AI değerlendirmesi henüz bağlı değil. Gönderdiğin özet, uzunluk ve cümle yapısı gibi yüzeysel ölçülerle
        demo olarak değerlendirilir; kitabı anlayıp anlamadığını ölçmez.
      </Notice>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {book.status !== 'completed' ? (
            <Panel className="space-y-4">
              <h2 className="font-display text-xl">Önce kitabı tamamla</h2>
              <p className="text-sm leading-6 text-ink-light">
                Özet yazma ve değerlendirme yalnızca tamamlanan kitaplar için açık. “{book.title}” şu an{' '}
                {book.status === 'reading' ? 'okuduğun kitaplar' : 'okuma listende'} arasında.
              </p>
              <button
                type="button"
                className={buttonStyles()}
                onClick={() => {
                  setReadingStatus(book.id, 'completed');
                  toast({ title: 'Kitap tamamlandı', description: 'Şimdi özetini yazabilirsin.' });
                }}
              >
                <BookCheck size={17} aria-hidden="true" />
                Tamamlandı olarak işaretle
              </button>
            </Panel>
          ) : (
            // Kaydedilmiş metin dışarıdan değişirse (ör. başka sekme) editör yeniden kurulur
            <Editor key={`${book.summary?.updatedAt ?? 'new'}-${state === 'verified'}`} book={book} />
          )}

          {book.summary?.evaluation && state !== 'evaluating' && (
            <Panel aria-labelledby="result-title">
              <h2 id="result-title" className="mb-4 font-display text-xl">
                {state === 'verified' ? 'Değerlendirme sonucu' : 'Son değerlendirme'}
              </h2>
              <EvaluationResult evaluation={book.summary.evaluation} stale={state !== 'verified' && state !== 'needs-improvement'} />
              {state === 'verified' && (
                <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-mist p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Ağacın şu an <strong>{stage.name}</strong> aşamasında ({verifiedCount} doğrulanmış kitap).
                    {stage.next && ` Sonraki aşamaya ${stage.next.booksLeft} kitap.`}
                  </span>
                  <Link href="/garden" className={buttonStyles({ size: 'sm' })}>
                    <Sprout size={15} aria-hidden="true" />
                    Ağacımı gör
                  </Link>
                </div>
              )}
            </Panel>
          )}
        </div>

        <aside className="space-y-4">
          <Panel as="div" className="flex gap-4 p-5">
            <BookCover book={book} size="sm" className="w-16" />
            <div className="min-w-0">
              <p className="font-display text-lg leading-snug">{book.title}</p>
              <p className="text-sm text-ink-light">{book.author}</p>
            </div>
          </Panel>
          <WritingGuide />
        </aside>
      </div>
    </PageContainer>
  );
}
