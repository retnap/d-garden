'use client';

/**
 * Frontend geliştirme sırasında ağacı denemek için oyun alanı.
 * Backend bağlandığında "+ Kitap ekle" yerine doğrulama sonrası dönen yeni sayı
 * `setCount` ile verilir; ağaç yeni parçayı kendisi animasyonla ekler.
 */
import { useEffect, useRef, useState } from 'react';
import GardenTree from './GardenTree';
import { MAX_BOOKS, buildTree } from '@/lib/garden-tree';

const PRESETS = [0, 1, 9, 10, 20, 60, 120, 200, 250, 300];

export default function GardenPlayground({ initialCount, seed }: { initialCount: number; seed: string }) {
  const [count, setCount] = useState(initialCount);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const events = buildTreeEvents(seed);

  const set = (n: number) => setCount(Math.max(0, Math.min(MAX_BOOKS, n)));

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setCount((c) => {
        if (c >= MAX_BOOKS) { setPlaying(false); return c; }
        return c + 1;
      });
    }, 260);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing]);

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-start gap-7 px-4 py-6 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <GardenTree bookCount={count} seed={seed} />

      <div className="flex flex-col gap-4 rounded-2xl border border-garden-line bg-garden-panel p-5 text-garden-ink">
        <h3 className="font-garden text-xl font-medium">Büyümeyi dene</h3>

        <p className="flex min-h-11 items-center gap-2.5 rounded-xl bg-garden-bg px-3 py-2.5 text-sm" aria-live="polite">
          <span className="size-2 shrink-0 rounded-full bg-garden-accent" />
          {count > 0 ? `${count}. kitap: ` : ''}
          {events[count]}
        </p>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => set(count - 1)}
            aria-label="Bir kitap çıkar"
            className="w-12 rounded-xl border border-garden-line bg-garden-bg text-xl font-semibold transition hover:bg-garden-track active:scale-95"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => set(count + 1)}
            className="flex-1 rounded-xl bg-garden-accent px-4 py-3 font-semibold text-garden-accent-ink transition hover:brightness-110 active:scale-[.98]"
          >
            + Doğrulanmış kitap ekle
          </button>
        </div>

        <label htmlFor="garden-range" className="flex justify-between text-xs uppercase tracking-wider text-garden-muted">
          Kitap sayısı <output className="font-semibold tabular-nums text-garden-ink">{count}</output>
        </label>
        <input
          id="garden-range"
          type="range"
          min={0}
          max={MAX_BOOKS}
          value={count}
          onChange={(e) => set(Number(e.target.value))}
          className="w-full accent-garden-accent"
        />

        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set(p)}
              aria-pressed={count === p}
              className="rounded-full border border-garden-line px-2.5 py-1 text-sm tabular-nums transition aria-pressed:border-garden-accent aria-pressed:bg-garden-accent aria-pressed:text-garden-accent-ink"
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            if (!playing && count >= MAX_BOOKS) setCount(0);
            setPlaying((p) => !p);
          }}
          className="rounded-xl border border-garden-line bg-garden-bg px-4 py-3 font-semibold transition hover:bg-garden-track"
        >
          {playing ? 'Durdur' : 'Büyümeyi oynat'}
        </button>
      </div>
    </div>
  );
}

/* Aynı seed için olay metinleri modelle birlikte üretilir; burada küçük bir önbellek yeterli */
const eventCache = new Map<string, string[]>();
function buildTreeEvents(seed: string) {
  let ev = eventCache.get(seed);
  if (!ev) { ev = buildTree(seed).events; eventCache.set(seed, ev); }
  return ev;
}
