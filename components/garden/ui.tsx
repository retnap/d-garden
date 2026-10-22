import Link from 'next/link';
import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  ArrowLeft,
  CircleAlert,
  CircleCheckBig,
  Clock,
  FilePenLine,
  Info,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
  READING_STATUS_LABELS,
  SUMMARY_STATUS_LABELS,
  type SummaryState,
} from '@/lib/garden/constants';
import type { ReadingStatus } from '@/lib/garden/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------- buton ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    size === 'md' ? 'min-h-11 px-5 py-2.5 text-sm' : 'min-h-9 px-3.5 py-1.5 text-sm',
    variant === 'primary' && 'bg-forest text-white hover:bg-forest-deep',
    variant === 'secondary' && 'border border-line bg-white text-forest hover:border-sage hover:bg-mist',
    variant === 'ghost' && 'text-ink-light hover:bg-mist hover:text-forest',
    variant === 'danger' && 'bg-[#A23B2C] text-white hover:bg-[#832E22]',
    className,
  );
}

/* ---------- form ---------- */

export const inputStyles =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-light/70 focus:border-forest focus:ring-2 focus:ring-mint aria-invalid:border-[#A23B2C] aria-invalid:ring-[#F6DEDA] disabled:bg-mist';

export const selectStyles = cn(inputStyles, 'appearance-none bg-white pr-9');

type FieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  error?: string;
  aside?: ReactNode;
  className?: string;
};

/** Etiketi, yardım metnini ve hata mesajını input ile ilişkilendirir. */
export function Field({ id, label, children, hint, error, aside, className }: FieldProps) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-ink-light">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-5 text-[#A23B2C]">
          <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Field ile kullanılan input'a verilecek erişilebilirlik özellikleri */
export function fieldA11y(id: string, { error, hint }: { error?: string; hint?: boolean }) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

/* ---------- sayfa yerleşimi ---------- */

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-8 sm:py-9 lg:px-10', className)}>
      {children}
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
};

export function PageHeader({ title, eyebrow, description, actions, back }: PageHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-4 inline-flex items-center gap-2 rounded-lg text-sm text-ink-light transition-colors hover:text-forest"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {back.label}
          </Link>
        )}
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-forest sm:text-sm">{eyebrow}</p>
        )}
        <h1 className="text-balance break-words font-display text-[1.75rem] leading-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-ink-light sm:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3 sm:shrink-0 sm:justify-end">{actions}</div>}
    </header>
  );
}

export function Panel({
  children,
  className,
  as: Tag = 'section',
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article';
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn('rounded-3xl border border-line bg-white p-5 sm:p-7', className)} {...rest}>
      {children}
    </Tag>
  );
}

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  hint?: string;
};

export function StatCard({ label, value, icon: Icon, href, hint }: StatCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 text-xs text-ink-light sm:text-sm">{label}</p>
        <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-mint text-forest sm:flex">
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-medium tabular-nums text-ink sm:mt-3 sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-light">{hint}</p>}
    </>
  );
  const cls = 'block min-w-0 rounded-2xl border border-line bg-white p-3.5 sm:p-5';
  return href ? (
    <Link href={href} className={cn(cls, 'transition hover:border-sage hover:shadow-sm')}>
      {body}
    </Link>
  ) : (
    <article className={cls}>{body}</article>
  );
}

/* ---------- durumlar ---------- */

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border border-dashed border-line bg-mist/60 px-5 py-12 text-center',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-mint text-forest">
        <Icon size={24} aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-xl text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-pretty text-sm leading-6 text-ink-light">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Bahçen yükleniyor…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-8 sm:py-9 lg:px-10">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded-full bg-mint motion-reduce:animate-none" />
        <div className="h-9 w-2/3 max-w-md animate-pulse rounded-xl bg-mint motion-reduce:animate-none" />
      </div>
      <div aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />
        ))}
      </div>
      <div aria-hidden="true" className="h-72 animate-pulse rounded-3xl bg-white motion-reduce:animate-none" />
    </div>
  );
}

export function ErrorState({
  title = 'Bir şeyler ters gitti',
  description,
  onRetry,
  action,
}: {
  title?: string;
  description?: ReactNode;
  onRetry?: () => void;
  action?: ReactNode;
}) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-[#F0D3CE] bg-[#FDF5F3] px-5 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#F6DEDA] text-[#A23B2C]">
        <TriangleAlert size={24} aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-xl text-ink">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-ink-light">{description}</p>}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button type="button" onClick={onRetry} className={buttonStyles()}>
            <RotateCcw size={17} aria-hidden="true" />
            Tekrar dene
          </button>
        )}
        {action}
      </div>
    </div>
  );
}

