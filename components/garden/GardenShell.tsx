'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
  BookOpen,
  Sprout,
  ListTodo,
  BookMarked,
  CheckCircle2,
  FileText,
  PenLine,
  Trophy,
  ChartNoAxesColumn,
  Settings,
  Menu,
  House,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { getGardenMetrics, type GardenMetrics } from '@/lib/garden/selectors';
import { useGardenSnapshot, type StorageHealth } from '@/lib/garden/store';
import type { Profile } from '@/lib/garden/types';
import Modal from './Modal';
import { ToastProvider } from './Toast';
import { LoadingState, cn } from './ui';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  count?: (m: GardenMetrics) => number;
};

const navigation: NavItem[] = [
  { label: 'Bahçem', href: '/garden', icon: Sprout },
  { label: 'Kitaplığım', href: '/garden/library', icon: BookOpen, count: (m) => m.totalBooks },
  { label: 'Okuma Listem', href: '/garden/reading-list', icon: ListTodo, count: (m) => m.readingList },
  { label: 'Okuyorum', href: '/garden/reading', icon: BookMarked, count: (m) => m.reading },
  { label: 'Tamamlananlar', href: '/garden/completed', icon: CheckCircle2, count: (m) => m.completed },
  { label: 'Taslaklar', href: '/garden/drafts', icon: FileText, count: (m) => m.summaryDrafts + m.workDrafts },
  { label: 'Yazılarım', href: '/garden/works', icon: PenLine, count: (m) => m.totalWorks },
  { label: 'Başarılar', href: '/garden/achievements', icon: Trophy },
  { label: 'İstatistikler', href: '/garden/statistics', icon: ChartNoAxesColumn },
  { label: 'Ayarlar', href: '/garden/settings', icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/garden' && pathname.startsWith(`${href}/`));
}

function NavLinks({
  pathname,
  metrics,
  onNavigate,
}: {
  pathname: string;
  metrics: GardenMetrics | null;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1">
      {navigation.map(({ label, href, icon: Icon, count }) => {
        const active = isActive(pathname, href);
        const value = metrics && count ? count(metrics) : null;
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-mint text-forest' : 'text-ink-light hover:bg-mist hover:text-forest',
              )}
            >
              <Icon size={19} aria-hidden="true" className="shrink-0" />
              <span className="flex-1">{label}</span>
              {value !== null && value > 0 && (
                <span
                  className={cn(
                    'min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs tabular-nums',
                    active ? 'bg-white text-forest' : 'bg-mist text-ink-light',
                  )}
                >
                  <span className="sr-only">, </span>
                  {value}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Avatar({ profile, size = 'md' }: { profile: Profile; size?: 'sm' | 'md' }) {
  const initials =
    profile.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toLocaleUpperCase('tr-TR'))
      .join('') || 'O';
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        size === 'md' ? 'size-10 text-sm' : 'size-9 text-xs',
      )}
      style={{ backgroundColor: profile.avatarColor }}
    >
      {initials}
    </span>
  );
}

function DemoBar({ storage }: { storage: StorageHealth }) {
  if (storage === 'unavailable') {
    return (
      <div role="alert" className="flex items-start gap-2 border-b border-[#EBD9B4] bg-[#FBF5E8] px-4 py-2.5 text-xs leading-5 text-ink sm:px-8 sm:text-sm">
        <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[#7A5414]" />
        <p>
          Tarayıcı depolamasına yazılamıyor (gizli pencere veya dolu depolama olabilir). Değişikliklerin yalnızca bu
          sekme açıkken korunur.
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 border-b border-[#D9D2EA] bg-[#F5F2FB] px-4 py-2 text-xs leading-5 text-ink sm:px-8">
      <Sprout size={15} aria-hidden="true" className="mt-0.5 hidden shrink-0 text-[#5B4A86] sm:block" />
      <p className="min-w-0">
        <strong className="font-semibold">Demo sürüm:</strong> Veriler yalnızca bu tarayıcıda saklanır ve AI
        değerlendirmesi simüle edilir.
        {storage === 'recovered' && ' Okunamayan eski kayıt yedeklendi; örnek verilerle başlandı.'}{' '}
        <Link href="/garden/settings#data" className="font-semibold text-[#5B4A86] underline underline-offset-2">
          Verileri yönet
        </Link>
      </p>
    </div>
  );
}

export default function GardenShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const snapshot = useGardenSnapshot();
  const [menuOpen, setMenuOpen] = useState(false);
  const metrics = snapshot ? getGardenMetrics(snapshot.data) : null;
  const currentLabel = navigation.find((n) => isActive(pathname, n.href))?.label ?? 'Bahçem';

  return (
    <ToastProvider>
      <div className="garden-app min-h-dvh bg-mist text-ink lg:flex">
        <a
          href="#garden-main"
          className="sr-only z-50 rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          İçeriğe geç
        </a>

        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">
          <Link href="/" aria-label="D-Garden ana sayfa" className="flex h-20 shrink-0 items-center gap-3 border-b border-line px-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-mint text-forest">
              <Sprout size={24} aria-hidden="true" />
            </span>
            <span className="font-display text-2xl">D-Garden</span>
          </Link>

          <nav aria-label="Bahçe navigasyonu" className="flex-1 overflow-y-auto p-4">
            <NavLinks pathname={pathname} metrics={metrics} />
          </nav>

          <div className="m-4 mt-0 rounded-2xl bg-mist p-4">
            <p className="font-display text-lg leading-snug">Her bahçe bir tohumla başlar.</p>
            <p className="mt-1.5 text-sm leading-5 text-ink-light">Oku, düşün ve kendi bahçeni büyüt.</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Bahçe menüsünü aç"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                className="-ml-2 flex size-11 items-center justify-center rounded-xl text-forest hover:bg-mist lg:hidden"
              >
                <Menu size={22} aria-hidden="true" />
              </button>
              <Link href="/" aria-label="D-Garden ana sayfa" className="flex items-center gap-2 font-display text-xl lg:hidden">
                <Sprout size={22} className="text-forest" aria-hidden="true" />
                <span className="hidden min-[380px]:inline">D-Garden</span>
              </Link>
              <span className="hidden truncate text-sm text-ink-light lg:inline">
                Kişisel bahçen <span aria-hidden="true">/</span> <span className="text-ink">{currentLabel}</span>
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/"
                className="flex min-h-10 items-center gap-2 rounded-xl px-2.5 text-sm text-ink-light transition-colors hover:bg-mist hover:text-forest"
              >
                <House size={19} aria-hidden="true" />
                <span className="hidden sm:inline">Ana sayfa</span>
              </Link>
              {snapshot && (
                <Link
                  href="/garden/settings"
                  aria-label={`Profil ve ayarlar: ${snapshot.data.profile.displayName}`}
                  className="flex items-center gap-2 rounded-full p-0.5 transition hover:ring-2 hover:ring-mint"
                >
                  <Avatar profile={snapshot.data.profile} size="sm" />
                </Link>
              )}
            </div>
          </header>

          {snapshot && <DemoBar storage={snapshot.storage} />}

          <main id="garden-main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
            {snapshot ? children : <LoadingState />}
          </main>
        </div>

        <Modal
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          title="D-Garden"
          variant="drawer"
          icon={<Sparkles size={20} aria-hidden="true" />}
          description="Kişisel bahçen"
        >
          <nav aria-label="Mobil bahçe navigasyonu">
            <NavLinks pathname={pathname} metrics={metrics} onNavigate={() => setMenuOpen(false)} />
          </nav>
        </Modal>
      </div>
    </ToastProvider>
  );
}

export { Avatar };
