'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { SummaryState } from '@/lib/garden/constants';
import { getSummaryState } from '@/lib/garden/selectors';
import { useGarden } from '@/lib/garden/store';
import AddBookForm from './AddBookForm';
import LibraryCollection from './LibraryCollection';
import { EmptyState, Notice, PageContainer, PageHeader, cn } from './ui';

type Group = { key: string; label: string; states: SummaryState[] };

const groups: Group[] = [
  { key: 'all', label: 'Tümü', states: [] },
  { key: 'verified', label: 'Doğrulandı', states: ['verified'] },
  { key: 'evaluating', label: 'Değerlendirmede', states: ['evaluating'] },
  { key: 'pending', label: 'Değerlendirme bekliyor', states: ['pending', 'failed'] },
  { key: 'improve', label: 'Geliştirilmeli', states: ['needs-improvement'] },
  { key: 'read-only', label: 'Yalnızca okundu', states: ['none', 'draft'] },
];

export default function CompletedContent() {
  const { books } = useGarden();
  const completed = books.filter((b) => b.status === 'completed');
  const [groupKey, setGroupKey] = useState('all');
  const group = groups.find((g) => g.key === groupKey) ?? groups[0];
  const inGroup = (g: Group) =>
    g.states.length === 0 ? completed : completed.filter((b) => g.states.includes(getSummaryState(b)));

  return (
    <PageContainer>
      <PageHeader
        back={{ href: '/garden', label: 'Bahçene dön' }}
        eyebrow="Bitirdiğin kitaplar"
        title="Tamamlananlar"
        description="Bir kitabı bitirmek ile onu anladığını özetle göstermek ayrı adımlardır. Ağacını yalnızca doğrulanmış özetler büyütür."
        actions={<AddBookForm label="Bitirdiğim kitap" defaultStatus="completed" />}
      />

      <Notice tone="demo" title="Değerlendirmeler şimdilik demo">
        Özetler gerçek bir AI tarafından değil, metnin uzunluğu ve yapısı gibi yüzeysel ölçülerle değerlendirilir.
        Sonuçlar yalnızca akışı denemek içindir.
      </Notice>

      <div role="group" aria-label="Değerlendirme durumuna göre filtrele" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {groups.map((g) => {
          const count = inGroup(g).length;
          const active = g.key === groupKey;
          return (
            <button
              key={g.key}
              type="button"
              aria-pressed={active}
              onClick={() => setGroupKey(g.key)}
              className={cn(
                'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
                active ? 'border-forest bg-forest text-white' : 'border-line bg-white text-ink-light hover:border-sage hover:text-forest',
              )}
            >
              {g.label}
              <span className={cn('rounded-full px-1.5 text-xs tabular-nums', active ? 'bg-white/20' : 'bg-mist')}>{count}</span>
            </button>
          );
        })}
      </div>

      <LibraryCollection
        key={group.key}
        books={inGroup(group)}
        empty={
          completed.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Henüz tamamladığın bir kitap yok"
              description="Okuduğun kitabı bitirdiğinde burada görünür. Özetini yazıp doğrulattığında ağacın büyür."
              action={<AddBookForm label="Bitirdiğim kitabı ekle" defaultStatus="completed" />}
            />
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title={`“${group.label}” durumunda kitap yok`}
              description="Başka bir durumu seçerek diğer kitaplarına bakabilirsin."
            />
          )
        }
      />
    </PageContainer>
  );
}
