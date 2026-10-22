'use client';

import Link from 'next/link';
import { CircleCheckBig, Clock, FilePenLine, Sprout } from 'lucide-react';
import { STAGES, getStage } from '@/lib/garden-tree';
import type { GardenMetrics } from '@/lib/garden/selectors';
import { useGarden } from '@/lib/garden/store';
import GardenTree from './GardenTree';
import { cn } from './ui';

/**
 * Ağacın kimliği. TODO(backend): oturumdaki kullanıcının ID'si verilecek;
 * böylece her kullanıcının ağacı kendine özgü ve kalıcı olur.
 */
export const TREE_SEED = 'demo-user';

/** Ağacın büyüme kuralı; dashboard ve istatistiklerde aynı metin kullanılır. */
export function TreeRules({ className }: { className?: string }) {
  const milestones = STAGES.filter((s) => [1, 10, 50, 100, 200, 300].includes(s.from));
  return (
    <div className={cn('text-sm leading-6 text-ink-light', className)}>
      <ol className="list-decimal space-y-1 pl-5 marker:text-forest">
        <li>Kitabını bitir ve “tamamlandı” olarak işaretle.</li>
        <li>Kitabı kendi cümlelerinle özetle ve değerlendirmeye gönder.</li>
        <li>Değerlendirmeden geçen özet doğrulanır.</li>
        <li>Her doğrulanmış kitap ağacına yeni bir parça ekler.</li>
      </ol>
      <p className="mt-3">
        Yalnızca kitap eklemek ya da “tamamlandı” işaretlemek ağacı büyütmez. Aşamalar:{' '}
        {milestones.map((s, i) => (
          <span key={s.name}>
            {i > 0 && ' · '}
            <span className="text-ink">{s.name}</span> {s.from}
          </span>
        ))}
        .
      </p>
    </div>
  );
}

export default function TreeProgressPanel({ metrics }: { metrics: GardenMetrics }) {
  const { preferences } = useGarden();
  const stage = getStage(metrics.verified);

  const breakdown = [
    { label: 'Doğrulanmış', value: metrics.verified, icon: CircleCheckBig, href: '/garden/completed' },
    { label: 'Değerlendirmede', value: metrics.awaitingEvaluation, icon: Clock, href: '/garden/completed' },
    { label: 'Özet bekliyor', value: metrics.withoutSubmittedSummary + metrics.needsImprovement + metrics.evaluationFailed, icon: FilePenLine, href: '/garden/completed' },
  ];

  return (
    <section aria-labelledby="tree-title" className="overflow-hidden rounded-3xl border border-line bg-white">
      <div className="flex flex-col justify-between gap-3 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:px-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-forest">Kişisel gelişim alanın</p>
          <h2 id="tree-title" className="mt-2 font-display text-2xl sm:text-3xl">
            Okuma ağacın
          </h2>
          <p className="mt-1.5 text-sm text-ink-light">Doğrulanan her özet, büyüyen hikâyenin bir parçası.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm text-forest">
          <Sprout size={17} aria-hidden="true" />
          {stage.name}
        </span>
      </div>

      <div className="relative overflow-hidden bg-mist px-2 pb-6 pt-2 sm:px-6 sm:pt-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-mint/70 blur-3xl sm:size-96"
        />
        <div className="relative mx-auto max-w-xl">
          <GardenTree
            bookCount={metrics.verified}
            seed={TREE_SEED}
            framed={false}
            animateOnMount={preferences.animateTree}
          />
        </div>
      </div>

      <ul className="grid grid-cols-3 divide-x divide-line border-t border-line">
        {breakdown.map(({ label, value, icon: Icon, href }) => (
          <li key={label}>
            <Link href={href} className="flex h-full flex-col items-center gap-1 px-2 py-4 text-center transition hover:bg-mist">
              <Icon size={18} aria-hidden="true" className="text-forest" />
              <span className="font-display text-xl tabular-nums text-ink">{value}</span>
              <span className="text-xs text-ink-light">{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <details className="group border-t border-line px-5 py-4 sm:px-7">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg text-sm font-semibold text-forest">
          Ağacın nasıl büyür?
          <span aria-hidden="true" className="transition group-open:rotate-45 motion-reduce:transition-none">
            +
          </span>
        </summary>
        <TreeRules className="pb-1 pt-2" />
      </details>
    </section>
  );
}
