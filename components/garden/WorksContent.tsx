'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, PenLine, Search, SearchX } from 'lucide-react';
import { WORK_STATUS_LABELS, WORK_TYPE_LABELS } from '@/lib/garden/constants';
import { countWords, getWorkExcerpt, htmlToText } from '@/lib/garden/selectors';
import { useGarden } from '@/lib/garden/store';
import type { Work, WorkStatus, WorkType } from '@/lib/garden/types';
import {
  Badge,
  DemoBadge,
  EmptyState,
  PageContainer,
  PageHeader,
  Panel,
  buttonStyles,
  cn,
  formatRelative,
  inputStyles,
  selectStyles,
} from './ui';

export function WorkCard({ work, bookTitle }: { work: Work; bookTitle?: string }) {
  const words = countWords(htmlToText(work.content));
  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition hover:border-sage hover:shadow-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={work.status === 'completed' ? 'green' : 'neutral'}>{WORK_STATUS_LABELS[work.status]}</Badge>
        <Badge>{WORK_TYPE_LABELS[work.type]}</Badge>
        {work.isDemo && <DemoBadge />}
      </div>
      <h3 className="mt-3 line-clamp-2 font-display text-xl leading-snug">
        <Link
          href={`/garden/works/${work.id}`}
          className="rounded after:absolute after:inset-0 after:content-[''] hover:text-forest"
        >
          {work.title || 'Başlıksız yazı'}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-ink-light">{getWorkExcerpt(work) || 'Henüz içerik yok.'}</p>
      {work.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Etiketler">
          {work.tags.map((t) => (
            <li key={t} className="rounded-full bg-mist px-2 py-0.5 text-xs text-forest">
              #{t}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 border-t border-line pt-3 text-xs text-ink-light">
        {words} kelime · {formatRelative(work.updatedAt)} güncellendi
        {bookTitle && ` · ${bookTitle}`}
      </p>
    </article>
  );
}

export default function WorksContent() {
  const { works, books } = useGarden();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<WorkType | 'all'>('all');
  const [status, setStatus] = useState<WorkStatus | 'all'>('all');

  const q = query.toLocaleLowerCase('tr-TR').trim();
  const visible = works
    .filter(
      (w) =>
        (type === 'all' || w.type === type) &&
        (status === 'all' || w.status === status) &&
        (!q ||
          w.title.toLocaleLowerCase('tr-TR').includes(q) ||
          w.tags.some((t) => t.toLocaleLowerCase('tr-TR').includes(q)) ||
          htmlToText(w.content).toLocaleLowerCase('tr-TR').includes(q)),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const bookTitle = (id?: string) => (id ? books.find((b) => b.id === id)?.title : undefined);

  const newWork = (
    <Link href="/garden/works/new" className={buttonStyles()}>
      <PenLine size={17} aria-hidden="true" />
      Yeni yazı
    </Link>
  );

  return (
    <PageContainer>
      <PageHeader
        back={{ href: '/garden', label: 'Bahçene dön' }}
        eyebrow="Üret"
        title="Yazılarım"
        description="Okuduklarından doğan denemeler, incelemeler, öyküler ve notlar. Kitap özetlerinden ayrı, sana ait özgün eserler."
        actions={newWork}
      />

      <Panel aria-label="Yazılar">
        {works.length === 0 ? (
          <EmptyState
            icon={PenLine}
            title="Henüz bir yazın yok"
            description="Bir kitabın sende uyandırdığı düşünceyle başlayabilirsin."
            action={newWork}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="relative">
                <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Başlık, etiket veya içerik ara…"
                  aria-label="Yazılarda ara"
                  className={cn(inputStyles, 'bg-mist pl-11')}
                />
              </div>
              <div className="relative">
                <select value={type} onChange={(e) => setType(e.target.value as WorkType | 'all')} aria-label="Türe göre filtrele" className={selectStyles}>
                  <option value="all">Tüm türler</option>
                  {(Object.keys(WORK_TYPE_LABELS) as WorkType[]).map((t) => (
                    <option key={t} value={t}>
                      {WORK_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
              </div>
              <div className="relative">
                <select value={status} onChange={(e) => setStatus(e.target.value as WorkStatus | 'all')} aria-label="Duruma göre filtrele" className={selectStyles}>
                  <option value="all">Tüm durumlar</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="draft">Taslak</option>
                </select>
                <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
              </div>
            </div>

            <p aria-live="polite" className="mt-4 text-xs text-ink-light">
              {visible.length === works.length ? `${works.length} yazı` : `${works.length} yazıdan ${visible.length} tanesi gösteriliyor`}
            </p>

            {visible.length === 0 ? (
              <EmptyState
                className="mt-4"
                icon={SearchX}
                title="Aramana uygun yazı bulunamadı"
                action={
                  <button
                    type="button"
                    className={buttonStyles({ variant: 'secondary' })}
                    onClick={() => {
                      setQuery('');
                      setType('all');
                      setStatus('all');
                    }}
                  >
                    Filtreleri temizle
                  </button>
                }
              />
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visible.map((w) => (
                  <li key={w.id}>
                    <WorkCard work={w} bookTitle={bookTitle(w.relatedBookId)} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Panel>
    </PageContainer>
  );
}
