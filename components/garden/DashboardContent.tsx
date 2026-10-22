'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookCheck,
  BookMarked,
  BookOpen,
  ChartNoAxesColumn,
  FilePenLine,
  FileText,
  PenLine,
  Sprout,
  Trophy,
} from 'lucide-react';
import {
  getAchievements,
  getGardenMetrics,
  getReadingProgress,
  getSummaryState,
  getWorkExcerpt,
} from '@/lib/garden/selectors';
import { useGarden } from '@/lib/garden/store';
import type { LibraryBook } from '@/lib/garden/types';
import AddBookForm from './AddBookForm';
import BookCover from './BookCover';
import TreeProgressPanel from './TreeProgressPanel';
import {
  EmptyState,
  PageContainer,
  PageHeader,
  Panel,
  ProgressBar,
  StatCard,
  SummaryStatusBadge,
  buttonStyles,
  formatRelative,
} from './ui';

type NextStep = { key: string; title: string; description: string; href: string; cta: string };

/** Kullanıcının bahçesini büyütmek için atabileceği en anlamlı adımlar */
function getNextSteps(books: LibraryBook[]): NextStep[] {
  const steps: NextStep[] = [];
  for (const b of books) {
    if (b.status !== 'completed') continue;
    const s = getSummaryState(b);
    if (s === 'needs-improvement')
      steps.push({ key: b.id, title: b.title, description: 'Geliştirme önerileri hazır.', href: `/garden/library/${b.id}/summary`, cta: 'Özeti geliştir' });
    else if (s === 'draft')
      steps.push({ key: b.id, title: b.title, description: 'Özet taslağın seni bekliyor.', href: `/garden/library/${b.id}/summary`, cta: 'Devam et' });
    else if (s === 'none')
      steps.push({ key: b.id, title: b.title, description: 'Kitabı bitirdin, özetini yaz.', href: `/garden/library/${b.id}/summary`, cta: 'Özet yaz' });
    else if (s === 'failed' || s === 'pending')
      steps.push({ key: b.id, title: b.title, description: 'Değerlendirme tamamlanmadı.', href: `/garden/library/${b.id}`, cta: 'Kitaba git' });
  }
  return steps.slice(0, 3);
}

