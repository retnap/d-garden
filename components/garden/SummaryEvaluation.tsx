'use client';

import Link from 'next/link';
import {
  CircleAlert,
  CircleCheckBig,
  CircleDashed,
  CircleDot,
  FilePenLine,
  LoaderCircle,
  Play,
  RotateCcw,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { SUMMARY_STATUS_DESCRIPTIONS } from '@/lib/garden/constants';
import { getSummaryState } from '@/lib/garden/selectors';
import { runEvaluation } from '@/lib/garden/store';
import type { CriterionLevel, LibraryBook, SummaryEvaluation } from '@/lib/garden/types';
import { Badge, SummaryStatusBadge, buttonStyles, cn, formatDate } from './ui';

const levelInfo: Record<CriterionLevel, { label: string; icon: LucideIcon; cls: string }> = {
  strong: { label: 'Güçlü', icon: CircleCheckBig, cls: 'text-forest' },
  partial: { label: 'Geliştirilebilir', icon: CircleDot, cls: 'text-[#7A5414]' },
  weak: { label: 'Yetersiz', icon: CircleAlert, cls: 'text-[#A23B2C]' },
  unrated: { label: 'Ölçülmedi', icon: CircleDashed, cls: 'text-ink-light' },
};

export function EvaluationResult({ evaluation, stale = false }: { evaluation: SummaryEvaluation; stale?: boolean }) {
  const verified = evaluation.outcome === 'verified';
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={verified ? 'green' : 'amber'} icon={verified ? CircleCheckBig : Sparkles}>
          {verified ? 'Doğrulandı' : 'Geliştirme önerileri var'}
        </Badge>
        {evaluation.source === 'mock' && <Badge tone="violet">Demo değerlendirme · gerçek AI değil</Badge>}
        <span className="text-xs text-ink-light">{formatDate(evaluation.evaluatedAt)}</span>
      </div>
      {stale && (
        <p className="rounded-xl bg-mist px-3 py-2 text-xs text-ink-light">
          Bu sonuç özetinin önceki sürümüne ait. Düzenlediğin metin henüz değerlendirilmedi.
        </p>
      )}

      <p className="text-sm leading-6 text-ink">{evaluation.feedback}</p>

      <div>
        <h4 className="text-sm font-semibold text-ink">Ölçütler</h4>
        <ul className="mt-3 space-y-2.5">
          {evaluation.criteria.map((c) => {
            const info = levelInfo[c.level];
            const Icon = info.icon;
            return (
              <li key={c.key} className="flex gap-3 rounded-xl border border-line p-3">
                <Icon size={18} aria-hidden="true" className={cn('mt-0.5 shrink-0', info.cls)} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {c.label} <span className={cn('font-normal', info.cls)}>· {info.label}</span>
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-ink-light">{c.note}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {evaluation.suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-ink">Geliştirme önerileri</h4>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-ink-light marker:text-forest">
            {evaluation.suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const steps = ['Yaz', 'Gönder', 'Değerlendirme', 'Sonuç'];

function stepIndex(book: LibraryBook) {
  switch (getSummaryState(book)) {
    case 'none':
    case 'draft':
      return 0;
    case 'pending':
    case 'failed':
      return 1;
    case 'evaluating':
      return 2;
    default:
      return 3;
  }
}

export function SummarySteps({ book }: { book: LibraryBook }) {
  const active = stepIndex(book);
  return (
    <ol className="flex items-center gap-1.5 text-xs sm:gap-2" aria-label="Özet akışı">
      {steps.map((s, i) => (
        <li key={s} className="flex min-w-0 items-center gap-1.5 sm:gap-2" aria-current={i === active ? 'step' : undefined}>
          <span
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums',
              i < active && 'border-forest bg-forest text-white',
              i === active && 'border-forest bg-mint text-forest',
              i > active && 'border-line bg-white text-ink-light',
            )}
          >
            {i < active ? '✓' : i + 1}
          </span>
          <span className={cn('truncate', i === active ? 'font-semibold text-ink' : 'text-ink-light')}>{s}</span>
          {i < steps.length - 1 && <span aria-hidden="true" className="h-px w-3 bg-line sm:w-6" />}
        </li>
      ))}
    </ol>
  );
}

/** Kitap detayında özetin durumu ve bir sonraki aksiyon */
export default function SummaryPanel({ book }: { book: LibraryBook }) {
  const state = getSummaryState(book);
  const summaryHref = `/garden/library/${book.id}/summary`;

  if (book.status !== 'completed') {
    return (
      <div className="rounded-2xl bg-mist p-4 text-sm leading-6 text-ink-light">
        Kitabı bitirdiğinde kendi cümlelerinle özetini yazabilirsin. Doğrulanan özetler ağacını büyütür.
        {book.summary && ' Daha önce yazdığın özet saklanıyor.'}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SummaryStatusBadge state={state} className="w-fit" />
        <SummarySteps book={book} />
      </div>
      <p className="text-sm leading-6 text-ink-light" aria-live="polite">
        {SUMMARY_STATUS_DESCRIPTIONS[state]}
      </p>

      {state === 'evaluating' && (
        <div role="status" className="flex items-center gap-3 rounded-2xl border border-[#C9D9E6] bg-[#EEF4F9] p-4 text-sm">
          <LoaderCircle size={20} aria-hidden="true" className="animate-spin text-[#2D5470] motion-reduce:animate-none" />
          Özetin değerlendiriliyor (demo). Bu sırada başka sayfalara geçebilirsin; sonuç hazır olunca haber vereceğiz.
        </div>
      )}

      {state === 'failed' && book.summary?.error && (
        <div role="alert" className="rounded-2xl border border-[#F0D3CE] bg-[#FDF5F3] p-4 text-sm text-[#A23B2C]">
          {book.summary.error}
        </div>
      )}

      {book.summary && state !== 'none' && (
        <blockquote className="whitespace-pre-line break-words rounded-2xl border-l-4 border-sage bg-mist/70 px-4 py-3 text-sm leading-7 text-ink">
          {book.summary.text}
        </blockquote>
      )}

      <div className="flex flex-wrap gap-2">
        {(state === 'none' || state === 'draft') && (
          <Link href={summaryHref} className={buttonStyles()}>
            <FilePenLine size={17} aria-hidden="true" />
            {state === 'none' ? 'Özet yaz' : 'Özete devam et'}
          </Link>
        )}
        {state === 'needs-improvement' && (
          <Link href={summaryHref} className={buttonStyles()}>
            <FilePenLine size={17} aria-hidden="true" />
            Özeti geliştir
          </Link>
        )}
        {state === 'failed' && (
          <button type="button" onClick={() => void runEvaluation(book.id)} className={buttonStyles()}>
            <RotateCcw size={17} aria-hidden="true" />
            Yeniden dene
          </button>
        )}
        {state === 'pending' && (
          <button type="button" onClick={() => void runEvaluation(book.id)} className={buttonStyles()}>
            <Play size={17} aria-hidden="true" />
            Değerlendirmeyi başlat
          </button>
        )}
        {(state === 'verified' || state === 'failed' || state === 'pending') && (
          <Link href={summaryHref} className={buttonStyles({ variant: 'secondary' })}>
            <FilePenLine size={17} aria-hidden="true" />
            Özeti düzenle
          </Link>
        )}
      </div>

      {book.summary?.evaluation && state !== 'evaluating' && (
        <div className="border-t border-line pt-5">
          <h3 className="mb-4 font-display text-lg">Değerlendirme sonucu</h3>
          <EvaluationResult
            evaluation={book.summary.evaluation}
            stale={state === 'draft' || state === 'pending' || state === 'failed'}
          />
        </div>
      )}
    </div>
  );
}
