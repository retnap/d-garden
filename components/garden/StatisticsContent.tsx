'use client';

import { useState } from 'react';
import { BookCheck, BookOpen, ChartNoAxesColumn, FileText, Sprout } from 'lucide-react';
import { getProgress, getStage } from '@/lib/garden-tree';
import {
  countWords,
  getCategoryDistribution,
  getGardenMetrics,
  getGrowthHistory,
  getMonthlyActivity,
  hasDemoData,
  htmlToText,
  withoutDemo,
  type MonthlyPoint,
} from '@/lib/garden/selectors';
import { useGarden } from '@/lib/garden/store';
import { TreeRules } from './TreeProgressPanel';
import { EmptyState, PageContainer, PageHeader, Panel, ProgressBar, StatCard, cn, formatDate } from './ui';

type Row = { label: string; value: number };

/** Tek seri, tek renk: değerler her zaman yazıyla da gösterilir. */
function BarList({ rows, caption, unit = 'kitap' }: { rows: Row[]; caption: string; unit?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <figure>
      <ul className="space-y-3" aria-hidden="true">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_3.5rem] items-center gap-3 text-sm">
            <span className="truncate text-ink-light">{r.label}</span>
            <span className="h-3 rounded-full bg-mist" title={`${r.label}: ${r.value} ${unit}`}>
              <span
                className="block h-full rounded-full bg-forest transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${(r.value / max) * 100}%`, minWidth: r.value > 0 ? 6 : 0 }}
              />
            </span>
            <span className="text-right tabular-nums text-ink">
              {r.value}
              {total > 0 && <span className="ml-1 text-xs text-ink-light">%{Math.round((r.value / total) * 100)}</span>}
            </span>
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td>
                {r.value} {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

const monthlyMetrics: { key: keyof Pick<MonthlyPoint, 'completed' | 'verified' | 'works'>; label: string; unit: string }[] = [
  { key: 'completed', label: 'Tamamlanan kitap', unit: 'kitap' },
  { key: 'verified', label: 'Doğrulanan özet', unit: 'özet' },
  { key: 'works', label: 'Tamamlanan yazı', unit: 'yazı' },
];

function MonthlyChart({ points }: { points: MonthlyPoint[] }) {
  const [metricKey, setMetricKey] = useState<(typeof monthlyMetrics)[number]['key']>('completed');
  const metric = monthlyMetrics.find((m) => m.key === metricKey)!;
  const values = points.map((p) => p[metricKey]);
  const max = Math.max(1, ...values);
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div>
      <div role="group" aria-label="Gösterilecek ölçü" className="flex flex-wrap gap-2">
        {monthlyMetrics.map((m) => (
          <button
            key={m.key}
            type="button"
            aria-pressed={m.key === metricKey}
            onClick={() => setMetricKey(m.key)}
            className={cn(
              'min-h-9 rounded-full border px-3.5 text-sm transition-colors',
              m.key === metricKey ? 'border-forest bg-forest text-white' : 'border-line text-ink-light hover:border-sage',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-light" aria-live="polite">
        Son 6 ayda toplam <strong className="text-ink">{total}</strong> {metric.unit}.
      </p>
      <figure className="mt-4">
        <div aria-hidden="true" className="flex h-48 items-end gap-2 border-b border-line sm:gap-4">
          {points.map((p) => {
            const v = p[metricKey];
            return (
              <div key={p.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`${p.label}: ${v} ${metric.unit}`}>
                <span className="text-xs tabular-nums text-ink">{v > 0 ? v : ''}</span>
                <span
                  className="w-full max-w-12 rounded-t-md bg-forest transition-[height] duration-500 motion-reduce:transition-none"
                  style={{ height: `${(v / max) * 85}%`, minHeight: v > 0 ? 4 : 0 }}
                />
              </div>
            );
          })}
        </div>
        <div aria-hidden="true" className="mt-2 flex gap-2 sm:gap-4">
          {points.map((p) => (
            <span key={p.key} className="min-w-0 flex-1 truncate text-center text-xs capitalize text-ink-light">
              {p.label}
            </span>
          ))}
        </div>
        <table className="sr-only">
          <caption>Aylara göre {metric.label.toLocaleLowerCase('tr-TR')}</caption>
          <tbody>
            {points.map((p) => (
              <tr key={p.key}>
                <th scope="row">{p.label}</th>
                <td>
                  {p[metricKey]} {metric.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </div>
  );
}

export default function StatisticsContent() {
  const all = useGarden();
  const [excludeDemo, setExcludeDemo] = useState(false);
  const demo = hasDemoData(all);
  const data = excludeDemo ? withoutDemo(all) : all;
  const m = getGardenMetrics(data);
  const stage = getStage(m.verified);
  const progress = getProgress(m.verified);
  const history = getGrowthHistory(data);
  const categories = getCategoryDistribution(data.books);
  const totalWords = data.works.reduce((s, w) => s + countWords(htmlToText(w.content)), 0);

  return (
    <PageContainer>
      <PageHeader
        back={{ href: '/garden', label: 'Bahçene dön' }}
        eyebrow="Gelişimin"
        title="İstatistikler"
        description="Bütün sayılar kitaplığındaki ve yazılarındaki gerçek kayıtlardan hesaplanır; bahçenin diğer sayfalarıyla aynı kaynaktan gelir."
        actions={
          demo && (
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 text-sm">
              <input type="checkbox" checked={excludeDemo} onChange={(e) => setExcludeDemo(e.target.checked)} className="size-4 accent-forest" />
              Örnek verileri hariç tut
            </label>
          )
        }
      />

      <section aria-label="Genel bakış" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Toplam kitap" value={m.totalBooks} icon={BookOpen} />
        <StatCard label="Tamamlanan" value={m.completed} icon={BookCheck} />
        <StatCard label="Doğrulanmış özet" value={m.verified} icon={Sprout} />
        <StatCard label="Tamamlanan yazı" value={m.completedWorks} icon={FileText} />
      </section>

      {m.totalBooks === 0 && data.works.length === 0 ? (
        <EmptyState
          icon={ChartNoAxesColumn}
          title="Henüz istatistik yok"
          description={excludeDemo ? 'Örnek veriler dışında henüz bir kaydın yok.' : 'Kitap ekledikçe ve yazdıkça gelişimin burada görünür.'}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel aria-labelledby="dist-title">
              <h2 id="dist-title" className="font-display text-xl">
                Okuma durumu dağılımı
              </h2>
              <p className="mb-5 mt-1 text-sm text-ink-light">Kitaplığındaki {m.totalBooks} kitabın durumu.</p>
              <BarList
                caption="Okuma durumuna göre kitaplar"
                rows={[
                  { label: 'Okuma listesinde', value: m.readingList },
                  { label: 'Okuyorum', value: m.reading },
                  { label: 'Tamamlandı', value: m.completed },
                ]}
              />
            </Panel>

            <Panel aria-labelledby="verify-title">
              <h2 id="verify-title" className="font-display text-xl">
                Tamamlananların özet durumu
              </h2>
              <p className="mb-5 mt-1 text-sm text-ink-light">Ağacı yalnızca doğrulanmış özetler büyütür.</p>
              <BarList
                caption="Tamamlanan kitapların özet durumu"
                rows={[
                  { label: 'Doğrulandı', value: m.verified },
                  { label: 'Değerlendirmede', value: m.awaitingEvaluation },
                  { label: 'Geliştirilmeli', value: m.needsImprovement },
                  { label: 'Başarısız', value: m.evaluationFailed },
                  { label: 'Özet yok / taslak', value: m.withoutSubmittedSummary },
                ]}
              />
            </Panel>
          </div>

          <Panel aria-labelledby="monthly-title">
            <h2 id="monthly-title" className="mb-4 font-display text-xl">
              Aylık ilerleme
            </h2>
            <MonthlyChart points={getMonthlyActivity(data)} />
          </Panel>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel aria-labelledby="cat-title">
              <h2 id="cat-title" className="font-display text-xl">
                Kategori dağılımı
              </h2>
              <p className="mb-5 mt-1 text-sm text-ink-light">Kitaplığındaki bütün kitaplar.</p>
              {categories.length === 0 ? (
                <p className="text-sm text-ink-light">Henüz kitap yok.</p>
              ) : (
                <BarList caption="Kategoriye göre kitaplar" rows={categories.slice(0, 8).map((c) => ({ label: c.category, value: c.count }))} />
              )}
            </Panel>

            <Panel aria-labelledby="writing-title">
              <h2 id="writing-title" className="font-display text-xl">
                Yazı üretimi
              </h2>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                {[
                  { label: 'Toplam yazı', value: m.totalWorks },
                  { label: 'Tamamlanan', value: m.completedWorks },
                  { label: 'Taslak', value: m.workDrafts },
                  { label: 'Toplam kelime', value: totalWords.toLocaleString('tr-TR') },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-mist p-4">
                    <dt className="text-xs text-ink-light">{s.label}</dt>
                    <dd className="mt-1 font-display text-2xl tabular-nums">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>

          <Panel aria-labelledby="growth-title">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <h2 id="growth-title" className="font-display text-xl">
                  Ağaç büyüme geçmişi
                </h2>
                <p className="mt-1 text-sm text-ink-light">
                  Şu an <strong className="text-ink">{stage.name}</strong> aşamasındasın.
                  {stage.next && ` ${stage.next.name} için ${stage.next.booksLeft} doğrulanmış kitap daha.`}
                </p>
                <ProgressBar className="mt-4" value={progress.ratio} label={progress.label} />
                {history.length === 0 ? (
                  <p className="mt-5 rounded-2xl bg-mist p-4 text-sm text-ink-light">
                    Henüz doğrulanmış bir özetin yok. İlk doğrulanan özetinle ağacın filizlenecek.
                  </p>
                ) : (
                  <ol className="mt-5 space-y-4 border-l-2 border-mint pl-5">
                    {history.map((e) => (
                      <li key={e.stageName} className="relative">
                        <span aria-hidden="true" className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-white bg-forest" />
                        <p className="text-sm font-semibold">{e.stageName}</p>
                        <p className="text-xs text-ink-light">
                          {formatDate(e.at)} · {e.count}. doğrulanmış kitap: {e.bookTitle}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              <div className="rounded-2xl bg-mist p-5">
                <h3 className="font-display text-lg">Ağacın nasıl büyür?</h3>
                <TreeRules className="mt-3" />
              </div>
            </div>
          </Panel>
        </>
      )}
    </PageContainer>
  );
}