type NoticeTone = 'info' | 'success' | 'warning' | 'demo';

const noticeTones: Record<NoticeTone, { cls: string; icon: LucideIcon }> = {
  info: { cls: 'border-line bg-mist text-ink', icon: Info },
  success: { cls: 'border-[#BFDCCB] bg-[#EAF5EE] text-ink', icon: CircleCheckBig },
  warning: { cls: 'border-[#EBD9B4] bg-[#FBF5E8] text-ink', icon: TriangleAlert },
  demo: { cls: 'border-[#D9D2EA] bg-[#F5F2FB] text-ink', icon: Sparkles },
};

export function Notice({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: NoticeTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { cls, icon: Icon } = noticeTones[tone];
  return (
    <div className={cn('flex gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-6', cls, className)}>
      <Icon size={18} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-ink-light">{children}</div>}
      </div>
    </div>
  );
}

/* ---------- rozetler ---------- */

type BadgeTone = 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'violet';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'border-line bg-white text-ink-light',
  green: 'border-[#BFDCCB] bg-[#EAF5EE] text-forest',
  amber: 'border-[#EBD9B4] bg-[#FBF5E8] text-[#7A5414]',
  red: 'border-[#F0D3CE] bg-[#FDF5F3] text-[#A23B2C]',
  blue: 'border-[#C9D9E6] bg-[#EEF4F9] text-[#2D5470]',
  violet: 'border-[#D9D2EA] bg-[#F5F2FB] text-[#5B4A86]',
};

export function Badge({
  tone = 'neutral',
  icon: Icon,
  children,
  className,
}: {
  tone?: BadgeTone;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        badgeTones[tone],
        className,
      )}
    >
      {Icon && <Icon size={13} aria-hidden="true" className="shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  );
}

export function DemoBadge({ className, children = 'Örnek' }: { className?: string; children?: ReactNode }) {
  return (
    <Badge tone="violet" className={className}>
      {children}
    </Badge>
  );
}

const readingTones: Record<ReadingStatus, BadgeTone> = {
  'reading-list': 'neutral',
  reading: 'blue',
  completed: 'green',
};

export function ReadingStatusBadge({ status, className }: { status: ReadingStatus; className?: string }) {
  return (
    <Badge tone={readingTones[status]} className={className}>
      {READING_STATUS_LABELS[status]}
    </Badge>
  );
}

const summaryBadge: Record<SummaryState, { tone: BadgeTone; icon: LucideIcon }> = {
  none: { tone: 'neutral', icon: FilePenLine },
  draft: { tone: 'neutral', icon: FilePenLine },
  pending: { tone: 'amber', icon: Clock },
  evaluating: { tone: 'blue', icon: LoaderCircle },
  verified: { tone: 'green', icon: CircleCheckBig },
  'needs-improvement': { tone: 'amber', icon: Sparkles },
  failed: { tone: 'red', icon: CircleAlert },
};

export function SummaryStatusBadge({ state, className }: { state: SummaryState; className?: string }) {
  const { tone, icon } = summaryBadge[state];
  return (
    <Badge tone={tone} icon={icon} className={className}>
      {SUMMARY_STATUS_LABELS[state]}
    </Badge>
  );
}

/* ---------- ilerleme ---------- */

export function ProgressBar({
  value,
  label,
  showLabel = true,
  className,
}: {
  /** 0–1 */
  value: number;
  label: string;
  showLabel?: boolean;
  className?: string;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={label}
        className="h-2 overflow-hidden rounded-full bg-mint"
      >
        <div
          className="h-full rounded-full bg-forest transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <p className="mt-1.5 text-xs tabular-nums text-ink-light">{label}</p>}
    </div>
  );
}

/* ---------- tarih ---------- */

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
const relFmt = new Intl.RelativeTimeFormat('tr-TR', { numeric: 'auto' });

export function formatDate(iso?: string) {
  return iso ? dateFmt.format(new Date(iso)) : '—';
}

export function formatRelative(iso: string, now = Date.now()) {
  const diff = new Date(iso).getTime() - now;
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 60) return relFmt.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relFmt.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return relFmt.format(days, 'day');
  return formatDate(iso);
}
