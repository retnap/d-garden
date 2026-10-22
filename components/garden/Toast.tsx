'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheckBig, Info, X } from 'lucide-react';
import { getStage } from '@/lib/garden-tree';
import { isVerified } from '@/lib/garden/selectors';
import { getGardenData, subscribeToGardenEvents } from '@/lib/garden/store';
import { cn } from './ui';

type ToastTone = 'success' | 'error' | 'info';

export type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  action?: { label: string; onClick: () => void };
};

type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast, ToastProvider dışında kullanıldı.');
  return ctx;
}

const icons = { success: CircleCheckBig, error: CircleAlert, info: Info };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { tone: 'success', ...toast, id }]);
      timers.current.set(id, setTimeout(() => dismiss(id), toast.action ? 8000 : 5000));
    },
    [dismiss],
  );

  // Değerlendirme kullanıcı başka sayfadayken bitse bile haber ver
  useEffect(
    () =>
      subscribeToGardenEvents((event) => {
        const data = getGardenData();
        if (!data.preferences.notifyEvaluation) return;
        if (event.outcome === 'verified') {
          const verified = data.books.filter(isVerified).length;
          const stage = getStage(verified);
          const grew = getStage(verified - 1).index < stage.index;
          push({
            tone: 'success',
            title: `“${event.bookTitle}” özeti doğrulandı`,
            description: grew
              ? `Ağacın yeni bir aşamaya geçti: ${stage.name}. (Demo değerlendirme)`
              : `Ağacın ${verified} doğrulanmış kitapla büyüdü. (Demo değerlendirme)`,
          });
        } else if (event.outcome === 'needs-improvement') {
          push({
            tone: 'info',
            title: `“${event.bookTitle}” için geliştirme önerileri hazır`,
            description: 'Özetini düzenleyip yeniden gönderebilirsin. (Demo değerlendirme)',
          });
        } else {
          push({
            tone: 'error',
            title: 'Değerlendirme tamamlanamadı',
            description: `“${event.bookTitle}” özetin korunuyor; kitap sayfasından yeniden deneyebilirsin.`,
          });
        }
      }),
    [push],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-3 bottom-3 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((t) => {
          const Icon = icons[t.tone ?? 'success'];
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-white p-4 text-sm shadow-lg shadow-[#193128]/10"
            >
              <Icon
                size={19}
                aria-hidden="true"
                className={cn('mt-0.5 shrink-0', t.tone === 'error' ? 'text-[#A23B2C]' : 'text-forest')}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{t.title}</p>
                {t.description && <p className="mt-0.5 leading-5 text-ink-light">{t.description}</p>}
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action?.onClick();
                      dismiss(t.id);
                    }}
                    className="mt-2 rounded-lg font-semibold text-forest underline-offset-4 hover:underline"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Bildirimi kapat"
                className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-light hover:bg-mist"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
