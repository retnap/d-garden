'use client';

/**
 * Geçici tasarım aracı: ağacın aşamalarını gerçek ilerlemeye dokunmadan önizler.
 * Demo seçimi yalnızca bu bileşenin state'inde tutulur; store'a ya da localStorage'a yazılmaz.
 * Panel kapanınca ağaç yeniden doğrulanmış kitap sayısından çizilir.
 */
import { useEffect, useRef, useState } from 'react';
import { FlaskConical, Sprout, X } from 'lucide-react';
import { STAGES, getStage } from '@/lib/garden-tree';
import { getAchievements, getGardenMetrics } from '@/lib/garden/selectors';
import { useGarden } from '@/lib/garden/store';
import GardenTree from './GardenTree';
import { TREE_SEED } from './TreeProgressPanel';
import { DemoBadge, Notice, PageContainer, PageHeader, Panel, buttonStyles, cn } from './ui';

/** Panel her açılışta bu aşamadan (Tohum) başlar */
const DEFAULT_STAGE_INDEX = 0;

export default function TreeStageDemo() {
  const data = useGarden();
  const metrics = getGardenMetrics(data);
  const earned = getAchievements(data).filter((a) => a.earned).length;
  const realStage = getStage(metrics.verified);

  const [open, setOpen] = useState(false);
  const [stageIndex, setStageIndex] = useState(DEFAULT_STAGE_INDEX);
  const demoStage = STAGES[stageIndex];
  const bookCount = open ? demoStage.from : metrics.verified;

  const toggleRef = useRef<HTMLButtonElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  // Açılınca odak slider'a, kapanınca açma düğmesine
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    (open ? sliderRef : toggleRef).current?.focus();
  }, [open]);

  const openPanel = () => {
    setStageIndex(DEFAULT_STAGE_INDEX);
    setOpen(true);
  };
  const closePanel = () => {
    setOpen(false);
    setStageIndex(DEFAULT_STAGE_INDEX);
  };

  const realCounts = [
    { label: 'Kitaplık', value: metrics.totalBooks },
    { label: 'Tamamlanan', value: metrics.completed },
    { label: 'Doğrulanmış özet', value: metrics.verified },
    { label: 'Kazanılan başarı', value: earned },
  ];

  return (
    <PageContainer>
      <PageHeader
        back={{ href: '/garden', label: 'Bahçeme dön' }}
        eyebrow="Geliştirici aracı · Demo"
        title="Ağaç aşamaları"
        description="Ağacın büyüme aşamalarını görsel olarak incelemek için geçici bir alan. Buradaki seçimler gerçek ilerlemeni etkilemez."
        actions={
          <button
            ref={toggleRef}
            type="button"
            onClick={open ? closePanel : openPanel}
            aria-expanded={open}
            aria-controls="tree-demo-panel"
            className={buttonStyles({ variant: open ? 'secondary' : 'primary' })}
          >
            <FlaskConical size={17} aria-hidden="true" />
            {open ? 'Demo panelini kapat' : 'Demo panelini aç'}
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section
          aria-labelledby="tree-demo-title"
          className={cn('overflow-hidden rounded-3xl border bg-white', open ? 'border-[#D9D2EA]' : 'border-line')}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
            <h2 id="tree-demo-title" className="font-display text-xl sm:text-2xl">
              {open ? 'Demo önizleme' : 'Gerçek ağacın'}
            </h2>
            {open ? (
              <DemoBadge>Demo · gerçek ilerleme değil</DemoBadge>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1 text-sm text-forest">
                <Sprout size={15} aria-hidden="true" />
                {realStage.name}
              </span>
            )}
          </div>
          <div className="bg-mist px-2 pb-6 pt-2 sm:px-6 sm:pt-5">
            <div className="mx-auto max-w-xl">
              <GardenTree bookCount={bookCount} seed={TREE_SEED} framed={false} />
            </div>
          </div>
        </section>

        <div className="space-y-6">
          {open && (
            <Panel
              id="tree-demo-panel"
              aria-labelledby="tree-demo-panel-title"
              className="border-[#D9D2EA]"
              onKeyDown={(e) => {
                if (e.key === 'Escape') closePanel();
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="tree-demo-panel-title" className="font-display text-xl">
                    Demo paneli
                  </h2>
                  <DemoBadge>Demo</DemoBadge>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  aria-label="Demo panelini kapat"
                  className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'px-2' })}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <Notice tone="demo" className="mt-4">
                Seçtiğin aşama yalnızca bu sayfadaki ağacı değiştirir. Kitapların, özetlerin, başarıların ve
                istatistiklerin etkilenmez; panel kapanınca ya da sayfa yenilenince seçim sıfırlanır.
              </Notice>

              <label htmlFor="tree-demo-stage" className="mt-5 flex justify-between gap-3 text-sm font-semibold text-ink">
                Aşama
                <span className="font-normal tabular-nums text-ink-light">
                  {stageIndex + 1} / {STAGES.length}
                </span>
              </label>
              <input
                ref={sliderRef}
                id="tree-demo-stage"
                type="range"
                min={0}
                max={STAGES.length - 1}
                step={1}
                value={stageIndex}
                onChange={(e) => setStageIndex(Number(e.target.value))}
                aria-valuetext={`${demoStage.name}, ${demoStage.from} doğrulanmış kitap`}
                className="mt-2 w-full accent-forest"
              />

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm" aria-live="polite">
                <div className="rounded-2xl bg-mist px-4 py-3">
                  <dt className="text-ink-light">Demo aşaması</dt>
                  <dd className="mt-1 font-display text-lg text-ink">
                    {demoStage.name}
                  </dd>
                </div>
                <div className="rounded-2xl bg-mist px-4 py-3">
                  <dt className="text-ink-light">Demo seviyesi</dt>
                  <dd className="mt-1 font-display text-lg tabular-nums text-ink">{demoStage.from} kitap</dd>
                </div>
              </dl>
            </Panel>
          )}

          <Panel aria-labelledby="tree-demo-real-title">
            <h2 id="tree-demo-real-title" className="font-display text-xl">
              Gerçek ilerlemen
            </h2>
            <p className="mt-1 text-sm text-ink-light">
              Demo panelinden bağımsızdır. Aşama: <span className="text-ink">{realStage.name}</span>
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {realCounts.map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-line px-4 py-3">
                  <dt className="text-ink-light">{label}</dt>
                  <dd className="mt-1 font-display text-lg tabular-nums text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      </div>
    </PageContainer>
  );
}