export default function DashboardContent() {
  const data = useGarden();
  const metrics = getGardenMetrics(data);
  const reading = data.books.filter((b) => b.status === 'reading');
  const recentBooks = [...data.books].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 4);
  const recentWorks = [...data.works].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
  const nextSteps = getNextSteps(data.books);
  const achievements = getAchievements(data);
  const earned = achievements.filter((a) => a.earned).length;
  const firstName = data.profile.displayName.split(' ')[0] || 'Okur';

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Oku. Düşün. Üret."
        title={`Merhaba ${firstName}, bugün bahçende ne yetiştireceksin?`}
        description="Okudukların düşüncelerine, düşüncelerin yeni eserlere dönüşsün."
        actions={
          <>
            {reading[0] && (
              <Link href={`/garden/library/${reading[0].id}`} className={buttonStyles({ variant: 'secondary' })}>
                <BookMarked size={17} aria-hidden="true" />
                Okumaya devam et
              </Link>
            )}
            <AddBookForm />
          </>
        }
      />

      <section
        aria-label="Özet"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1"
      >
        <StatCard label="Kitaplığım" value={metrics.totalBooks} icon={BookOpen} href="/garden/library" />
        <StatCard label="Okuyorum" value={metrics.reading} icon={BookMarked} href="/garden/reading" />
        <StatCard label="Tamamlanan" value={metrics.completed} icon={BookCheck} href="/garden/completed" />
        <StatCard label="Doğrulanmış özet" value={metrics.verified} icon={Sprout} href="/garden/completed" />
        <StatCard label="Yazılarım" value={metrics.totalWorks} icon={FileText} href="/garden/works" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <TreeProgressPanel metrics={metrics} />

        <div className="space-y-6">
          <Panel aria-labelledby="next-steps-title">
            <h2 id="next-steps-title" className="font-display text-xl">
              Sıradaki adımın
            </h2>
            {nextSteps.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-ink-light">
                Bekleyen bir özetin yok. Okuduğun bir kitabı bitirdiğinde özetini yazarak ağacını büyütebilirsin.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {nextSteps.map((s) => (
                  <li key={s.key} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mint text-forest">
                      <FilePenLine size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.title}</p>
                      <p className="text-xs text-ink-light">{s.description}</p>
                    </div>
                    <Link href={s.href} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
                      {s.cta}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel aria-labelledby="reading-now-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="reading-now-title" className="font-display text-xl">
                Okumakta olduğun
              </h2>
              <Link href="/garden/reading" className="text-sm font-semibold text-forest hover:underline">
                Tümü
              </Link>
            </div>
            {reading.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-ink-light">
                Şu an okuduğun bir kitap yok.{' '}
                <Link href="/garden/reading-list" className="font-semibold text-forest underline-offset-2 hover:underline">
                  Okuma listenden
                </Link>{' '}
                bir kitapla başla.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reading.slice(0, 3).map((b) => {
                  const p = getReadingProgress(b);
                  return (
                    <li key={b.id}>
                      <Link href={`/garden/library/${b.id}`} className="flex items-center gap-3 rounded-xl hover:bg-mist">
                        <BookCover book={b} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{b.title}</p>
                          <p className="truncate text-xs text-ink-light">{b.author}</p>
                          {p !== null ? (
                            <ProgressBar className="mt-2" value={p} label={`%${Math.round(p * 100)} tamamlandı`} />
                          ) : (
                            <p className="mt-1 text-xs text-ink-light">Sayfa sayısı eklenmemiş</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/garden/achievements" className="rounded-2xl border border-line bg-white p-4 transition hover:border-sage">
              <Trophy size={20} aria-hidden="true" className="text-forest" />
              <p className="mt-2 text-sm font-semibold">Başarılar</p>
              <p className="text-xs tabular-nums text-ink-light">
                {earned} / {achievements.length} kazanıldı
              </p>
            </Link>
            <Link href="/garden/statistics" className="rounded-2xl border border-line bg-white p-4 transition hover:border-sage">
              <ChartNoAxesColumn size={20} aria-hidden="true" className="text-forest" />
              <p className="mt-2 text-sm font-semibold">İstatistikler</p>
              <p className="text-xs text-ink-light">Gelişimini incele</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel aria-labelledby="recent-books-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-books-title" className="font-display text-xl">
              Son eklenen kitaplar
            </h2>
            <Link href="/garden/library" className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
              Kitaplığım <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {recentBooks.length === 0 ? (
            <EmptyState className="mt-4" icon={BookOpen} title="Henüz kitap yok" action={<AddBookForm label="İlk kitabını ekle" />} />
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recentBooks.map((b) => (
                <li key={b.id}>
                  <Link href={`/garden/library/${b.id}`} className="flex items-center gap-3 py-3 hover:bg-mist/60">
                    <BookCover book={b} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{b.title}</p>
                      <p className="truncate text-xs text-ink-light">
                        {b.author} · {formatRelative(b.addedAt)}
                      </p>
                    </div>
                    {b.status === 'completed' && <SummaryStatusBadge state={getSummaryState(b)} className="hidden sm:inline-flex" />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel aria-labelledby="recent-works-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-works-title" className="font-display text-xl">
              Son yazıların
            </h2>
            <Link href="/garden/works" className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
              Yazılarım <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {recentWorks.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={PenLine}
              title="Henüz yazın yok"
              description="Okuduklarından doğan düşüncelerini yazıya dök."
              action={
                <Link href="/garden/works/new" className={buttonStyles()}>
                  Yeni yazı
                </Link>
              }
            />
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recentWorks.map((w) => (
                <li key={w.id}>
                  <Link href={`/garden/works/${w.id}`} className="block py-3 hover:bg-mist/60">
                    <p className="truncate text-sm font-semibold">{w.title || 'Başlıksız yazı'}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-light">{getWorkExcerpt(w, 100) || 'Henüz içerik yok'}</p>
                    <p className="mt-1 text-xs text-ink-light">
                      {w.status === 'draft' ? 'Taslak' : 'Tamamlandı'} · {formatRelative(w.updatedAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PageContainer>
  );
}
