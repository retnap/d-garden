'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CROWN_BOOKS,
  GROUND_Y,
  GardenTreeRenderer,
  MAX_BOOKS,
  WORLD_H,
  WORLD_W,
  buildTree,
  getProgress,
  getStage,
  readColorsFrom,
  type GardenStage,
} from '@/lib/garden-tree';

export interface GardenTreeProps {
  /** Doğrulanmış kitap sayısı (0–300). Backend'den gelen değer doğrudan buraya verilir. */
  bookCount: number;
  /**
   * Ağacın şeklini belirleyen seed. Kullanıcı ID'si verilirse her kullanıcının ağacı
   * kendine özgü olur ve her açılışta aynı kalır.
   */
  seed?: string | number;
  /** Ağacın altındaki aşama adı, mesaj ve ilerleme çubuğu */
  showDetails?: boolean;
  /**
   * Kendi arka planı ve köşe yuvarlaması olan bir kart olarak çizilir.
   * Ağacı zaten bir kartın içine koyuyorsan `false` ver.
   */
  framed?: boolean;
  /** İlk açılışta ağacı 0'dan mevcut sayıya kadar büyüterek gösterir */
  animateOnMount?: boolean;
  /** Kullanıcı yeni bir aşamaya geçtiğinde çağrılır (ilk yüklemede çağrılmaz) */
  onStageChange?: (stage: GardenStage, previous: GardenStage) => void;
  className?: string;
}

const clampCount = (n: number) =>
  Math.max(0, Math.min(MAX_BOOKS, Math.floor(Number.isFinite(n) ? n : 0)));

/** Kökler çıkana kadar zeminin altındaki boş alan kırpılır (mobilde gereksiz boşluk kalmasın) */
const viewHeightFor = (count: number) => (count > CROWN_BOOKS ? WORLD_H : GROUND_Y + 40);

export default function GardenTree({
  bookCount,
  seed,
  showDetails = true,
  framed = true,
  animateOnMount = false,
  onStageChange,
  className = '',
}: GardenTreeProps) {
  const count = clampCount(bookCount);
  const viewH = viewHeightFor(count);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GardenTreeRenderer | null>(null);
  const model = useMemo(() => buildTree(seed ?? 7), [seed]);

  /* Renderer'ı bir kez kur; görünürlük, boyut, tema ve hareket tercihini izle */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const renderer = new GardenTreeRenderer(canvas, model, {
      reducedMotion: motionQuery.matches,
      colors: readColorsFrom(canvas),
    });
    rendererRef.current = renderer;
    renderer.setViewHeight(viewH);
    renderer.resize();
    if (animateOnMount && !motionQuery.matches) {
      renderer.setBooks(0, true);
      renderer.setBooks(count);
    } else {
      renderer.setBooks(count, true);
    }

    // Ekranda değilse veya sekme arka plandaysa döngüyü durdur (mobilde pil dostu)
    let onScreen = true;
    const sync = () => (onScreen && !document.hidden ? renderer.start() : renderer.stop());
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    sync();

    const ro = new ResizeObserver(() => renderer.resize());
    ro.observe(canvas);

    const onMotion = () => renderer.setReducedMotion(motionQuery.matches);
    motionQuery.addEventListener('change', onMotion);

    // Tema değişince (sistem ya da html üzerindeki class / data-theme) renkleri yeniden oku
    const colorQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onTheme = () => requestAnimationFrame(() => renderer.setColors(readColorsFrom(canvas)));
    colorQuery.addEventListener('change', onTheme);
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });

    return () => {
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', sync);
      motionQuery.removeEventListener('change', onMotion);
      colorQuery.removeEventListener('change', onTheme);
      renderer.destroy();
      rendererRef.current = null;
    };
    // Yalnızca ilk kurulumda çalışır; sonraki değişiklikler aşağıdaki efektlerle iletilir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { rendererRef.current?.setModel(model); }, [model]);
  useEffect(() => { rendererRef.current?.setBooks(count); }, [count]);
  useEffect(() => {
    const r = rendererRef.current;
    if (!r) return;
    r.setViewHeight(viewH);
    r.resize();
  }, [viewH]);

  /* Aşama takibi ve "Yeni aşama" rozeti */
  const stage = getStage(count);
  const progress = getProgress(count);
  const prevStageRef = useRef<GardenStage | null>(null);
  const [badgeKey, setBadgeKey] = useState(0);

  useEffect(() => {
    const prev = prevStageRef.current;
    if (prev && stage.index > prev.index) {
      setBadgeKey((k) => k + 1);
      onStageChange?.(stage, prev);
    }
    prevStageRef.current = stage;
    // stage.index değiştiğinde çalışması yeterli
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.index]);

  return (
    <div
      className={`relative w-full text-center text-garden-ink ${
        framed
          ? 'rounded-[28px] bg-[radial-gradient(120%_80%_at_50%_30%,var(--garden-bg-2),var(--garden-bg))] px-2 pb-7 pt-2 sm:px-3'
          : ''
      } ${className}`}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${stage.name}: ${count} doğrulanmış kitapla büyüyen ağaç`}
        className="mx-auto block w-full max-w-[560px]"
        style={{ aspectRatio: `${WORLD_W} / ${viewH}` }}
      />

      {showDetails && (
        <div className="flex flex-col items-center px-2">
          <span
            key={badgeKey}
            aria-hidden="true"
            className={`h-6 rounded-full bg-garden-accent px-2.5 py-1 text-xs font-semibold uppercase leading-none tracking-wider text-garden-accent-ink opacity-0 ${
              badgeKey > 0 ? 'animate-garden-badge motion-reduce:animate-none motion-reduce:opacity-100' : ''
            }`}
          >
            Yeni aşama
          </span>

          <h3 className="mt-1 text-balance font-display text-[clamp(1.6rem,6vw,2.4rem)] font-semibold leading-tight tracking-tight">
            {stage.name}
          </h3>
          <p className="mt-1.5 max-w-sm text-pretty text-[15px] text-garden-muted sm:text-lg" aria-live="polite">
            {stage.message}
          </p>

          <div
            className="mt-4 h-3 w-full max-w-80 overflow-hidden rounded-full bg-garden-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress.ratio * 100)}
            aria-label={progress.label}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${
                progress.phase === 'roots' ? 'bg-garden-root' : 'bg-garden-accent'
              }`}
              style={{ width: `${progress.ratio * 100}%` }}
            />
          </div>
          <p className="mt-2.5 text-sm text-garden-muted tabular-nums sm:text-base">{progress.label}</p>
          {stage.next && (
            <p className="mt-1 text-[13px] font-medium text-garden-accent tabular-nums sm:text-sm">
              Sonraki aşamaya {stage.next.booksLeft} kitap: {stage.next.name}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
