'use client';

import { Award, BookCheck, BookOpen, CalendarDays, Compass, Feather, Lock, PenLine, Sprout, TreeDeciduous, Trophy, type LucideIcon } from 'lucide-react';
import { getAchievements, hasDemoData } from '@/lib/garden/selectors';
import { useGarden } from '@/lib/garden/store';
import { Badge, DemoBadge, Notice, PageContainer, PageHeader, ProgressBar, cn } from './ui';

const icons: Record<string, LucideIcon> = {
  'first-book': BookOpen,
  'first-completed': BookCheck,
  'first-verified': Sprout,
  'verified-5': Award,
  'verified-sapling': TreeDeciduous,
  'regular-reader': CalendarDays,
  explorer: Compass,
  'first-work': PenLine,
  'works-5': Feather,
};

export default function AchievementsContent() {
  const data = useGarden();
  const achievements = getAchievements(data);
  const earned = achievements.filter((a) => a.earned);
  const demo = hasDemoData(data);

  return (
    <PageContainer>
      <PageHeader
        back={{ href: '/garden', label: 'Bahçene dön' }}
        eyebrow="Yolculuğunun izleri"
        title="Başarılar"
        description="Okudukça, özetledikçe ve yazdıkça yeni başarılar kazanırsın. Ağaçla ilgili başarılar yalnızca doğrulanmış özetlerle ilerler."
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-forest ring-1 ring-line">
            <Trophy size={17} aria-hidden="true" />
            {earned.length} / {achievements.length} kazanıldı
          </span>
        }
      />

      {demo && (
        <Notice tone="demo" title="Örnek veriler hesaba katılıyor">
          Başarılar bu tarayıcıdaki verilerden hesaplanır. Yalnızca örnek veriler sayesinde kazanılanlar “Örnek veriyle”
          olarak işaretlenir; Ayarlar’dan örnek verileri kaldırabilirsin.
        </Notice>
      )}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {achievements.map((a) => {
          const Icon = icons[a.id] ?? Award;
          const value = Math.min(a.current, a.target);
          return (
            <li
              key={a.id}
              className={cn(
                'flex flex-col rounded-2xl border bg-white p-5',
                a.earned ? 'border-[#BFDCCB]' : 'border-line',
              )}
            >
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                    a.earned ? 'bg-forest text-white' : 'bg-mist text-ink-light',
                  )}
                >
                  {a.earned ? <Icon size={22} aria-hidden="true" /> : <Lock size={20} aria-hidden="true" />}
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-lg leading-snug">{a.title}</h2>
                  <p className="mt-0.5 text-sm leading-5 text-ink-light">{a.description}</p>
                </div>
              </div>
              <div className="mt-auto pt-5">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  {a.earned ? (
                    <Badge tone="green">Kazanıldı</Badge>
                  ) : (
                    <Badge>Devam ediyor</Badge>
                  )}
                  {a.earnedWithDemoOnly && <DemoBadge>Örnek veriyle</DemoBadge>}
                </div>
                <ProgressBar value={value / a.target} label={`${value} / ${a.target}`} />
              </div>
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
}
